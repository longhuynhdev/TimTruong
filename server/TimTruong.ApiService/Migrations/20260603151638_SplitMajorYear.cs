using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TimTruong.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class SplitMajorYear : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EnrollmentQuota",
                table: "Majors");

            migrationBuilder.DropColumn(
                name: "TuitionFeeAmount",
                table: "Majors");

            migrationBuilder.DropColumn(
                name: "TuitionFeeUnit",
                table: "Majors");

            migrationBuilder.CreateTable(
                name: "MajorYears",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MajorId = table.Column<int>(type: "integer", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    TuitionFeeMin = table.Column<decimal>(type: "numeric", nullable: true),
                    TuitionFeeMax = table.Column<decimal>(type: "numeric", nullable: true),
                    TuitionFeeUnit = table.Column<int>(type: "integer", nullable: true),
                    EnrollmentQuota = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MajorYears", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MajorYears_Majors_MajorId",
                        column: x => x.MajorId,
                        principalTable: "Majors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MajorYears_MajorId_Year",
                table: "MajorYears",
                columns: new[] { "MajorId", "Year" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MajorYears");

            migrationBuilder.AddColumn<int>(
                name: "EnrollmentQuota",
                table: "Majors",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TuitionFeeAmount",
                table: "Majors",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TuitionFeeUnit",
                table: "Majors",
                type: "integer",
                nullable: true);
        }
    }
}
