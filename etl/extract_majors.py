"""Trích xuất danh sách NGÀNH HỌC từ ẢNH đề án tuyển sinh → CSV bằng Vision-LLM (2-pass).
Dùng:
  uv run extract_majors.py                                     # mọi (trường, năm) có majors/{Year}/images/
  uv run extract_majors.py QSC-UIT/2026                        # chỉ 1 trường-năm (hoặc QSC-UIT-2026)
  uv run extract_majors.py QSC-UIT                             # mọi năm của 1 trường
  uv run extract_majors.py QSC-UIT/2026 --note "bỏ các CTĐT liên kết quốc tế"
  uv run extract_majors.py QSC-UIT/2026 -y                     # ghi đè CSV cũ không hỏi

Header CSV khớp etl_majors.py. Field nào ảnh không có (vd học phí, OldCode) → để TRỐNG.
Scaffolding chung ở extract_common.
"""

import json
import os
from os.path import join

from dotenv import load_dotenv

import extract_common as common
import vision
from enums import TUITION_FEE_UNIT

load_dotenv(join(common.BASE_DIR, ".env"))

CATEGORY = "majors"
PROMPT_PATH = join(common.BASE_DIR, "prompts", "major_extract.txt")

# Tên cột CSV — đồng bộ header etl_majors.py.
COL_UNI = "UniversityCode"
COL_CODE = "MajorCode"
COL_OLD = "OldCode"
COL_NAME = "MajorName"
COL_QUOTA = "EnrollmentQuota"
COL_FEE_MIN = "TuitionFeeMin"
COL_FEE_MAX = "TuitionFeeMax"
COL_FEE_UNIT = "TuitionFeeUnit"
COL_NOTE = "Note"
COL_SOURCE = "SourceUrl"

# UniversityCode không nằm trong file etl_majors đọc → không đưa vào HEADER, chỉ để định danh.
# Note/SourceUrl không do LLM emit: Note điền tay khi review, SourceUrl qua --source-url.
HEADER = [COL_CODE, COL_OLD, COL_NAME, COL_QUOTA, COL_FEE_MIN, COL_FEE_MAX, COL_FEE_UNIT, COL_NOTE, COL_SOURCE]

# Khoá JSON model trả về → cột CSV tương ứng.
JSON_TO_COL = {
    "code": COL_CODE,
    "old_code": COL_OLD,
    "name": COL_NAME,
    "quota": COL_QUOTA,
    "tuition_fee_min": COL_FEE_MIN,
    "tuition_fee_max": COL_FEE_MAX,
    "tuition_fee_unit": COL_FEE_UNIT,
}


def load_prompt(uni_code: str, extra: str = "") -> str:
    return common.load_prompt(
        PROMPT_PATH,
        uni_code=uni_code,
        extra_instructions=common.build_extra_block(extra),
    )


def keep_pred(row: dict) -> bool:
    return bool(row[COL_CODE])


def row_key(row: dict):
    return (row[COL_CODE],)


def _is_number(value: str) -> bool:
    """Có chứa chữ số nào không (đủ để chỉ tiêu/tiền parse được sau bằng etl_majors)."""
    return any(ch.isdigit() for ch in value)


def validate_row(row: dict):
    """Cảnh báo nhẹ cho 1 dòng (rỗng = ổn). Parse tiền gắt để etl_majors lo khi nạp DB."""
    warns = []
    if not row[COL_NAME]:
        warns.append("thiếu Tên ngành")

    quota = row[COL_QUOTA]
    if quota and not _is_number(quota):
        warns.append(f"Chỉ tiêu không phải số: '{quota}'")

    unit = row[COL_FEE_UNIT]
    if unit and unit not in TUITION_FEE_UNIT:
        warns.append(f"Đơn vị học phí lạ '{unit}' (chỉ chấp nhận {', '.join(TUITION_FEE_UNIT)})")

    fee_min, fee_max = row[COL_FEE_MIN], row[COL_FEE_MAX]
    if fee_min and fee_max and _is_number(fee_min) and _is_number(fee_max):
        try:
            if float(fee_max.replace(".", "").replace(",", "")) <= float(
                fee_min.replace(".", "").replace(",", "")
            ):
                warns.append(f"Học phí Max ({fee_max}) ≤ Min ({fee_min})")
        except ValueError:
            pass
    return warns


def process_target(year_dir: str, note: str, assume_yes: bool, source_url: str):
    label = common.target_label(year_dir)
    uni_code = common.parse_uni_code(common.school_of(year_dir))
    out_csv = common.output_csv_path(year_dir, CATEGORY)
    if not common.confirm_overwrite(out_csv, label, assume_yes):
        print(f"  SKIP '{label}' — giữ CSV hiện có")
        return

    images = common.load_images(join(year_dir, "images"))
    if not images:
        print(f"  SKIP '{label}' — không có ảnh")
        return

    prompt = load_prompt(uni_code, note)
    note_msg = " + hướng dẫn riêng" if note else ""
    print(
        f"  '{label}' (mã {uni_code}): {len(images)} ảnh{note_msg} → gọi model {common.NUM_PASSES} lần ({vision.active_model()})..."
    )
    passes = []
    for i in range(common.NUM_PASSES):
        text = vision.call_model(prompt, images)
        try:
            rows = common.parse_json_text(text, uni_code, COL_UNI, JSON_TO_COL, keep_pred)
        except (json.JSONDecodeError, TypeError) as e:
            print(f"    pass {i + 1}: LỖI parse JSON ({e}); bỏ qua pass này")
            continue
        print(f"    pass {i + 1}: {len(rows)} dòng")
        passes.append(rows)

    if not passes:
        print(f"  SKIP '{label}' — không pass nào parse được")
        return

    rows, flags = common.merge_passes(
        passes, row_key, validate_row, diverge_fields=[COL_QUOTA, COL_FEE_MIN, COL_NAME]
    )
    # Bỏ cột UniversityCode khỏi mỗi dòng — file ngành chỉ gồm các cột trong HEADER.
    rows = [{c: r.get(c, "") for c in HEADER} for r in rows]
    for r in rows:
        r[COL_SOURCE] = source_url
    review_path, n_flag = common.write_outputs(out_csv, rows, flags, HEADER)
    print(f"    → {os.path.relpath(out_csv, common.BASE_DIR)} ({len(rows)} dòng)")
    if n_flag:
        print(f"    ⚠ {n_flag} dòng cần review: {os.path.relpath(review_path, common.BASE_DIR)}")
    else:
        print("    ✓ không có dòng cần review")


def run():
    common.run_cli(
        CATEGORY,
        description="Trích xuất danh sách ngành từ ảnh đề án TS → CSV bằng Vision-LLM (2-pass). Provider qua LLM_PROVIDER.",
        targets_help="trường-năm cần xử lý: 'QSC-UIT/2026' hay 'QSC-UIT-2026' (1 năm), 'QSC-UIT' (mọi năm); bỏ trống = tất cả",
        note_help="hướng dẫn riêng nối vào prompt cho lần chạy này (vd 'bỏ các CTĐT liên kết quốc tế')",
        process_target=process_target,
    )


if __name__ == "__main__":
    run()
