"""Trích xuất điểm chuẩn từ ẢNH → CSV long-format bằng Vision-LLM (2-pass consensus).

Provider chọn qua env LLM_PROVIDER (gemini | openai-compatible) — xem vision.py.

Quy trình:
  data/admissionrequirements/images/{Code}-{ShortName}-{Year}/*.png|jpg
    → gọi model 2 lần (temperature 0) với TẤT CẢ ảnh trong thư mục
    → model trả JSON array (an toàn với dấu phẩy trong tên ngành); MÌNH tự ghi CSV
    → diff theo key (Mã ngành, Phương thức, Tổ hợp)
    → validate (range điểm theo thang, tổ hợp ∈ enum)
    → ghi data/admissionrequirements/{Code}-{ShortName}-{Year}.csv
      + .review.md liệt kê ô cần review tay.

Năm KHÔNG nằm trong CSV (suy từ tên file lúc ETL). Sau khi review tay file CSV,
chạy etl_admissions.py để nạp vào DB.

Dùng:
  uv run extract_admissions.py                                    # xử lý mọi thư mục trong images/
  uv run extract_admissions.py QST-HCMUS-2025                     # chỉ 1 thư mục
  uv run extract_admissions.py QST-HCMUS-2025 --note "cột cuối là ĐGNL, bỏ dòng Tổng"
"""

import argparse
import csv
import json
import os
import sys
from os.path import join, dirname

from dotenv import load_dotenv

import vision
from enums import EXAM_TYPE, SUBJECT_COMBINATION, DEFAULT_MAX_SCORE

load_dotenv(join(dirname(__file__), ".env"))

BASE_DIR = dirname(__file__)
IMAGES_DIR = join(BASE_DIR, "admissionrequirements", "images")
OUTPUT_DIR = join(BASE_DIR, "admissionrequirements")
PROMPT_PATH = join(BASE_DIR, "prompts", "admission_extract.txt")

# Tên cột CSV (tiếng Anh, đồng bộ với etl_majors / etl_major_years / etl_admissions).
COL_UNI = "UniversityCode"
COL_CODE = "MajorCode"
COL_NAME = "MajorName"
COL_METHOD = "Method"
COL_COMBO = "SubjectCombination"
COL_MAXSCORE = "MaxScore"
COL_SCORE = "Score"

# Header CSV (Năm + Chỉ tiêu đã bỏ; Năm suy từ tên file, Chỉ tiêu ETL riêng sau).
HEADER = [COL_UNI, COL_CODE, COL_NAME, COL_METHOD, COL_COMBO, COL_MAXSCORE, COL_SCORE]

# Khoá JSON model trả về → cột CSV tương ứng.
JSON_TO_COL = {
    "ma_nganh": COL_CODE,
    "ten_nganh": COL_NAME,
    "phuong_thuc": COL_METHOD,
    "to_hop": COL_COMBO,
    "thang_diem": COL_MAXSCORE,
    "diem": COL_SCORE,
}

MIME_BY_EXT = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}

NUM_PASSES = 2


def load_prompt(uni_code: str, extra: str = "") -> str:
    with open(PROMPT_PATH, encoding="utf-8") as f:
        template = f.read()
    valid = ", ".join(sorted(SUBJECT_COMBINATION.keys()))
    extra_block = ""
    if extra.strip():
        extra_block = "\nHƯỚNG DẪN RIÊNG CHO TRƯỜNG NÀY (ưu tiên tuân theo):\n" + extra.strip() + "\n"
    return template.format(uni_code=uni_code, valid_combinations=valid, extra_instructions=extra_block)


def parse_uni_code(folder: str) -> str:
    """'QST-HCMUS-2025' → 'QST' (phần đầu trước dấu '-')."""
    return folder.split("-", 1)[0].strip()


def load_images(folder_path: str):
    """Trả list ảnh dạng provider-neutral: [{"data": bytes, "mime": str}, ...]."""
    images = []
    for name in sorted(os.listdir(folder_path)):
        ext = os.path.splitext(name)[1].lower()
        mime = MIME_BY_EXT.get(ext)
        if not mime:
            continue
        with open(join(folder_path, name), "rb") as f:
            images.append({"data": f.read(), "mime": mime})
    return images


def _to_str(value) -> str:
    """Số nguyên-thực (30, 1200.0) → '30'/'1200'; còn lại str() thẳng."""
    if isinstance(value, bool):
        return str(value)
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    if value is None:
        return ""
    return str(value).strip()


