## Get University Recommendations

**Endpoint:** `POST /api/v1/recommendations`
**Description:** Gợi ý các trường đại học và ngành học phù hợp dựa trên điểm thi và các tiêu chí lọc
**Authentication:** Not Required (Public API)

### Request Body

```json
{
  "examType": "THPTQG",
  "score": 26.5,
  "subjectCombination": "A00",
  "year": 2025
}
```

### Request Body Fields

| Field              | Type    | Required    | Description              | Validation                                                   |
| ------------------ | ------- | ----------- | ------------------------ | ------------------------------------------------------------ |
| examType           | string  | Yes         | Loại kỳ thi              | Enum: "THPTQG", "ĐGNL"                                       |
| score              | decimal | Yes         | Điểm thi                 | > 0, THPTQG: max 30, ĐGNL: max 1200                          |
| subjectCombination | string  | Conditional | Tổ hợp môn               | Required nếu examType = "THPTQG". Ví dụ: "A00", "A01", "D01" |
| year               | int     | No          | Năm tham khảo điểm chuẩn | Default: năm hiện tại. Min: 2020                             |

### Success Response (200 OK)

//TODO

```json

```

### Error Responses

//TODO

```json

```

## Get All Universities

**Endpoint:** `GET /api/v1/universities`
**Description:** Lấy danh sách tất cả trường đại học
**Authentication:** Not Required

### Query Parameters

| Parameter | Type   | Required | Default | Description                               |
| --------- | ------ | -------- | ------- | ----------------------------------------- |
| search    | string | No       | -       | Tìm kiếm theo tên hoặc mã trường          |
| type      | string | No       | -       | Lọc theo loại trường: "Public", "Private" |
| city      | string | No       | -       | Lọc theo thành phố                        |

### Success Response (200 OK)

```json
{
  "data": {
    "universities": [
      {
        "id": 1,
        "name": "Trường Đại học Bách Khoa TP HCM",
        "code": "HCMUT",
        "type": "Public",
        "imageUrl": "https://cdn.yourapp.com/universities/hcmut.jpg"
      },
      {
        "id": 2,
        "name": "Trường Đại học Công Nghệ Thông Tin TP HCM",
        "code": "UIT",
        "type": "Public",
        "imageUrl": "https://cdn.yourapp.com/universities/uit.jpg"
      }
    ]
  }
}
```

## Create University

**Endpoint:** `POST /api/v1/universities`
**Description:** Tạo trường đại học mới
**Authentication:** Required (Admin only)

### Request Headers

```
Content-Type: application/json
Authorization: Bearer {access_token}
```

### Request Body

```json
{
  "name": "Trường Đại học Khoa Học Tự Nhiên TP HCM",
  "code": "HCMUS",
  "type": "Public",
  "imageUrl": "https://cdn.yourapp.com/universities/hcmus.jpg"
}
```

### Field Validation

| Field    | Type   | Required | Constraints                                                |
| -------- | ------ | -------- | ---------------------------------------------------------- |
| name     | string | Yes      | Min: 3, Max: 255, Unique                                   |
| code     | string | Yes      | Min: 2, Max: 10, Unique, Uppercase, Pattern: `^[A-Z0-9]+$` |
| type     | string | Yes      | Enum: "Public", "Private"                                  |
| imageUrl | string | No       | Valid URL, Max: 500                                        |

### Success Response (201 Created)

```json
{
  "data": {
    "id": 3,
    "name": "Trường Đại học Khoa Học Tự Nhiên TP HCM",
    "code": "HCMUS",
    "type": "Public",
    "imageUrl": "https://cdn.yourapp.com/universities/hcmus.jpg"
  }
}
```

### Error Responses

**400 Bad Request - Duplicate**
**400 Bad Request - Validation Error**

## Update University

**Endpoint:** `PUT /api/v1/universities/{id}`
**Description:** Cập nhật thông tin trường đại học
**Authentication:** Required (Admin only)

### Request Body

```json
{
  "name": "Trường Đại học Khoa Học Tự Nhiên TP HCM - ĐHQG",
  "code": "HCMUS",
  "type": "Public",
  "imageUrl": "https://cdn.yourapp.com/universities/hcmus-new.jpg"
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Trường Đại học Khoa Học Tự Nhiên TP HCM - ĐHQG",
    "code": "HCMUS",
    "type": "Public",
    "imageUrl": "https://cdn.yourapp.com/universities/hcmus-new.jpg"
  }
}
```

### Error Response (404 Not Found)

## Delete University

**Endpoint:** `DELETE /api/v1/universities/{id}`
**Description:** Xóa trường đại học (soft delete)
**Authentication:** Required (Admin only)

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 3,
    "deletedAt": "2024-10-06T16:00:00Z"
  },
  "message": "Xóa trường đại học thành công"
}
```

## Get Universities (Simple List for Dropdown)

**Endpoint:** `GET /api/v1/universities/simple`
**Description:** Lấy danh sách đơn giản các trường (chỉ ID và Name) để dùng cho dropdown
**Authentication:** Not Required

### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": 1,
      "name": "Trường Đại học Bách Khoa TP HCM",
      "code": "HCMUT"
    },
    {
      "id": 2,
      "name": "Trường Đại học Công Nghệ Thông Tin TP HCM",
      "code": "UIT"
    },
    {
      "id": 3,
      "name": "Trường Đại học Khoa Học Tự Nhiên TP HCM",
      "code": "HCMUS"
    }
  ]
}
```
