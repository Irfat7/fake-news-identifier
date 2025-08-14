from flask import Flask, request, jsonify
import joblib
from utils.preprocess import clean_with_spacy_pipe
from train_model import run_training
from middlewares.authMiddleware import token_required
from utils.preprocess import is_gibberish_spacy

app = Flask(__name__)

model = joblib.load("./model/fake_news_model.pkl")
vectorizer = joblib.load("./model/tfidf_vectorizer.pkl")


@app.route("/health")
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/predict", methods=["POST"])
@token_required
def predict():
    if not request.is_json:
        return (
            jsonify({"status": 415, "error": "Content-Type must be application/json"}),
            415,
        )

    data = request.get_json()
    if not data or "news" not in data:
        return jsonify({"status": 400, "error": "Missing 'news' in request body"}), 400

    raw_text = data["news"]
    if is_gibberish_spacy(raw_text):
        return (
            jsonify({"status": 400, "error": "Input seems to be gibberish or invalid"}),
            400,
        )
    cleaned_text = clean_with_spacy_pipe(raw_text)

    vector = vectorizer.transform([cleaned_text])
    prediction = model.predict(vector)[0]

    return jsonify({"cleaned_news": cleaned_text, "prediction": int(prediction)})


@app.route("/train", methods=["POST"])
def trigger_training():
    success = run_training()
    if success:
        return jsonify({"message": "Training completed."}), 200
    return jsonify({"message": "Training not done (conditions not met)."}), 200
