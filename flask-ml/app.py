from flask import Flask, request, jsonify
import joblib
from utils.preprocess import clean_with_spacy_pipe
from train_model import run_training

app = Flask(__name__)

model = joblib.load("./model/fake_news_model.pkl")
vectorizer = joblib.load("./model/tfidf_vectorizer.pkl")


@app.route("/predict", methods=["POST"])
def predict():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415

    data = request.get_json()
    if not data or "news" not in data:
        return jsonify({"error": "Missing 'news' in request body"}), 400

    raw_text = data["news"]
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
