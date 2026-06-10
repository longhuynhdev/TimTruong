import argparse
import csv
import glob
import json
import os
import re
import sys
from os.path import basename, dirname, join

import vision

BASE_DIR = dirname(__file__)
SCHOOLS_DIR = join(BASE_DIR, "data", "schools")

MIME_BY_EXT = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
}

NUM_PASSES = 2


# ── Prompt ──────────────────────────────────────────────────────────────────────
def build_extra_block(extra: str) -> str:
    """Đoạn 'HƯỚNG DẪN RIÊNG' nối vào prompt (rỗng nếu không có note)."""
    if not extra.strip():
        return ""
    return (
        "\nHƯỚNG DẪN RIÊNG CHO TRƯỜNG ĐẠI HỌC NÀY (ưu tiên tuân theo):\n"
        + extra.strip()
        + "\n"
    )


def load_prompt(prompt_path: str, **fmt) -> str:
    """Đọc template prompt rồi .format(**fmt). Các khoá tuỳ script (uni_code, ...)."""
    with open(prompt_path, encoding="utf-8") as f:
        return f.read().format(**fmt)


# ── Định vị (trường, năm) ───────────────────────────────────────────────────────
def parse_uni_code(school_folder: str) -> str:
    """'QST-HCMUS' → 'QST' (phần đầu trước dấu '-')."""
    return school_folder.split("-", 1)[0].strip()


def discover_targets(category: str):
    """Mọi thư mục {category}/{Year} có images/ → list đường dẫn thư mục năm (đã sort)."""
    pattern = join(SCHOOLS_DIR, "*", category, "*", "images")
    return sorted(dirname(p) for p in glob.glob(pattern))


def resolve_targets(args_list, category: str):
    """CLI args → list thư mục năm. 1 trường-năm: 'QST-HCMUS/2025' hoặc 'QST-HCMUS-2025';
    'QST-HCMUS' = mọi năm. Bỏ trống = tất cả (discover_targets)."""
    if not args_list:
        return discover_targets(category)
    targets = []
    for raw in args_list:
        spec = raw.strip().strip("/")
        school = year = None
        if "/" in spec:
            school, year = spec.split("/", 1)
        else:
            # 'QST-HCMUS-2025' → (trường 'QST-HCMUS', năm '2025') nếu path tồn tại;
            m = re.match(r"^(.+)-(\d{4})$", spec)
            if m and os.path.isdir(
                join(SCHOOLS_DIR, m.group(1), category, m.group(2), "images")
            ):
                school, year = m.group(1), m.group(2)
        if school is not None:
            year_dir = join(SCHOOLS_DIR, school, category, year)
            if os.path.isdir(join(year_dir, "images")):
                targets.append(year_dir)
            else:
                print(f"  SKIP '{spec}' — không thấy {school}/{category}/{year}/images/")
        else:
            pattern = join(SCHOOLS_DIR, spec, category, "*", "images")
            found = sorted(dirname(p) for p in glob.glob(pattern))
            if found:
                targets.extend(found)
            else:
                print(
                    f"  SKIP '{spec}' — không thấy năm nào có images/ (dùng SCHOOL/YEAR, SCHOOL-YEAR hoặc SCHOOL)"
                )
    return targets


def school_of(year_dir: str) -> str:
    """'.../schools/QST-HCMUS/admissions/2025' → 'QST-HCMUS'."""
    return basename(dirname(dirname(year_dir)))


def target_label(year_dir: str) -> str:
    """'.../schools/QST-HCMUS/admissions/2025' → 'QST-HCMUS/2025'."""
    return f"{school_of(year_dir)}/{basename(year_dir)}"


def output_csv_path(year_dir: str, category: str) -> str:
    """Đường dẫn CSV output tự mô tả: '{School}-{Category}-{Year}.csv' trong thư mục năm.
    Vd '.../majors/2026' + 'majors' → '.../majors/2026/QSC-UIT-Majors-2026.csv'."""
    return join(year_dir, f"{school_of(year_dir)}-{category.capitalize()}-{basename(year_dir)}.csv")


# ── Ảnh ─────────────────────────────────────────────────────────────────────────
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


# ── Parse JSON model trả về ─────────────────────────────────────────────────────
def to_str(value) -> str:
    """Số nguyên-thực (30, 1200.0) → '30'/'1200'; None → ''; còn lại str().strip()."""
    if isinstance(value, bool):
        return str(value)
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    if value is None:
        return ""
    return str(value).strip()


