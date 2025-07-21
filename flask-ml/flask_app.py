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
