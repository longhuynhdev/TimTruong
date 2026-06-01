namespace Core.Models;

/// <summary>
/// Vietnamese high school subject combinations for university admission
/// </summary>
public enum SubjectCombination
{
    // ==========================================
    // GROUP A - NATURAL SCIENCES
    // ==========================================

    /// <summary>Toán, Vật lí, Hóa</summary>
    A00 = 100,

    /// <summary>Toán, Vật lí, Anh </summary>
    A01 = 101,

    /// <summary>Toán, Vật lí, Sinh </summary>
    A02 = 102,

    /// <summary>Toán, Vật lí, Sử</summary>
    A03 = 103,

    /// <summary>Toán, Vật lí, Địa </summary>
    A04 = 104,

    /// <summary>Toán, Hóa, Sử</summary>
    A05 = 105,

    /// <summary>Toán, Hóa, Vật lí</summary>
    A06 = 106,

    /// <summary>Toán, Sử, Địa</summary>
    A07 = 107,

    /// <summary>Toán, Sử, GDCD </summary>
    A08 = 108,

    /// <summary>Toán, Địa, GDCD</summary>
    A09 = 109,

    /// <summary>Toán, Vật lí, GDCD</summary>
    A10 = 110,

    /// <summary>Toán, Hóa, GDCD</summary>
    A11 = 111,

    /// <summary>Toán, KHTN, KHXH</summary>
    A12 = 112,

    /// <summary>Toán, KHTN, Địa</summary>
    A14 = 114,

    /// <summary>Toán, KHTN, GDCD </summary>
    A15 = 115,

    /// <summary>Toán, KHTN, Ngữ văn </summary>
    A16 = 116,

    /// <summary>Toán, KHXH, Vật lí </summary>
    A17 = 117,

    /// <summary>Toán, KHXH, Hóa </summary>
    A18 = 118,

    // ==========================================
    // GROUP B - BIOLOGY & CHEMISTRY
    // ==========================================

    /// <summary>Toán, Hóa, Sinh</summary>
    B00 = 200,

    /// <summary>Toán, Sinh, Sử</summary>
    B01 = 201,

    /// <summary>Toán, Sinh, Địa</summary>
    B02 = 202,

    /// <summary>Toán, Sinh, Ngữ văn</summary>
    B03 = 203,

    /// <summary>Toán, Sinh, GDCD</summary>
    B04 = 204,

    /// <summary>Toán, Sinh, KHXH</summary>
    B05 = 205,

    /// <summary>Toán, Sinh, Anh</summary>
    B08 = 208,


    // ==========================================
    // GROUP C - SOCIAL SCIENCES 
    // ==========================================

    /// <summary>Ngữ văn, Sử, Địa </summary>
    C00 = 300,

    /// <summary>Ngữ văn, Toán, Vật lí </summary>
    C01 = 301,

    /// <summary>Ngữ văn, Toán, Hóa </summary>
    C02 = 302,

    /// <summary>Ngữ văn, Toán, Sử</summary>
    C03 = 303,

    /// <summary>Ngữ văn, Toán, Địa</summary>
    C04 = 304,

    /// <summary>Ngữ văn, Sử, Vật lí</summary>
    C07 = 307,

    /// <summary>Ngữ văn, Toán, GDKTPL</summary>
    C14 = 314,

    // ==========================================
    // GROUP D - MATH & FOREIGN LANGUAGES 
    // ==========================================

    /// <summary>Toán, Ngữ văn, Anh</summary>
    D01 = 401,

    /// <summary>Toán, Ngữ văn, Nga</summary>
    D02 = 402,

    /// <summary>Toán, Ngữ văn, Pháp</summary>
    D03 = 403,

    /// <summary>Toán, Ngữ văn, Trung</summary>
    D04 = 404,

    /// <summary>Toán, Ngữ văn, Đức</summary>
    D05 = 405,

    /// <summary>Toán, Ngữ văn, Nhật</summary>
    D06 = 406,

    /// <summary>Toán, Hóa, Anh</summary>
    D07 = 407,

    /// <summary>Toán, Sinh, Anh</summary>
    D08 = 408,

    /// <summary>Toán, Sử, Anh </summary>
    D09 = 409,

    /// <summary>Toán, Địa, Anh </summary>
    D10 = 410,

    /// <summary>Ngữ văn, Sử, Anh</summary>
    D14 = 414,

    /// <summary>Ngữ văn, Địa, Anh</summary>
    D15 = 415,

    /// <summary>Ngữ văn, GDCD, Tiếng Anh</summary>
    D66 = 466,

    /// <summary>Toán, Tiếng Anh, GDKTPL</summary>
    D84 = 484,

    // ==========================================
    // GROUP X
    // ==========================================

    /// <summary>Toán, Ngữ văn, GDKTPL </summary>
    X01 = 501,

    /// <summary>Toán, Ngữ văn, Tin học</summary>
    X02 = 502,

    /// <summary>Toán, Ngữ văn, Công nghệ công nghiệp </summary>
    X03 = 503,

    /// <summary>Toán, Ngữ văn, Công nghệ nông nghiệp </summary>
    X04 = 504,

    /// <summary>Toán, Vật lí, Tin học</summary>
    X06 = 506,

    /// <summary>Toán, Vật lí, Công nghệ công nghiệp</summary>
    X07 = 507,

    /// <summary>Toán, Hóa học, Tin học</summary>
    X10 = 510,

    /// <summary>Toán, Hóa học, Công nghệ công nghiệp</summary>
    X11 = 511,

    /// <summary>Toán, Sinh học, Tin học</summary>
    X14 = 514,

    /// <summary>Toán, Anh, GDKTPL </summary>
    X25 = 525,

    /// <summary>Toán, Anh, Tin học</summary>
    X26 = 526,

    /// <summary>Toán, Tiếng Anh, Công nghệ công nghiệp</summary>
    X27 = 527,

    /// <summary>Toán, Tin học, Công nghệ công nghiệp</summary>
    X56 = 556,

    /// <summary>Ngữ văn, Sử, GDKTPL </summary>
    X70 = 570,

    /// <summary>Ngữ văn, Địa, GDKTPL </summary>
    X74 = 574,

    /// <summary>Ngữ văn, Tiếng Anh, Tin học</summary>
    X79 = 579,

    /// <summary>Ngữ văn, GDKTPL, Anh </summary>
    X78 = 578,

    // ==========================================
    // GROUP Y
    // ==========================================

    /// <summary>Ngữ văn, GDKTPL, Công nghệ công nghiệp</summary>
    Y08 = 608,
}
