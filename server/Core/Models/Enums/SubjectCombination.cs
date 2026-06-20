using System.ComponentModel;

namespace Core.Models;

/// <summary>
/// Vietnamese high school subject combinations for university admission.
/// The <see cref="DescriptionAttribute"/> on each member holds the full,
/// display-ready subject names (", "-separated) — read at runtime via
/// SubjectCombinationExtensions.GetSubjects() and exposed through the API
/// so the client never hardcodes the list.
/// </summary>
public enum SubjectCombination
{
    // ==========================================
    // GROUP A - NATURAL SCIENCES
    // ==========================================

    /// <summary>Toán, Vật lí, Hóa</summary>
    [Description("Toán, Vật lí, Hóa học")]
    A00 = 100,

    /// <summary>Toán, Vật lí, Anh </summary>
    [Description("Toán, Vật lí, Tiếng Anh")]
    A01 = 101,

    /// <summary>Toán, Vật lí, Sinh </summary>
    [Description("Toán, Vật lí, Sinh học")]
    A02 = 102,

    /// <summary>Toán, Vật lí, Sử</summary>
    [Description("Toán, Vật lí, Lịch sử")]
    A03 = 103,

    /// <summary>Toán, Vật lí, Địa </summary>
    [Description("Toán, Vật lí, Địa lý")]
    A04 = 104,

    /// <summary>Toán, Hóa, Sử</summary>
    [Description("Toán, Hóa học, Lịch sử")]
    A05 = 105,

    /// <summary>Toán, Hóa, Vật lí</summary>
    [Description("Toán, Hóa học, Vật lí")]
    A06 = 106,

    /// <summary>Toán, Sử, Địa</summary>
    [Description("Toán, Lịch sử, Địa lý")]
    A07 = 107,

    /// <summary>Toán, Sử, GDCD </summary>
    [Description("Toán, Lịch sử, GDCD")]
    A08 = 108,

    /// <summary>Toán, Địa, GDCD</summary>
    [Description("Toán, Địa lý, GDCD")]
    A09 = 109,

    /// <summary>Toán, Vật lí, GDCD</summary>
    [Description("Toán, Vật lí, GDCD")]
    A10 = 110,

    /// <summary>Toán, Hóa, GDCD</summary>
    [Description("Toán, Hóa học, GDCD")]
    A11 = 111,

    /// <summary>Toán, Khoa học tự nhiên, KHXH</summary>
    [Description("Toán, Khoa học tự nhiên, KHXH")]
    A12 = 112,

    /// <summary>Toán, Khoa học tự nhiên, Địa</summary>
    [Description("Toán, Khoa học tự nhiên, Địa lý")]
    A14 = 114,

    /// <summary>Toán, Khoa học tự nhiên, GDCD </summary>
    [Description("Toán, Khoa học tự nhiên, GDCD")]
    A15 = 115,

    /// <summary>Toán, Khoa học tự nhiên, Ngữ văn </summary>
    [Description("Toán, Khoa học tự nhiên, Ngữ văn")]
    A16 = 116,

    /// <summary>Toán, KHXH, Vật lí </summary>
    [Description("Toán, KHXH, Vật lí")]
    A17 = 117,

    /// <summary>Toán, KHXH, Hóa </summary>
    [Description("Toán, KHXH, Hóa học")]
    A18 = 118,

    // ==========================================
    // GROUP B - BIOLOGY & CHEMISTRY
    // ==========================================

    /// <summary>Toán, Hóa, Sinh</summary>
    [Description("Toán, Hóa học, Sinh học")]
    B00 = 200,

    /// <summary>Toán, Sinh, Sử</summary>
    [Description("Toán, Sinh học, Lịch sử")]
    B01 = 201,

    /// <summary>Toán, Sinh, Địa</summary>
    [Description("Toán, Sinh học, Địa lý")]
    B02 = 202,

    /// <summary>Toán, Sinh, Ngữ văn</summary>
    [Description("Toán, Sinh học, Ngữ văn")]
    B03 = 203,

    /// <summary>Toán, Sinh, GDCD</summary>
    [Description("Toán, Sinh học, GDCD")]
    B04 = 204,

