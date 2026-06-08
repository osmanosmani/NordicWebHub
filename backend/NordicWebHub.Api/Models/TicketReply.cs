namespace NordicWebHub.Api.Models;

public class TicketReply
{
    public int Id { get; set; }

    public int SupportTicketId { get; set; }

    public SupportTicket SupportTicket { get; set; } = null!;

    public string UserId { get; set; } = string.Empty;

    public ApplicationUser User { get; set; } = null!;

    public string Message { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
