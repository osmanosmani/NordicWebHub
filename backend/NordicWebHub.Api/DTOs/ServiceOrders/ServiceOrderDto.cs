namespace NordicWebHub.Api.DTOs.ServiceOrders;

public class ServiceOrderDto
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string CustomerId { get; set; } = string.Empty;

    public string CustomerEmail { get; set; } = string.Empty;

    public int ServicePackageId { get; set; }

    public string ServicePackageName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Notes { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? PaymentReference { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public DateTime? PaidAt { get; set; }
}