def parse_json_text(text: str, uni_code: str):
    """Parse JSON array model trả về → list[dict] theo HEADER."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else ""
        if text.rstrip().endswith("```"):
            text = text.rsplit("```", 1)[0]
    data = json.loads(text)
    rows = []
    for obj in data:
        row = {COL_UNI: uni_code}
        for jkey, col in JSON_TO_COL.items():
            row[col] = _to_str(obj.get(jkey))
        if not row[COL_CODE] and not row[COL_METHOD]:
            continue
        rows.append(row)
    return rows


def row_key(row: dict):
    return (row[COL_CODE], row[COL_METHOD], row[COL_COMBO])


def validate_row(row: dict):
    """Trả về list cảnh báo cho 1 dòng (rỗng = hợp lệ)."""
    warns = []
    pt = row[COL_METHOD]
    if pt not in EXAM_TYPE:
        warns.append(f"Phương thức lạ '{pt}' (chỉ chấp nhận THPTQG/ĐGNL)")

    to_hop = row[COL_COMBO]
    if to_hop and to_hop.upper() not in SUBJECT_COMBINATION:
        warns.append(f"Tổ hợp lạ '{to_hop}' (chưa có trong enum)")
    if pt == "THPTQG" and not to_hop:
        warns.append("THPTQG thiếu tổ hợp")

    thang_raw = row[COL_MAXSCORE] or str(DEFAULT_MAX_SCORE.get(pt, ""))
    if not row[COL_SCORE]:
        warns.append("thiếu Điểm")
        return warns
    try:
        diem = float(row[COL_SCORE])
    except ValueError:
        warns.append(f"Điểm không phải số: '{row[COL_SCORE]}'")
        return warns
    try:
        thang = float(thang_raw)
    except ValueError:
        warns.append(f"Thang điểm không hợp lệ: '{row[COL_MAXSCORE]}'")
        return warns
    if not (0 <= diem <= thang):
        warns.append(f"Điểm {diem:g} ngoài khoảng [0, {thang:g}]")
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
        diem_values = {d[key][COL_SCORE] for d in present}
        if len(diem_values) > 1:
            flags.setdefault(key, []).append(f"Điểm lệch giữa các lần: {sorted(diem_values)}")

        warns = validate_row(row)
        if warns:
            flags.setdefault(key, []).extend(warns)
        rows.append(row)
    return rows, flags


def row_key_str(key):
    ma, pt, th = key
    return f"{ma} | {pt} | {th or '(không tổ hợp)'}"


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


def process_folder(folder: str, note: str = ""):
    folder_path = join(IMAGES_DIR, folder)
    uni_code = parse_uni_code(folder)
    images = load_images(folder_path)
    if not images:
        print(f"  SKIP '{folder}' — không có ảnh")
        return

    prompt = load_prompt(uni_code, note)
    note_msg = " + hướng dẫn riêng" if note else ""
    print(f"  '{folder}' (mã {uni_code}): {len(images)} ảnh{note_msg} → gọi model {NUM_PASSES} lần ({vision.active_model()})...")
    passes = []
    for i in range(NUM_PASSES):
        text = vision.call_model(prompt, images)
        try:
            rows = parse_json_text(text, uni_code)
        except (json.JSONDecodeError, TypeError) as e:
            print(f"    pass {i + 1}: LỖI parse JSON ({e}); bỏ qua pass này")
            continue
        print(f"    pass {i + 1}: {len(rows)} dòng")
        passes.append(rows)

    if not passes:
        print(f"  SKIP '{folder}' — không pass nào parse được")
        return

    rows, flags = merge_passes(passes)
    out_csv = join(OUTPUT_DIR, f"{folder}.csv")
    review_path, n_flag = write_outputs(out_csv, rows, flags)
    print(f"    → {os.path.relpath(out_csv, BASE_DIR)} ({len(rows)} dòng)")
    if n_flag:
        print(f"    ⚠ {n_flag} dòng cần review: {os.path.relpath(review_path, BASE_DIR)}")
    else:
        print("    ✓ không có dòng cần review")


def run():
    parser = argparse.ArgumentParser(
        description="Trích xuất điểm chuẩn từ ảnh → CSV bằng Vision-LLM (2-pass). Provider qua LLM_PROVIDER.",
    )
    parser.add_argument(
        "folders", nargs="*",
        help="tên thư mục trong images/ cần xử lý (vd QST-HCMUS-2025); bỏ trống = xử lý tất cả",
    )
    parser.add_argument(
        "-n", "--note", default="",
        help="hướng dẫn riêng nối vào prompt cho lần chạy này (vd 'cột cuối là ĐGNL, bỏ dòng Tổng')",
    )
    args = parser.parse_args()

    vision.validate_env()

    if not os.path.isdir(IMAGES_DIR):
        sys.exit(f"Không thấy thư mục ảnh: {IMAGES_DIR}")

    targets = args.folders or sorted(
        d for d in os.listdir(IMAGES_DIR) if os.path.isdir(join(IMAGES_DIR, d))
    )
    if not targets:
        sys.exit(f"Không có thư mục con nào trong {IMAGES_DIR}")

    if args.note and len(targets) > 1:
        print("  (lưu ý: --note áp dụng cho TẤT CẢ thư mục trong lần chạy này)")
    print(f"Xử lý {len(targets)} thư mục:")
    for folder in targets:
        process_folder(folder, args.note)


if __name__ == "__main__":
    run()
