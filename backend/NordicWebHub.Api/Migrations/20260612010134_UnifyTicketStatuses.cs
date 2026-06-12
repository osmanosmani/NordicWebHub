using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NordicWebHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class UnifyTicketStatuses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                UPDATE [SupportTickets]
                SET [Status] = N'Closed',
                    [ClosedAt] = COALESCE([ClosedAt], SYSUTCDATETIME())
                WHERE [Status] = N'Resolved';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // The previous status cannot be restored reliably after normalization.
        }
    }
}
