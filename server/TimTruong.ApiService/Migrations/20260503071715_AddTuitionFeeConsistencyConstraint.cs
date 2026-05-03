using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimTruong.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class AddTuitionFeeConsistencyConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""Majors""
                ADD CONSTRAINT ""CK_Majors_TuitionFee_Consistency""
                CHECK (
                    (""TuitionFeeAmount"" IS NULL AND ""TuitionFeeUnit"" IS NULL) OR
                    (""TuitionFeeAmount"" IS NOT NULL AND ""TuitionFeeUnit"" IS NOT NULL)
                )
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""Majors""
                DROP CONSTRAINT ""CK_Majors_TuitionFee_Consistency""
            ");
        }
    }
}
