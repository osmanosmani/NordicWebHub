namespace NordicWebHub.Api.Models;

public class HostingStatus
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public Company Company { get; set; } = null!;

    public string DomainName { get; set; } = string.Empty;

    public bool IsOnline { get; set; }

    public DateTime LastCheckedAt { get; set; } = DateTime.UtcNow;

    public int StatusCode { get; set; }

    public string Notes { get; set; } = string.Empty;
}