def parse_json_text(text: str, uni_code: str, col_uni: str, json_to_col: dict, keep_pred):
    """Parse JSON array model trả về → list[dict]. keep_pred(row) quyết định giữ/bỏ dòng."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else ""
        if text.rstrip().endswith("```"):
            text = text.rsplit("```", 1)[0]
    data = json.loads(text)
    rows = []
    for obj in data:
        row = {col_uni: uni_code}
        for jkey, col in json_to_col.items():
            row[col] = to_str(obj.get(jkey))
        if not keep_pred(row):
            continue
        rows.append(row)
    return rows


# ── Hợp nhất các pass ────────────────────────────────────────────────────────────
def merge_passes(passes, key_fn, validate_fn, diverge_fields):
    """Hợp nhất các pass; trả (rows, flags). flags: key → list lý do review.

    - key_fn(row) → khoá định danh dòng (tuple).
    - validate_fn(row) → list cảnh báo (rỗng = hợp lệ).
    - diverge_fields → list cột cần cảnh báo khi giá trị lệch giữa các pass.
    """
    n = len(passes)
    by_pass = [{key_fn(r): r for r in p} for p in passes]

    # Thứ tự key: theo pass1 trước, rồi các key mới xuất hiện ở pass sau.
    ordered_keys = list(dict.fromkeys(k for d in by_pass for k in d))

    rows, flags = [], {}
    for key in ordered_keys:
        present = [d for d in by_pass if key in d]
        row = present[0][key]  # ưu tiên pass có key sớm nhất (thường pass1)

        if len(present) < n:
            flags.setdefault(key, []).append(f"chỉ xuất hiện ở {len(present)}/{n} lần trích")
        for col in diverge_fields:
            values = {d[key][col] for d in present}
            if len(values) > 1:
                flags.setdefault(key, []).append(f"{col} lệch giữa các lần: {sorted(values)}")

        warns = validate_fn(row)
        if warns:
            flags.setdefault(key, []).extend(warns)
        rows.append(row)
    return rows, flags


# ── Ghi output ──────────────────────────────────────────────────────────────────
def row_key_str(key) -> str:
    """Khoá tuple → chuỗi hiển thị trong file review."""
    return " | ".join(part or "(trống)" for part in key)


def write_outputs(out_csv: str, rows, flags, header, key_str_fn=row_key_str):
    with open(out_csv, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=header)
        writer.writeheader()
        writer.writerows(rows)

    review_path = out_csv.rsplit(".", 1)[0] + ".review.md"
    flagged = [(key_str_fn(k), v) for k, v in flags.items()]
    if not flagged:
        if os.path.exists(review_path):
            os.remove(review_path)
        return review_path, 0
    with open(review_path, "w", encoding="utf-8") as f:
        f.write(f"# Cần review — {basename(out_csv)}\n\n")
        f.write(f"Tổng dòng: {len(rows)} — Số dòng cần review: {len(flagged)}\n\n")
        for key_str, reasons in flagged:
            f.write(f"- **{key_str}**\n")
            for r in reasons:
                f.write(f"  - {r}\n")
    return review_path, len(flagged)


def confirm_overwrite(out_csv: str, label: str, assume_yes: bool) -> bool:
    """True = được phép ghi. Nếu file đã tồn tại và không --yes: hỏi y/n (mặc định N)."""
    if assume_yes or not os.path.exists(out_csv):
        return True
    rel = os.path.relpath(out_csv, BASE_DIR)
    try:
        ans = input(f"  '{label}': {rel} đã tồn tại — ghi đè? [y/N] ").strip().lower()
    except EOFError:
        ans = ""
    return ans in ("y", "yes")


# ── CLI ─────────────────────────────────────────────────────────────────────────
def run_cli(category, description, targets_help, note_help, process_target):
    """Khung CLI chung: argparse + validate_env + resolve_targets + vòng lặp process_target."""
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("targets", nargs="*", help=targets_help)
    parser.add_argument("-n", "--note", default="", help=note_help)
    parser.add_argument(
        "-y", "--yes", action="store_true",
        help="tự động ghi đè CSV đã tồn tại, không hỏi (tiện chạy batch)",
    )
    args = parser.parse_args()

    vision.validate_env()

    if not os.path.isdir(SCHOOLS_DIR):
        sys.exit(f"Không thấy thư mục trường: {SCHOOLS_DIR}")

    targets = resolve_targets(args.targets, category)
    if not targets:
        sys.exit(f"Không có (trường, năm) nào có images/ trong {SCHOOLS_DIR}/*/{category}/")

    if args.note and len(targets) > 1:
        print("  (lưu ý: --note áp dụng cho TẤT CẢ trường-năm trong lần chạy này)")
    print(f"Xử lý {len(targets)} trường-năm:")
    for year_dir in targets:
        process_target(year_dir, args.note, args.yes)
