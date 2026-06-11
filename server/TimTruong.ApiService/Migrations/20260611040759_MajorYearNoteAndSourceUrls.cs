using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimTruong.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class MajorYearNoteAndSourceUrls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "MajorYears",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceUrl",
                table: "MajorYears",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceUrl",
                table: "AdmissionRequirements",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Note",
                table: "MajorYears");

            migrationBuilder.DropColumn(
                name: "SourceUrl",
                table: "MajorYears");

            migrationBuilder.DropColumn(
                name: "SourceUrl",
                table: "AdmissionRequirements");
        }
    }
}
