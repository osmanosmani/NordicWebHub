using NordicWebHub.Api.Models.Enums;

namespace NordicWebHub.Api.Models;

public class ServiceOrder
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public Company Company { get; set; } = null!;

    public string CustomerId { get; set; } = string.Empty;

    public ApplicationUser Customer { get; set; } = null!;

    public int ServicePackageId { get; set; }

    public ServicePackage ServicePackage { get; set; } = null!;

    public string Title { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public ServiceOrderStatus Status { get; set; } = ServiceOrderStatus.Pending;

    public string? PaymentReference { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? PaidAt { get; set; }
}
