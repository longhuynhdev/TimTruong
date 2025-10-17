using TimTruong.ApiService.DTOs;

namespace TimTruong.ApiService.Tests.Helpers;

public static class TestData
{
    public static UniversityDto CreateSampleUniversityDto(int id = 1)
    {
        return new UniversityDto
        {
            Id = id,
            Name = "Trường Đại học Bách Khoa TP.HCM",
            ShortName = "ĐHBK TP.HCM",
            EnglishName = "Ho Chi Minh City University of Technology",
            Code = "BKA",
            Type = "Public",
            ImageUrl = "https://example.com/hcmut.jpg"
        };
    }

    public static UniversitySimpleDto CreateSampleSimpleDto(int id = 1)
    {
        return new UniversitySimpleDto
        {
            Id = id,
            Name = "Trường Đại học Bách Khoa TP.HCM",
            Code = "BKA"
        };
    }

    public static CreateUniversityRequest CreateSampleCreateRequest()
    {
        return new CreateUniversityRequest
        {
            Name = "Trường Đại học Bách Khoa TP.HCM",
            ShortName = "ĐHBK TP.HCM",
            EnglishName = "HCMUT",
            Code = "BKA",
            Type = "Public",
            ImageUrl = "https://example.com/hcmut.jpg"
        };
    }

    public static List<UniversityDto> CreateSampleUniversityList()
    {
        return new List<UniversityDto>
        {
            new UniversityDto
            {
                Id = 1,
                Name = "Trường Đại học Bách Khoa TP.HCM",
                Code = "BKA",
                Type = "Public"
            },
            new UniversityDto
            {
                Id = 2,
                Name = "Trường Đại học Quốc tế Sài Gòn",
                Code = "QST",
                Type = "Private"
            }
        };
    }
}
