using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimTruong.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class updateUniversitysfields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EnglishName",
                table: "Campuses");

            migrationBuilder.DropColumn(
                name: "ShortName",
                table: "Campuses");

            migrationBuilder.AddColumn<string>(
                name: "EnglishName",
                table: "Universities",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShortName",
                table: "Universities",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EnglishName",
                table: "Universities");

            migrationBuilder.DropColumn(
                name: "ShortName",
                table: "Universities");

            migrationBuilder.AddColumn<string>(
                name: "EnglishName",
                table: "Campuses",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShortName",
                table: "Campuses",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }
    }
}
