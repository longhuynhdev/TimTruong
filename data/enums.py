"""Enum maps mirror các enum C# (EF Core lưu enum dạng int).

PHẢI giữ đồng bộ với:
  - server/Core/Models/Enums/ExamType.cs
  - server/Core/Models/Enums/SubjectCombination.cs

ExamType lưu theo thứ tự khai báo (THPTQG=0, ĐGNL=1).
SubjectCombination lưu theo giá trị int gán tường minh trong C#
(quy ước: <base nhóm> + <số tổ hợp>, vd A00=100, D14=414, X01=501).
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
    "D14": 414, "D15": 415, "D66": 466, "D84": 484,
    # GROUP X
    "X01": 501, "X02": 502, "X03": 503, "X04": 504, "X06": 506,
    "X07": 507, "X10": 510, "X11": 511, "X14": 514, "X25": 525,
    "X26": 526, "X27": 527, "X56": 556, "X70": 570, "X74": 574,
    "X78": 578, "X79": 579,
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
