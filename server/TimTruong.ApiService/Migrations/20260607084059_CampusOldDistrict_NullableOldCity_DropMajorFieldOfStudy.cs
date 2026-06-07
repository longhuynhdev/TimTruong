using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimTruong.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class CampusOldDistrict_NullableOldCity_DropMajorFieldOfStudy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FieldOfStudy",
                table: "Majors");

            migrationBuilder.AlterColumn<string>(
                name: "OldCity",
                table: "Campuses",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<string>(
                name: "OldDistrict",
                table: "Campuses",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OldDistrict",
                table: "Campuses");

            migrationBuilder.AddColumn<string>(
                name: "FieldOfStudy",
                table: "Majors",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "OldCity",
                table: "Campuses",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);
        }
    }
}
