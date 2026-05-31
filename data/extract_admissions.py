"""Trích xuất điểm chuẩn từ ẢNH → CSV long-format bằng Gemini (2-pass consensus).

Quy trình:
  data/admissionrequirements/images/{Code}-{ShortName}-{Year}/*.png|jpg
    → gọi Gemini 2 lần (temperature 0) với TẤT CẢ ảnh trong thư mục
    → diff theo key (Mã ngành, Phương thức, Tổ hợp)
    → validate (range điểm theo thang, tổ hợp ∈ enum)
    → ghi data/admissionrequirements/{Code}-{ShortName}-{Year}.csv
      + .review.md liệt kê ô cần review tay.

Sau khi review tay file CSV, chạy etl_admissions.py để nạp vào DB.

Dùng:
  uv run extract_admissions.py              # xử lý mọi thư mục trong images/
  uv run extract_admissions.py DLS-ULSA2-2025   # chỉ 1 thư mục
"""

import csv
import io
import os
import sys
from os.path import join, dirname

from dotenv import load_dotenv
from google import genai
from google.genai import types

from enums import EXAM_TYPE, SUBJECT_COMBINATION, DEFAULT_MAX_SCORE

load_dotenv(join(dirname(__file__), ".env"))

BASE_DIR = dirname(__file__)
IMAGES_DIR = join(BASE_DIR, "admissionrequirements", "images")
OUTPUT_DIR = join(BASE_DIR, "admissionrequirements")
PROMPT_PATH = join(BASE_DIR, "prompts", "admission_extract.txt")

HEADER = [
    "Mã trường", "Mã ngành xét tuyển", "Tên ngành", "Năm", "Chỉ tiêu",
    "Phương thức", "Tổ hợp", "Thang điểm", "Điểm",
]

MIME_BY_EXT = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}

MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.1-pro-preview")
NUM_PASSES = 2


def load_prompt(uni_code: str, year: str) -> str:
    with open(PROMPT_PATH, encoding="utf-8") as f:
        template = f.read()
    valid = ", ".join(sorted(SUBJECT_COMBINATION.keys()))
    return template.format(uni_code=uni_code, year=year, valid_combinations=valid)


def parse_folder_name(folder: str):
    """'DLS-ULSA2-2025' → (uni_code='DLS', year='2025')."""
    parts = folder.split("-")
    uni_code = parts[0].strip()
    year = parts[-1].strip()
    return uni_code, year


def load_images(folder_path: str):
    parts = []
    for name in sorted(os.listdir(folder_path)):
        ext = os.path.splitext(name)[1].lower()
        mime = MIME_BY_EXT.get(ext)
        if not mime:
            continue
        with open(join(folder_path, name), "rb") as f:
            parts.append(types.Part.from_bytes(data=f.read(), mime_type=mime))
    return parts


def call_gemini(client, prompt: str, image_parts):
    resp = client.models.generate_content(
        model=MODEL,
        contents=[prompt, *image_parts],
        config=types.GenerateContentConfig(
            temperature=0.0,
            # Độ phân giải ảnh cao → đọc bảng dày chữ / số thập phân chính xác hơn.
            media_resolution=types.MediaResolution.MEDIA_RESOLUTION_HIGH,
        ),
    )
    return resp.text or ""


