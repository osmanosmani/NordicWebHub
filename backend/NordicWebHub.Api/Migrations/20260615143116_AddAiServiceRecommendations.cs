using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NordicWebHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAiServiceRecommendations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InputJson",
                table: "AiSeoRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequestType",
                table: "AiSeoRequests",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Seo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InputJson",
                table: "AiSeoRequests");

            migrationBuilder.DropColumn(
                name: "RequestType",
                table: "AiSeoRequests");
        }
    }
}
