import joblib
from sqlalchemy import create_engine, text
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from utils.preprocess import clean_with_spacy_pipe
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

# Load feedback + news data
with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT n.news, f.label
        FROM feedbacks f
        JOIN news n ON f."newsId" = n."id"
    """))
    rows = result.fetchall()

print(rows)

""" #texts = [clean_with_spacy_pipe(row[0]) for row in rows]
labels = [row[1] for row in rows]

# Train model
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)
model = LogisticRegression()
model.fit(X, labels)

# Save updated model and vectorizer
joblib.dump(model, "model/model.pkl")
joblib.dump(vectorizer, "model/vectorizer.pkl") """

print("✅ Model retrained and saved.")