    /// <summary>Toán, Sinh, KHXH</summary>
    [Description("Toán, Sinh học, KHXH")]
    B05 = 205,

    /// <summary>Toán, Sinh, Anh</summary>
    [Description("Toán, Sinh học, Tiếng Anh")]
    B08 = 208,


    // ==========================================
    // GROUP C - SOCIAL SCIENCES
    // ==========================================

    /// <summary>Ngữ văn, Sử, Địa </summary>
    [Description("Ngữ văn, Lịch sử, Địa lý")]
    C00 = 300,

    /// <summary>Ngữ văn, Toán, Vật lí </summary>
    [Description("Ngữ văn, Toán, Vật lí")]
    C01 = 301,

    /// <summary>Ngữ văn, Toán, Hóa </summary>
    [Description("Ngữ văn, Toán, Hóa học")]
    C02 = 302,

    /// <summary>Ngữ văn, Toán, Sử</summary>
    [Description("Ngữ văn, Toán, Lịch sử")]
    C03 = 303,

    /// <summary>Ngữ văn, Toán, Địa</summary>
    [Description("Ngữ văn, Toán, Địa lý")]
    C04 = 304,

    /// <summary>Ngữ văn, Sử, Vật lí</summary>
    [Description("Ngữ văn, Lịch sử, Vật lí")]
    C07 = 307,

    /// <summary>Ngữ văn, Toán, Giáo dục kinh tế và pháp luật</summary>
    [Description("Ngữ văn, Toán, Giáo dục kinh tế và pháp luật")]
    C14 = 314,

    // ==========================================
    // GROUP D - MATH & FOREIGN LANGUAGES
    // ==========================================

    /// <summary>Toán, Ngữ văn, Anh</summary>
    [Description("Toán, Ngữ văn, Tiếng Anh")]
    D01 = 401,

    /// <summary>Toán, Ngữ văn, Nga</summary>
    [Description("Toán, Ngữ văn, Tiếng Nga")]
    D02 = 402,

    /// <summary>Toán, Ngữ văn, Pháp</summary>
    [Description("Toán, Ngữ văn, Tiếng Pháp")]
    D03 = 403,

    /// <summary>Toán, Ngữ văn, Trung</summary>
    [Description("Toán, Ngữ văn, Tiếng Trung")]
    D04 = 404,

    /// <summary>Toán, Ngữ văn, Đức</summary>
    [Description("Toán, Ngữ văn, Tiếng Đức")]
    D05 = 405,

    /// <summary>Toán, Ngữ văn, Nhật</summary>
    [Description("Toán, Ngữ văn, Tiếng Nhật")]
    D06 = 406,

    /// <summary>Toán, Hóa, Anh</summary>
    [Description("Toán, Hóa học, Tiếng Anh")]
    D07 = 407,

    /// <summary>Toán, Sinh, Anh</summary>
    [Description("Toán, Sinh học, Tiếng Anh")]
    D08 = 408,

    /// <summary>Toán, Sử, Anh </summary>
    [Description("Toán, Lịch sử, Tiếng Anh")]
    D09 = 409,

    /// <summary>Toán, Địa, Anh </summary>
    [Description("Toán, Địa lý, Tiếng Anh")]
    D10 = 410,

    /// <summary>Ngữ văn, Sử, Anh</summary>
    [Description("Ngữ văn, Lịch sử, Tiếng Anh")]
    D14 = 414,

    /// <summary>Ngữ văn, Địa, Anh</summary>
    [Description("Ngữ văn, Địa lý, Tiếng Anh")]
    D15 = 415,

    /// <summary>Ngữ văn, GDCD, Tiếng Anh</summary>
    [Description("Ngữ văn, GDCD, Tiếng Anh")]
    D66 = 466,

    /// <summary>Toán, Tiếng Anh, Giáo dục kinh tế và pháp luật</summary>
    [Description("Toán, Tiếng Anh, Giáo dục kinh tế và pháp luật")]
    D84 = 484,

    /// <summary>Toán, Tiếng Anh và Khoa học tự nhiên</summary>
    [Description("Toán, Tiếng Anh, Khoa học tự nhiên")]
    D90 = 490,

