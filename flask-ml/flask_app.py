from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

""" model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl") """

@app.route("/predict", methods=["GET"])
def predict():
    return jsonify({"prediction": "SIU1234"})
