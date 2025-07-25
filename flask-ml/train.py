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

# Load feedback + news data
with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT n.news, f.label
        FROM feedbacks f
        JOIN news n ON f."newsId" = n."id"
    """))
    rows = result.fetchall()

texts = [clean_with_spacy_pipe(row[0]) for row in rows]
labels = [0 if row[1] == False else 1 for row in rows]


# Load model/vectorizer
model = joblib.load(model_path)
vectorizer = joblib.load(vec_path)
print("🔁 Loaded previous model and vectorizer.")

X = vectorizer.transform(texts)
model.partial_fit(X, labels)

# Save updated model and vectorizer
joblib.dump(model, model_path)
joblib.dump(vectorizer, vec_path)

print("✅ Model updated and saved.")