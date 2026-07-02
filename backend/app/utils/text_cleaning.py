import unicodedata
import re


def normalize(text: str) -> str:
    if not text:
        return ""
    text = text.lower().strip()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def parse_list(value: str, sep: str = "|") -> list[str]:
    if not value:
        return []
    parts = value.split(sep)
    return [normalize(p) for p in parts if p.strip()]


def list_to_string(items: list[str], sep: str = "|") -> str:
    return sep.join(items)
