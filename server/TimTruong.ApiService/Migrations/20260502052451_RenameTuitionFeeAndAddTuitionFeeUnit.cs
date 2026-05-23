using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimTruong.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class RenameTuitionFeeAndAddTuitionFeeUnit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TuitionFee",
                table: "Majors",
                newName: "TuitionFeeAmount");

            migrationBuilder.AddColumn<int>(
                name: "TuitionFeeUnit",
                table: "Majors",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TuitionFeeUnit",
                table: "Majors");

            migrationBuilder.RenameColumn(
                name: "TuitionFeeAmount",
                table: "Majors",
                newName: "TuitionFee");
        }
    }
}
