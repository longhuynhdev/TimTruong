"""Lớp gọi Vision-LLM độc lập provider, dùng bởi extract_admissions.py.

Chọn provider qua env `LLM_PROVIDER`:
  - "gemini" (mặc định): SDK google-genai, tận dụng media_resolution=HIGH (đọc bảng
    dày chữ / số thập phân chính xác hơn). Cần GEMINI_API_KEY, GEMINI_MODEL.
  - "openai": SDK openai cho MỌI endpoint OpenAI-compatible (OpenRouter, OpenCode, ...).
    Cần OPENAI_API_KEY, OPENAI_BASE_URL (vd https://openrouter.ai/api/v1), OPENAI_MODEL.

Mọi provider nhận cùng input: prompt (str) + images (list các {"data": bytes, "mime": str})
và trả về JSON text (string). Phần parse/validate/ghi CSV nằm ở extract_admissions.py,
hoàn toàn không phụ thuộc provider.

Thêm provider mới = thêm 1 hàm _call_<x> + 1 nhánh trong call_model/active_model/validate_env.
"""

import base64
import os

TEMPERATURE = 0.0

# Cache client theo provider để khỏi khởi tạo lại mỗi lần gọi (2 pass × N trường).
_clients = {}


def _provider() -> str:
    return os.environ.get("LLM_PROVIDER", "gemini").strip().lower()


# ── Gemini ────────────────────────────────────────────────────────────────────
def _gemini_client():
    if "gemini" not in _clients:
        from google import genai

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise SystemExit("Thiếu GEMINI_API_KEY trong .env (LLM_PROVIDER=gemini)")
        _clients["gemini"] = genai.Client(api_key=api_key)
    return _clients["gemini"]


def _gemini_model() -> str:
    return os.environ.get("GEMINI_MODEL", "gemini-3.1-pro-preview")


def _call_gemini(prompt: str, images) -> str:
    from google.genai import types

    client = _gemini_client()
    parts = [types.Part.from_bytes(data=img["data"], mime_type=img["mime"]) for img in images]
    resp = client.models.generate_content(
        model=_gemini_model(),
        contents=[prompt, *parts],
        config=types.GenerateContentConfig(
            temperature=TEMPERATURE,
            response_mime_type="application/json",
            media_resolution=types.MediaResolution.MEDIA_RESOLUTION_HIGH,
        ),
    )
    return resp.text or ""


# ── OpenAI-compatible (OpenRouter / OpenCode / ...) ────────────────────────────
def _openai_client():
    if "openai" not in _clients:
        from openai import OpenAI

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise SystemExit("Thiếu OPENAI_API_KEY trong .env (LLM_PROVIDER=openai)")
        # base_url None → endpoint mặc định của OpenAI; set để trỏ OpenRouter/OpenCode.
        _clients["openai"] = OpenAI(api_key=api_key, base_url=os.environ.get("OPENAI_BASE_URL") or None)
    return _clients["openai"]


def _openai_model() -> str:
    return os.environ.get("OPENAI_MODEL", "google/gemini-2.5-flash")


def _call_openai(prompt: str, images) -> str:
    client = _openai_client()
    content = [{"type": "text", "text": prompt}]
    for img in images:
        b64 = base64.b64encode(img["data"]).decode()
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:{img['mime']};base64,{b64}"},
        })
    # KHÔNG ép response_format=json_object: nhiều model qua OpenRouter không hỗ trợ,
    # và prompt yêu cầu JSON *array* (json_object bắt buộc top-level là object).
    # extract_admissions.parse_json_text đã tự bóc ``` fences nếu model lỡ bọc.
    resp = client.chat.completions.create(
        model=_openai_model(),
        temperature=TEMPERATURE,
        messages=[{"role": "user", "content": content}],
    )
    return resp.choices[0].message.content or ""


# ── API công khai ──────────────────────────────────────────────────────────────
_DISPATCH = {"gemini": _call_gemini, "openai": _call_openai}


def call_model(prompt: str, images) -> str:
    """Gọi Vision-LLM của provider đang chọn, trả JSON text."""
    fn = _DISPATCH.get(_provider())
    if fn is None:
        raise SystemExit(f"LLM_PROVIDER không hỗ trợ: '{_provider()}' (chọn: {', '.join(_DISPATCH)})")
    return fn(prompt, images)


def active_model() -> str:
    """Nhãn ngắn cho log, vd 'gemini:gemini-3.1-pro-preview'."""
    p = _provider()
    if p == "gemini":
        return f"gemini:{_gemini_model()}"
    if p == "openai":
        base = os.environ.get("OPENAI_BASE_URL") or "api.openai.com"
        return f"openai:{_openai_model()} @ {base}"
    return p


def validate_env():
    """Kiểm tra sớm provider hợp lệ + có API key, để fail trước khi nạp ảnh."""
    p = _provider()
    if p not in _DISPATCH:
        raise SystemExit(f"LLM_PROVIDER không hỗ trợ: '{p}' (chọn: {', '.join(_DISPATCH)})")
    if p == "gemini":
        _gemini_client()
    elif p == "openai":
        _openai_client()
