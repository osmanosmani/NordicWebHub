namespace NordicWebHub.Api.DTOs.SupportTickets;

public class TicketReplyDto
{
    public int Id { get; set; }

    public int SupportTicketId { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string UserEmail { get; set; } = string.Empty;

    public string UserFullName { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