def parse_csv_text(text: str):
    """Parse output Gemini → list[dict]. Bỏ rào ```csv nếu có."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else ""
        if text.rstrip().endswith("```"):
            text = text.rsplit("```", 1)[0]
    rows = []
    reader = csv.DictReader(io.StringIO(text))
    for row in reader:
        # chuẩn hoá khoảng trắng các cột header đã biết
        clean = {h: (row.get(h) or "").strip() for h in HEADER}
        if not clean["Mã ngành xét tuyển"] and not clean["Phương thức"]:
            continue
        rows.append(clean)
    return rows


def row_key(row: dict):
    return (row["Mã ngành xét tuyển"], row["Phương thức"], row["Tổ hợp"])


def validate_row(row: dict):
    """Trả về list cảnh báo cho 1 dòng (rỗng = hợp lệ)."""
    warns = []
    pt = row["Phương thức"]
    if pt not in EXAM_TYPE:
        warns.append(f"Phương thức lạ '{pt}' (chỉ chấp nhận THPTQG/ĐGNL)")

    to_hop = row["Tổ hợp"]
    if to_hop and to_hop.upper() not in SUBJECT_COMBINATION:
        warns.append(f"Tổ hợp lạ '{to_hop}' (chưa có trong enum)")
    if pt == "THPTQG" and not to_hop:
        warns.append("THPTQG thiếu tổ hợp")

    thang_raw = row["Thang điểm"] or str(DEFAULT_MAX_SCORE.get(pt, ""))
    try:
        diem = float(row["Điểm"])
    except ValueError:
        warns.append(f"Điểm không phải số: '{row['Điểm']}'")
        return warns
    try:
        thang = float(thang_raw)
    except ValueError:
        warns.append(f"Thang điểm không hợp lệ: '{row['Thang điểm']}'")
        return warns
    if not (0 <= diem <= thang):
        warns.append(f"Điểm {diem} ngoài khoảng [0, {thang:g}]")
    return warns


def merge_passes(passes):
    """Hợp nhất các pass; trả (rows, flags). flags: key → list lý do review."""
    n = len(passes)
    by_pass = [{row_key(r): r for r in p} for p in passes]

    # Thứ tự key: theo pass1 trước, rồi các key mới xuất hiện ở pass sau.
    ordered_keys = list(dict.fromkeys(k for d in by_pass for k in d))

    rows, flags = [], {}
    for key in ordered_keys:
        present = [d for d in by_pass if key in d]
        row = present[0][key]  # ưu tiên pass có key sớm nhất (thường pass1)

        if len(present) < n:
            flags.setdefault(key, []).append(f"chỉ xuất hiện ở {len(present)}/{n} lần trích")
        diem_values = {d[key]["Điểm"] for d in present}
        if len(diem_values) > 1:
            flags.setdefault(key, []).append(f"Điểm lệch giữa các lần: {sorted(diem_values)}")

        warns = validate_row(row)
        if warns:
            flags.setdefault(key, []).extend(warns)
        rows.append(row)
    return rows, flags


def write_outputs(out_csv: str, rows, flags):
    with open(out_csv, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=HEADER)
        writer.writeheader()
        writer.writerows(rows)

    review_path = out_csv.rsplit(".", 1)[0] + ".review.md"
    flagged = [(row_key_str(k), v) for k, v in flags.items()]
    if not flagged:
        if os.path.exists(review_path):
            os.remove(review_path)
        return review_path, 0
    with open(review_path, "w", encoding="utf-8") as f:
        f.write(f"# Cần review — {os.path.basename(out_csv)}\n\n")
        f.write(f"Tổng dòng: {len(rows)} — Số dòng cần review: {len(flagged)}\n\n")
        for key_str, reasons in flagged:
            f.write(f"- **{key_str}**\n")
            for r in reasons:
                f.write(f"  - {r}\n")
    return review_path, len(flagged)


def row_key_str(key):
    ma, pt, th = key
    return f"{ma} | {pt} | {th or '(không tổ hợp)'}"


def process_folder(client, folder: str):
    folder_path = join(IMAGES_DIR, folder)
    uni_code, year = parse_folder_name(folder)
    image_parts = load_images(folder_path)
    if not image_parts:
        print(f"  SKIP '{folder}' — không có ảnh")
        return

    prompt = load_prompt(uni_code, year)
    print(f"  '{folder}': {len(image_parts)} ảnh → gọi Gemini {NUM_PASSES} lần ({MODEL})...")
    passes = []
    for i in range(NUM_PASSES):
        text = call_gemini(client, prompt, image_parts)
        rows = parse_csv_text(text)
        print(f"    pass {i + 1}: {len(rows)} dòng")
        passes.append(rows)

    rows, flags = merge_passes(passes)
    out_csv = join(OUTPUT_DIR, f"{folder}.csv")
    review_path, n_flag = write_outputs(out_csv, rows, flags)
    print(f"    → {os.path.relpath(out_csv, BASE_DIR)} ({len(rows)} dòng)")
    if n_flag:
        print(f"    ⚠ {n_flag} dòng cần review: {os.path.relpath(review_path, BASE_DIR)}")
    else:
        print("    ✓ không có dòng cần review")


def run():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit("Thiếu GEMINI_API_KEY trong .env")
    client = genai.Client(api_key=api_key)

    if not os.path.isdir(IMAGES_DIR):
        sys.exit(f"Không thấy thư mục ảnh: {IMAGES_DIR}")

    targets = sys.argv[1:] or sorted(
        d for d in os.listdir(IMAGES_DIR) if os.path.isdir(join(IMAGES_DIR, d))
    )
    if not targets:
        sys.exit(f"Không có thư mục con nào trong {IMAGES_DIR}")

    print(f"Xử lý {len(targets)} thư mục:")
    for folder in targets:
        process_folder(client, folder)


if __name__ == "__main__":
    run()
