namespace NordicWebHub.Api.DTOs.Dashboard;

public class DashboardProjectDto
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime Deadline { get; set; }

    public DateTime CreatedAt { get; set; }
}