    // ==========================================
    // GROUP X
    // ==========================================

    /// <summary>Toán, Ngữ văn, Giáo dục kinh tế và pháp luật </summary>
    [Description("Toán, Ngữ văn, Giáo dục kinh tế và pháp luật")]
    X01 = 501,

    /// <summary>Toán, Ngữ văn, Tin học</summary>
    [Description("Toán, Ngữ văn, Tin học")]
    X02 = 502,

    /// <summary>Toán, Ngữ văn, Công nghệ công nghiệp </summary>
    [Description("Toán, Ngữ văn, Công nghệ công nghiệp")]
    X03 = 503,

    /// <summary>Toán, Ngữ văn, Công nghệ nông nghiệp </summary>
    [Description("Toán, Ngữ văn, Công nghệ nông nghiệp")]
    X04 = 504,

    /// <summary>Toán, Vật lí, Tin học</summary>
    [Description("Toán, Vật lí, Tin học")]
    X06 = 506,

    /// <summary>Toán, Vật lí, Công nghệ công nghiệp</summary>
    [Description("Toán, Vật lí, Công nghệ công nghiệp")]
    X07 = 507,

    /// <summary>Toán, Hóa học, Tin học</summary>
    [Description("Toán, Hóa học, Tin học")]
    X10 = 510,

    /// <summary>Toán, Hóa học, Công nghệ công nghiệp</summary>
    [Description("Toán, Hóa học, Công nghệ công nghiệp")]
    X11 = 511,

    /// <summary>Toán, Hóa học, Công nghệ nông nghiệp</summary>
    [Description("Toán, Hóa học, Công nghệ nông nghiệp")]
    X12 = 512,

    /// <summary>Toán, Sinh học, Tin học</summary>
    [Description("Toán, Sinh học, Tin học")]
    X14 = 514,

    /// <summary>Toán, Công nghệ công nghiệp, Sinh học</summary>
    [Description("Toán, Công nghệ công nghiệp, Sinh học")]
    X15 = 515,

    /// <summary>Toán, Công nghệ nông nghiệp, Sinh học</summary>
    [Description("Toán, Công nghệ nông nghiệp, Sinh học")]
    X16 = 516,

    /// <summary>Toán, Anh, Giáo dục kinh tế và pháp luật </summary>
    [Description("Toán, Tiếng Anh, Giáo dục kinh tế và pháp luật")]
    X25 = 525,

    /// <summary>Toán, Anh, Tin học</summary>
    [Description("Toán, Tiếng Anh, Tin học")]
    X26 = 526,

    /// <summary>Toán, Tiếng Anh, Công nghệ công nghiệp</summary>
    [Description("Toán, Tiếng Anh, Công nghệ công nghiệp")]
    X27 = 527,

    /// <summary>Toán, Tin học, Công nghệ công nghiệp</summary>
    [Description("Toán, Tin học, Công nghệ công nghiệp")]
    X56 = 556,

    /// <summary>Ngữ văn, Sử, Giáo dục kinh tế và pháp luật </summary>
    [Description("Ngữ văn, Lịch sử, Giáo dục kinh tế và pháp luật")]
    X70 = 570,

    /// <summary>Ngữ văn, Địa, Giáo dục kinh tế và pháp luật </summary>
    [Description("Ngữ văn, Địa lý, Giáo dục kinh tế và pháp luật")]
    X74 = 574,

    /// <summary>Ngữ văn, Tiếng Anh, Tin học</summary>
    [Description("Ngữ văn, Tiếng Anh, Tin học")]
    X79 = 579,

    /// <summary>Ngữ văn, Giáo dục kinh tế và pháp luật, Anh </summary>
    [Description("Ngữ văn, Giáo dục kinh tế và pháp luật, Tiếng Anh")]
    X78 = 578,

    // ==========================================
    // GROUP Y
    // ==========================================

    /// <summary>Ngữ văn, Giáo dục kinh tế và pháp luật, Công nghệ công nghiệp</summary>
    [Description("Ngữ văn, Giáo dục kinh tế và pháp luật, Công nghệ công nghiệp")]
    Y08 = 608,
}
