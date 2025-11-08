using TimTruong.ApiService.DTOs;
using Core.Models;

namespace TimTruong.ApiService.Tests.Helpers;

public static class TestData
{
    // University Test Data
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

    // Campus Test Data
    public static University CreateSampleUniversityEntity(int id = 1)
    {
        return new University
        {
            Id = id,
            Name = "Trường Đại học Bách Khoa TP.HCM",
            ShortName = "ĐHBK TP.HCM",
            EnglishName = "HCMUT",
            Code = "BKA",
            Type = UniType.Public,
            ImageUrl = "https://example.com/hcmut.jpg"
        };
    }

    public static CampusDto CreateSampleCampusDto(int id = 1, int universityId = 1)
    {
        return new CampusDto
        {
            Id = id,
            Name = "Cơ sở Dĩ An",
            Address = "273 An Dương Vương",
            City = "Bình Dương",
            District = "Dĩ An",
            UniversityId = universityId,
            UniversityName = "Trường Đại học Bách Khoa TP.HCM",
            UniversityCode = "BKA"
        };
    }

    public static CreateCampusRequest CreateSampleCreateCampusRequest()
    {
        return new CreateCampusRequest
        {
            Name = "Cơ sở Dĩ An",
            Address = "273 An Dương Vương",
            City = "Bình Dương",
            District = "Dĩ An",
            UniversityCode = "BKA"
        };
    }

    public static UpdateCampusRequest CreateSampleUpdateCampusRequest()
    {
        return new UpdateCampusRequest
        {
            Name = "Cơ sở Dĩ An (Updated)",
            Address = "273 An Dương Vương",
            City = "Bình Dương",
            District = "Dĩ An",
            UniversityCode = "BKA"
        };
    }

    public static Campus CreateSampleCampusEntity(int id = 1, int universityId = 1)
    {
        return new Campus
        {
            Id = id,
            Name = "Cơ sở Dĩ An",
            Address = "273 An Dương Vương",
            City = "Bình Dương",
            District = "Dĩ An",
            UniversityId = universityId
        };
    }

    public static List<Campus> CreateSampleCampusList()
    {
        return new List<Campus>
        {
            new Campus
            {
                Id = 1,
                Name = "Cơ sở Dĩ An",
                Address = "273 An Dương Vương",
                City = "Bình Dương",
                District = "Dĩ An",
                UniversityId = 1
            },
            new Campus
            {
                Id = 2,
                Name = "Cơ sở Quận 5",
                Address = "268 Lý Thường Kiệt",
                City = "TP HCM",
                District = "Quận 5",
                UniversityId = 1
            }
        };
    }
}
