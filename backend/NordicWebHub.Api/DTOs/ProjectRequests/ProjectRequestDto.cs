namespace NordicWebHub.Api.DTOs.ProjectRequests;

public class ProjectRequestDto
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public int ServicePackageId { get; set; }

    public string ServicePackageName { get; set; } = string.Empty;

    public string CustomerId { get; set; } = string.Empty;

    public string CustomerEmail { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string BudgetRange { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
