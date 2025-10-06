using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimTruong.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class MapMajorToUniversity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Majors_Campuses_CampusId",
                table: "Majors");

            migrationBuilder.RenameColumn(
                name: "CampusId",
                table: "Majors",
                newName: "UniversityId");

            migrationBuilder.RenameIndex(
                name: "IX_Majors_CampusId",
                table: "Majors",
                newName: "IX_Majors_UniversityId");

            migrationBuilder.AddForeignKey(
                name: "FK_Majors_Universities_UniversityId",
                table: "Majors",
                column: "UniversityId",
                principalTable: "Universities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Majors_Universities_UniversityId",
                table: "Majors");

            migrationBuilder.RenameColumn(
                name: "UniversityId",
                table: "Majors",
                newName: "CampusId");

            migrationBuilder.RenameIndex(
                name: "IX_Majors_UniversityId",
                table: "Majors",
                newName: "IX_Majors_CampusId");

            migrationBuilder.AddForeignKey(
                name: "FK_Majors_Campuses_CampusId",
                table: "Majors",
                column: "CampusId",
                principalTable: "Campuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
