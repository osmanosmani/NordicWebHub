using NordicWebHub.Api.Models.Enums;

namespace NordicWebHub.Api.Models;

public class ProjectRequest
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public Company Company { get; set; } = null!;

    public int ServicePackageId { get; set; }

    public ServicePackage ServicePackage { get; set; } = null!;

    public string CustomerId { get; set; } = string.Empty;

    public ApplicationUser Customer { get; set; } = null!;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string BudgetRange { get; set; } = string.Empty;

    public ProjectRequestStatus Status { get; set; } = ProjectRequestStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Project? Project { get; set; }
}
