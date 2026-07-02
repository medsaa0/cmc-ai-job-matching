from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.utils.text_cleaning import normalize

_vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)


def compute_tfidf_similarity(text_a: str, text_b: str) -> float:
    a = normalize(text_a or "")
    b = normalize(text_b or "")
    if not a or not b:
        return 0.0
    try:
        matrix = _vectorizer.fit_transform([a, b])
        score = cosine_similarity(matrix[0], matrix[1])[0][0]
        return round(float(score) * 100, 2)
    except Exception:
        return 0.0
