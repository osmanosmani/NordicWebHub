using NordicWebHub.Api.Models.Enums;

namespace NordicWebHub.Api.Models;

public class SupportTicket
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public Company Company { get; set; } = null!;

    public string CustomerId { get; set; } = string.Empty;

    public ApplicationUser Customer { get; set; } = null!;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public SupportTicketStatus Status { get; set; } = SupportTicketStatus.Open;

    public TicketPriority Priority { get; set; } = TicketPriority.Normal;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ClosedAt { get; set; }

    public ICollection<TicketReply> Replies { get; set; } = new List<TicketReply>();
}
