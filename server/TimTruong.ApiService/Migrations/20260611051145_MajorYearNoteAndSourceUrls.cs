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
                name: "QuotaSourceUrl",
                table: "MajorYears",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TuitionSourceUrl",
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
                name: "QuotaSourceUrl",
                table: "MajorYears");

            migrationBuilder.DropColumn(
                name: "TuitionSourceUrl",
                table: "MajorYears");

            migrationBuilder.DropColumn(
                name: "SourceUrl",
                table: "AdmissionRequirements");
        }
    }
}
