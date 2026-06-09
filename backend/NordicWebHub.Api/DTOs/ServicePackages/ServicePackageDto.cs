namespace NordicWebHub.Api.DTOs.ServicePackages;

public class ServicePackageDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public decimal MonthlyPrice { get; set; }

    public decimal SetupFee { get; set; }

    public string DeliveryTime { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }
}
