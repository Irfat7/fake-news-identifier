import joblib
import os
import numpy as np
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from utils.preprocess import clean_with_spacy_pipe

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

# Paths
model_path = "./model/fake_news_model.pkl"
vec_path = "./model/tfidf_vectorizer.pkl"

# If model/vectorizer not found, skip training
if not os.path.exists(model_path) or not os.path.exists(vec_path):
    print("❌ Model or vectorizer not found. Skipping training.")
    exit()

# Load only unused feedback
with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT f."userId", f."newsId", n.news, f.label
        FROM feedbacks f
        JOIN news n ON f."newsId" = n."id"
        WHERE f.used_in_training = false
    """))
    rows = result.fetchall()

if not rows:
    print("ℹ️ No new feedback to train on. Exiting.")
    exit()

# Preprocess text
texts = [clean_with_spacy_pipe(row[2]) for row in rows]
labels = [1 if row[3] else 0 for row in rows]

# Load model/vectorizer
model = joblib.load(model_path)
vectorizer = joblib.load(vec_path)
print("🔁 Loaded previous model and vectorizer.")

X = vectorizer.transform(texts)
model.partial_fit(X, labels)

# Save updated model
joblib.dump(model, model_path)
joblib.dump(vectorizer, vec_path)
print("✅ Model updated and saved.")

# Mark feedbacks as used
with engine.begin() as conn:
    for row in rows:
        conn.execute(text("""
            UPDATE feedbacks
            SET used_in_training = true
            WHERE "userId" = :user_id AND "newsId" = :news_id
        """), {"user_id": row[0], "news_id": row[1]})

print("✅ Feedbacks marked as used.")