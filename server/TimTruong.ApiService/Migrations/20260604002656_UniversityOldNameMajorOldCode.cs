using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimTruong.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class UniversityOldNameMajorOldCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OldName",
                table: "Universities",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OldCode",
                table: "Majors",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            // Giữ lại dữ liệu cũ: lấy phần tử đầu của mảng OldCodes làm OldCode đơn.
            migrationBuilder.Sql(
                """UPDATE "Majors" SET "OldCode" = "OldCodes"[1] WHERE array_length("OldCodes", 1) > 0;""");

            migrationBuilder.DropColumn(
                name: "OldCodes",
                table: "Majors");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OldName",
                table: "Universities");

            migrationBuilder.DropColumn(
                name: "OldCode",
                table: "Majors");

            migrationBuilder.AddColumn<List<string>>(
                name: "OldCodes",
                table: "Majors",
                type: "text[]",
                nullable: false);
        }
    }
}
