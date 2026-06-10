using TimTruong.ApiService.Utils;

namespace TimTruong.Tests.Unit;

public class SlugGeneratorTests
{
    [Theory]
    [InlineData("Trường Đại học Khoa học tự nhiên", "truong-dai-hoc-khoa-hoc-tu-nhien")]
    [InlineData("Trường Đại học Bách Khoa", "truong-dai-hoc-bach-khoa")]
    [InlineData("Đại học Quốc gia TP.HCM", "dai-hoc-quoc-gia-tp-hcm")]
    [InlineData("TP.HCM", "tp-hcm")]
    public void Generate_StripsVietnameseDiacritics(string name, string expected)
    {
        var slug = SlugGenerator.Generate(name);

        Assert.Equal(expected, slug);
    }

    [Fact]
    public void Generate_AppendsShortName()
    {
        var slug = SlugGenerator.Generate("Trường Đại học Khoa học tự nhiên", "HCMUS");

        Assert.Equal("truong-dai-hoc-khoa-hoc-tu-nhien-hcmus", slug);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Generate_IgnoresBlankShortName(string? shortName)
    {
        var slug = SlugGenerator.Generate("Trường Đại học Tôn Đức Thắng", shortName);

        Assert.Equal("truong-dai-hoc-ton-duc-thang", slug);
    }

    [Theory]
    [InlineData("Trường Đại học Kinh tế - Luật, Đại học Quốc gia TP.HCM", "truong-dai-hoc-kinh-te-luat-dai-hoc-quoc-gia-tp-hcm")] 
    [InlineData("Trường Đại học Tài chính – Marketing", "truong-dai-hoc-tai-chinh-marketing")] 
    [InlineData("Trường Đại học Lao động – Xã hội (Cơ sở 2)", "truong-dai-hoc-lao-dong-xa-hoi-co-so-2")] 
    [InlineData("Trường Đại học Bách Khoa, Đại học Quốc gia TP.HCM ", "truong-dai-hoc-bach-khoa-dai-hoc-quoc-gia-tp-hcm")] 
    [InlineData("Trường Đại học Quốc tế RMIT Việt Nam", "truong-dai-hoc-quoc-te-rmit-viet-nam")]
    public void Generate_ProducesUrlSafeAscii(string name, string expected)
    {
        var slug = SlugGenerator.Generate(name);

        Assert.Equal(expected, slug);
        Assert.Matches("^[a-z0-9]+(-[a-z0-9]+)*$", slug);
    }
}
