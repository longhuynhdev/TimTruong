"""Trích xuất điểm chuẩn từ ẢNH → CSV long-format bằng Vision-LLM (2-pass consensus).
Dùng:
  uv run extract_admissions.py                                    # xử lý mọi (trường, năm) có images/
  uv run extract_admissions.py QST-HCMUS/2025                     # chỉ 1 trường-năm (hoặc QST-HCMUS-2025)
  uv run extract_admissions.py QST-HCMUS                          # mọi năm của 1 trường
  uv run extract_admissions.py QST-HCMUS/2025 --note "cột cuối là ĐGNL, bỏ dòng Tổng"
  uv run extract_admissions.py QST-HCMUS/2025 --source-url "https://..."  # nguồn công bố điểm → cột SourceUrl
  uv run extract_admissions.py QST-HCMUS/2025 -y                  # ghi đè CSV cũ không hỏi

Scaffolding chung (định vị target, nạp ảnh, gọi model, merge, ghi CSV) ở extract_common.
"""

import json
import os
from os.path import join

from dotenv import load_dotenv

import extract_common as common
import vision
from enums import DEFAULT_MAX_SCORE, EXAM_TYPE, SUBJECT_COMBINATION

load_dotenv(join(common.BASE_DIR, ".env"))

CATEGORY = "admissions"
PROMPT_PATH = join(common.BASE_DIR, "prompts", "admission_extract.txt")

# Tên cột CSV (tiếng Anh, đồng bộ với etl_majors / etl_major_years / etl_admissions).
COL_UNI = "UniversityCode"
COL_CODE = "MajorCode"
COL_NAME = "MajorName"
COL_METHOD = "Method"
COL_COMBO = "SubjectCombination"
COL_MAXSCORE = "MaxScore"
COL_SCORE = "Score"
COL_SOURCE = "SourceUrl"

# SourceUrl không do LLM emit (không có trong JSON_TO_COL) — điền qua --source-url hoặc tay khi review.
HEADER = [COL_UNI, COL_CODE, COL_NAME, COL_METHOD, COL_COMBO, COL_MAXSCORE, COL_SCORE, COL_SOURCE]

# Khoá JSON model trả về → cột CSV tương ứng.
JSON_TO_COL = {
    "code": COL_CODE,
    "name": COL_NAME,
    "method": COL_METHOD,
    "subject_combination": COL_COMBO,
    "max_score": COL_MAXSCORE,
    "score": COL_SCORE,
}


def load_prompt(uni_code: str, extra: str = "") -> str:
    valid = ", ".join(sorted(SUBJECT_COMBINATION.keys()))
    return common.load_prompt(
        PROMPT_PATH,
        uni_code=uni_code,
        valid_combinations=valid,
        extra_instructions=common.build_extra_block(extra),
    )


def keep_pred(row: dict) -> bool:
    return bool(row[COL_CODE] or row[COL_METHOD])


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


def process_target(year_dir: str, args):
    label = common.target_label(year_dir)
    uni_code = common.parse_uni_code(common.school_of(year_dir))
    out_csv = common.output_csv_path(year_dir, CATEGORY)
    if not common.confirm_overwrite(out_csv, label, args.yes):
        print(f"  SKIP '{label}' — giữ CSV hiện có")
        return
    note = args.note

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

    rows, flags = common.merge_passes(passes, row_key, validate_row, diverge_fields=[COL_SCORE])
    for r in rows:
        r[COL_SOURCE] = args.source_url
    review_path, n_flag = common.write_outputs(out_csv, rows, flags, HEADER)
    print(f"    → {os.path.relpath(out_csv, common.BASE_DIR)} ({len(rows)} dòng)")
    if n_flag:
        print(f"    ⚠ {n_flag} dòng cần review: {os.path.relpath(review_path, common.BASE_DIR)}")
    else:
        print("    ✓ không có dòng cần review")


def run():
    common.run_cli(
        CATEGORY,
        description="Trích xuất điểm chuẩn từ ảnh → CSV bằng Vision-LLM (2-pass). Provider qua LLM_PROVIDER.",
        targets_help="trường-năm cần xử lý: 'QST-HCMUS/2025' hay 'QST-HCMUS-2025' (1 năm), 'QST-HCMUS' (mọi năm); bỏ trống = tất cả",
        note_help="hướng dẫn riêng nối vào prompt cho lần chạy này (vd 'cột cuối là ĐGNL, bỏ dòng Tổng')",
        process_target=process_target,
    )


if __name__ == "__main__":
    run()
