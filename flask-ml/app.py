from flask import Flask, request, jsonify
import joblib
import spacy
from utils.preprocess import clean_with_spacy_pipe

app = Flask(__name__)

""" model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl") """

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    if not data or "news" not in data:
        return jsonify({"error": "Missing 'news' in request body"}), 400

    raw_text = data["news"]
    cleaned_text = clean_with_spacy_pipe(raw_text)

    # Example placeholder response - replace later
    # vector = vectorizer.transform([cleaned_text])
    # prediction = model.predict(vector)[0]

    return jsonify({
        "cleaned_news": cleaned_text,
        "prediction": True
    })
