"""URL-friendly ASCII slugs for Vietnamese university names.

Must stay consistent with the C# implementation in
server/TimTruong.ApiService/Utils/SlugGenerator.cs.

Example: slugify("Đại học Khoa học Tự nhiên", "HCMUS")
         -> "dai-hoc-khoa-hoc-tu-nhien-hcmus"
"""
import re
import unicodedata


def slugify(name: str, short_name: str | None = None) -> str:
    text = name if not short_name else f"{name} {short_name}"
    text = text.lower().replace("đ", "d")
    # Decompose accents and drop combining diacritic marks (category "Mn").
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = unicodedata.normalize("NFC", text)
    # Any run of non-alphanumeric chars becomes a single hyphen.
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text
