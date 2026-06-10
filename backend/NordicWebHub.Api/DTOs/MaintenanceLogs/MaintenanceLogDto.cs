namespace NordicWebHub.Api.DTOs.MaintenanceLogs;

public class MaintenanceLogDto
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string ActionTaken { get; set; } = string.Empty;

    public string Result { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
