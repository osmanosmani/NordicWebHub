using Microsoft.AspNetCore.Identity;

namespace NordicWebHub.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Company? Company { get; set; }

    public ICollection<ProjectRequest> ProjectRequests { get; set; } = new List<ProjectRequest>();

    public ICollection<SupportTicket> SupportTickets { get; set; } = new List<SupportTicket>();

    public ICollection<TicketReply> TicketReplies { get; set; } = new List<TicketReply>();

    public ICollection<AiSeoRequest> AiSeoRequests { get; set; } = new List<AiSeoRequest>();
}
