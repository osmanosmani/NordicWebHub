namespace NordicWebHub.Api.Models;

public class Company
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string OrgNumber { get; set; } = string.Empty;

    public string WebsiteUrl { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string Industry { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string OwnerId { get; set; } = string.Empty;

    public ApplicationUser Owner { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProjectRequest> ProjectRequests { get; set; } = new List<ProjectRequest>();

    public ICollection<Project> Projects { get; set; } = new List<Project>();

    public ICollection<SupportTicket> SupportTickets { get; set; } = new List<SupportTicket>();
}
