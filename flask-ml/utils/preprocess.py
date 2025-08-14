import spacy

nlp = spacy.load("en_core_web_sm", disable=["parser", "ner"])


def clean_with_spacy_pipe(text):
    doc = nlp(text)
    tokens = [
        token.lemma_.lower()
        for token in doc
        if not token.is_stop
        and not token.is_punct
        and token.lemma_ != "-PRON-"
        and not token.is_space
    ]
    return " ".join(tokens)


def is_gibberish_spacy(text, min_word_ratio=0.5):
    doc = nlp(text)

    # Keep only alphabetic tokens
    tokens = [token for token in doc if token.is_alpha]
    if not tokens:
        return True  # All numbers/punctuation

    # Count tokens that are in the vocab (known words)
    known_tokens = [token for token in tokens if token.is_oov == False]

    ratio = len(known_tokens) / len(tokens)
    return ratio < min_word_ratio