namespace NordicWebHub.Api.DTOs.Projects;

public class ProjectDto
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public int? ProjectRequestId { get; set; }

    public string ProjectRequestTitle { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime Deadline { get; set; }

    public DateTime CreatedAt { get; set; }
}
