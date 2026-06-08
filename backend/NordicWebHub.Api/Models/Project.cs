using NordicWebHub.Api.Models.Enums;

namespace NordicWebHub.Api.Models;

public class Project
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public Company Company { get; set; } = null!;

    public int? ProjectRequestId { get; set; }

    public ProjectRequest? ProjectRequest { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public ProjectStatus Status { get; set; } = ProjectStatus.Planned;

    public DateTime StartDate { get; set; }

    public DateTime Deadline { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
