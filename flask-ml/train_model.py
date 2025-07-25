# train_model.py
import joblib
import os
import numpy as np
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from utils.preprocess import clean_with_spacy_pipe
import datetime

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def run_training():
    today = datetime.datetime.now().weekday()
    if today != 5:
        print("❌ Not training day. Today is not Saturday.")
        return False

    with engine.connect() as conn:
        count_result = conn.execute(text("SELECT COUNT(*) FROM feedbacks WHERE used_in_training = false"))
        count = count_result.scalar()
        MIN_FEEDBACK = 20
        if count < MIN_FEEDBACK:
            print(f"❌ Not enough feedbacks to train. Found: {count}, required: {MIN_FEEDBACK}")
            return False

    model_path = "./model/fake_news_model.pkl"
    vec_path = "./model/tfidf_vectorizer.pkl"

    if not os.path.exists(model_path) or not os.path.exists(vec_path):
        print("❌ Model or vectorizer not found. Skipping training.")
        return False

    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT f."userId", f."newsId", n.news, f.label
                FROM feedbacks f
                JOIN news n ON f."newsId" = n."id"
                WHERE f.used_in_training = false
            """)
        )
        rows = result.fetchall()

    if not rows:
        print("ℹ️ No new feedback to train on. Exiting.")
        return False

    texts = [clean_with_spacy_pipe(row[2]) for row in rows]
    labels = [1 if row[3] else 0 for row in rows]

    model = joblib.load(model_path)
    vectorizer = joblib.load(vec_path)
    print("🔁 Loaded previous model and vectorizer.")

    X = vectorizer.transform(texts)
    model.partial_fit(X, labels)

    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vec_path)
    print("✅ Model updated and saved.")

    with engine.begin() as conn:
        for row in rows:
            conn.execute(
                text("""
                    UPDATE feedbacks
                    SET used_in_training = true
                    WHERE "userId" = :user_id AND "newsId" = :news_id
                """),
                {"user_id": row[0], "news_id": row[1]},
            )

    print("✅ Feedbacks marked as used.")
    return True

if __name__ == "__main__":
    run_training()
