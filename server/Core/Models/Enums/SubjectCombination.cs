namespace Core.Models;

/// <summary>
/// Vietnamese high school subject combinations for university admission
/// </summary>
public enum SubjectCombination
{
    // ==========================================
    // GROUP A - NATURAL SCIENCES
    // ==========================================

    /// <summary>Toán, Lí, Hóa</summary>
    A00 = 100,

    /// <summary>Toán, Lí, Anh </summary>
    A01 = 101,

    /// <summary>Toán, Lí, Sinh </summary>
    A02 = 102,

    /// <summary>Toán, Lí, Sử</summary>
    A03 = 103,

    /// <summary>Toán, Lí, Địa </summary>
    A04 = 104,

    /// <summary>Toán, Hóa, Sử</summary>
    A05 = 105,

    /// <summary>Toán, Hóa, Lí</summary>
    A06 = 106,

    /// <summary>Toán, Sử, Địa</summary>
    A07 = 107,

    /// <summary>Toán, Sử, GDCD </summary>
    A08 = 108,

    /// <summary>Toán, Địa, GDCD</summary>
    A09 = 109,

    /// <summary>Toán, Lí, GDCD</summary>
    A10 = 110,

    /// <summary>Toán, Hóa, GDCD</summary>
    A11 = 111,

    /// <summary>Toán, KHTN, KHXH</summary>
    A12 = 112,

    /// <summary>Toán, KHTN, Địa</summary>
    A14 = 114,

    /// <summary>Toán, KHTN, GDCD </summary>
    A15 = 115,

    /// <summary>Toán, KHTN, Văn </summary>
    A16 = 116,

    /// <summary>Toán, KHXH, Lí </summary>
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

    /// <summary>Toán, Sinh, Văn</summary>
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

    /// <summary>Văn, Sử, Địa </summary>
    C00 = 300,

    /// <summary>Văn, Toán, Lí </summary>
    C01 = 301,

    /// <summary>Văn, Toán, Hóa </summary>
    C02 = 302,

    /// <summary>Văn, Toán, Sử (Literature, Math, Biology)</summary>
    C03 = 303,

    //TODO:

    // ==========================================
    // GROUP D - MATH & FOREIGN LANGUAGES 
    // ==========================================

    /// <summary>Toán, Văn, Anh</summary>
    D01 = 401,

    /// <summary>Toán, Văn, Nga</summary>
    D02 = 402,

    /// <summary>Toán, Văn, Pháp</summary>
    D03 = 403,

    /// <summary>Toán, Văn, Trung</summary>
    D04 = 404,

    /// <summary>Toán, Văn, Đức</summary>
    D05 = 405,

    /// <summary>Toán, Văn, Nhật</summary>
    D06 = 406,

    /// <summary>Toán, Hóa, Anh</summary>
    D07 = 407,

    /// <summary>Toán, Sinh, Anh</summary>
    D08 = 408,

    /// <summary>Toán, Sử, Anh </summary>
    D09 = 409,

    /// <summary>Toán, Địa, Anh </summary>
    D10 = 410,

    //TODO:

    // ==========================================
    // GROUP X  
    // ==========================================

    /// <summary>Toán, Văn, Tin </summary>
    X02 = 502,

    /// <summary>Toán, Lí, Tin </summary>
    X06 = 506,

    /// <summary>Toán, Anh, GDKTPL </summary>
    X25 =525,

    /// <summary>Toán, Anh, Tin </summary>
    X26 = 526,

    /// <summary>Văn, Sử, GDKTPL </summary>
    X70 = 570,

    /// <summary>Văn, Địa, GDKTPL </summary>
    X74 = 574,

    /// <summary>Văn, GDKTPL, Anh </summary>
    X78 = 578
}
