from flask import Flask, request, jsonify
import joblib
import spacy

app = Flask(__name__)

""" model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl") """

nlp = spacy.load("en_core_web_sm", disable=["parser", "ner"])

def clean_with_spacy_pipe(text):
    doc = nlp(text)
    tokens = [
        token.lemma_.lower() for token in doc 
        if not token.is_stop           
        and not token.is_punct  
        and token.lemma_ != '-PRON-' 
        and not token.is_space 
    ]
    return " ".join(tokens)

@app.route("/predict", methods=["GET"])
def predict():
    # add preprocessing here
    return jsonify({"prediction": "SIU1234"})
