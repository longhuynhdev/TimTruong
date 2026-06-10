"""Enum maps mirror các enum C# (EF Core lưu enum dạng int).

PHẢI giữ đồng bộ với:
  - server/Core/Models/Enums/ExamType.cs
  - server/Core/Models/Enums/SubjectCombination.cs
  - server/Core/Models/Enums/RankingSystem.cs
  - server/Core/Models/Enums/TuitionFeeUnit.cs

ExamType lưu theo thứ tự khai báo (THPTQG=0, ĐGNL=1).
SubjectCombination lưu theo giá trị int gán tường minh trong C#
(quy ước: <base nhóm> + <số tổ hợp>, vd A00=100, D14=414, X01=501).
RankingSystem lưu theo thứ tự khai báo (VNUR=0, QS=1, THE=2).
TuitionFeeUnit lưu theo thứ tự khai báo (PerCredit=0, PerSemester=1, PerYear=2).
"""

EXAM_TYPE = {
    "THPTQG": 0,
    "ĐGNL": 1,
}

SUBJECT_COMBINATION = {
    # GROUP A
    "A00": 100, "A01": 101, "A02": 102, "A03": 103, "A04": 104,
    "A05": 105, "A06": 106, "A07": 107, "A08": 108, "A09": 109,
    "A10": 110, "A11": 111, "A12": 112, "A14": 114, "A15": 115,
    "A16": 116, "A17": 117, "A18": 118,
    # GROUP B
    "B00": 200, "B01": 201, "B02": 202, "B03": 203, "B04": 204,
    "B05": 205, "B08": 208,
    # GROUP C
    "C00": 300, "C01": 301, "C02": 302, "C03": 303, "C04": 304,
    "C07": 307, "C14": 314,
    # GROUP D
    "D01": 401, "D02": 402, "D03": 403, "D04": 404, "D05": 405,
    "D06": 406, "D07": 407, "D08": 408, "D09": 409, "D10": 410,
    "D14": 414, "D15": 415, "D66": 466, "D84": 484, "D90": 490,
    # GROUP X
    "X01": 501, "X02": 502, "X03": 503, "X04": 504, "X06": 506,
    "X07": 507, "X10": 510, "X11": 511, "X12": 512, "X14": 514, 
    "X15": 515, "X16": 516, "X25": 525, "X26": 526, "X27": 527, 
    "X56": 556, "X70": 570, "X74": 574, "X78": 578, "X79": 579,
    # GROUP Y
    "Y08": 608,
}

# Thang điểm mặc định theo phương thức 
THPTQG_MAX_SCORE = 30
DGNL_HCM_MAX_SCORE = 1200

DEFAULT_MAX_SCORE = {"THPTQG": THPTQG_MAX_SCORE, "ĐGNL": DGNL_HCM_MAX_SCORE}


def parse_exam_type(value: str):
    """'THPTQG'/'ĐGNL' → int. None nếu không hợp lệ."""
    return EXAM_TYPE.get((value or "").strip())


def parse_subject_combination(value: str):
    """'A00' → 100. Rỗng → None (hợp lệ cho ĐGNL). Lạ → 'UNKNOWN' sentinel."""
    v = (value or "").strip().upper()
    if not v:
        return None
    return SUBJECT_COMBINATION.get(v, "UNKNOWN")


RANKING_SYSTEM = {
    "VNUR": 0,
    "QS": 1,
    "THE": 2,
    "CWUR": 3,
}


def parse_ranking_system(value: str):
    """'VNUR'/'QS'/'THE' → int. None nếu không hợp lệ."""
    return RANKING_SYSTEM.get((value or "").strip().upper())


TUITION_FEE_UNIT = {
    "PerCredit": 0,
    "PerSemester": 1,
    "PerYear": 2,
}


def parse_tuition_fee_unit(value: str):
    """Tên enum ('PerCredit'/'PerSemester'/'PerYear') → int. Rỗng → None. Lạ → 'UNKNOWN' sentinel.

    CSV dùng thẳng tên enum (giống cách các CSV khác dùng tên SubjectCombination/RankingSystem).
    """
    v = (value or "").strip()
    if not v:
        return None
    return TUITION_FEE_UNIT.get(v, "UNKNOWN")


def parse_rank(value: str):
    """Rank → (rank_from, rank_to|None). None nếu không hợp lệ.

    Quy ước (để phân biệt hạng đơn với band mở khi hiển thị):
      - Hạng đơn '5'        → (5, 5)        (rank_from == rank_to)
      - Band đóng '601-800' → (601, 800)    (rank_from < rank_to)
      - Band mở '1001+'     → (1001, None)  (rank_to = None)
    Chấp nhận gạch nối '–'/'—', hậu tố 'th', vd '601–800th' → (601, 800).
    """
    v = (value or "").strip().lower()
    if not v:
        return None
    open_ended = "+" in v
    # Chuẩn hoá: các loại gạch nối → '-', bỏ hậu tố thứ tự / dấu '+'/khoảng trắng
    for ch in ("–", "—", "~"):
        v = v.replace(ch, "-")
    v = v.replace("th", "").replace("+", "").replace(" ", "")
    try:
        nums = [int(p) for p in v.split("-") if p]
    except ValueError:
        return None
    if not nums:
        return None
    if len(nums) > 1:
        return (nums[0], nums[1])
    # Một số: band mở '1001+' → to=None; còn lại là hạng đơn → to==from
    return (nums[0], None if open_ended else nums[0])
