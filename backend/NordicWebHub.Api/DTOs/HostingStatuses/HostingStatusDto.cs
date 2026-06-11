namespace NordicWebHub.Api.DTOs.HostingStatuses;

public class HostingStatusDto
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string DomainName { get; set; } = string.Empty;

    public bool IsOnline { get; set; }

    public DateTime LastCheckedAt { get; set; }

    public int StatusCode { get; set; }

    public string Notes { get; set; } = string.Empty;
}
