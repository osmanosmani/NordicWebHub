using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NordicWebHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class EnforceOneCompanyPerCustomer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF EXISTS (
                    SELECT [OwnerId]
                    FROM [Companies]
                    GROUP BY [OwnerId]
                    HAVING COUNT(*) > 1
                )
                BEGIN
                    ;THROW 51000, 'Cannot enforce one company per customer while duplicate Company.OwnerId values exist. Reassign or remove duplicate companies, then run the migration again.', 1;
                END
                """);

            migrationBuilder.DropIndex(
                name: "IX_Companies_OwnerId",
                table: "Companies");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_OwnerId",
                table: "Companies",
                column: "OwnerId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Companies_OwnerId",
                table: "Companies");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_OwnerId",
                table: "Companies",
                column: "OwnerId");
        }
    }
}
