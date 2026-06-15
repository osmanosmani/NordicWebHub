namespace NordicWebHub.Api.Models;

public class ServicePackage
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public decimal MonthlyPrice { get; set; }

    public decimal SetupFee { get; set; }

    public string DeliveryTime { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProjectRequest> ProjectRequests { get; set; } = new List<ProjectRequest>();

    public ICollection<ServiceOrder> ServiceOrders { get; set; } = new List<ServiceOrder>();
}
