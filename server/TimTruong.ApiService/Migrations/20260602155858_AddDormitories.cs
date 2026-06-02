using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TimTruong.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class AddDormitories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasDormitory",
                table: "Universities",
                type: "boolean",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Dormitories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Note = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RegistrationUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dormitories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UniversityDormitories",
                columns: table => new
                {
                    DormitoriesId = table.Column<int>(type: "integer", nullable: false),
                    UniversitiesId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UniversityDormitories", x => new { x.DormitoriesId, x.UniversitiesId });
                    table.ForeignKey(
                        name: "FK_UniversityDormitories_Dormitories_DormitoriesId",
                        column: x => x.DormitoriesId,
                        principalTable: "Dormitories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UniversityDormitories_Universities_UniversitiesId",
                        column: x => x.UniversitiesId,
                        principalTable: "Universities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Dormitories_Name",
                table: "Dormitories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UniversityDormitories_UniversitiesId",
                table: "UniversityDormitories",
                column: "UniversitiesId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UniversityDormitories");

            migrationBuilder.DropTable(
                name: "Dormitories");

            migrationBuilder.DropColumn(
                name: "HasDormitory",
                table: "Universities");
        }
    }
}
