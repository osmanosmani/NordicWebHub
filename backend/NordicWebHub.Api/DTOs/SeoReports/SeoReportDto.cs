namespace NordicWebHub.Api.DTOs.SeoReports;

public class SeoReportDto
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public int SeoScore { get; set; }

    public string TopKeywords { get; set; } = string.Empty;

    public string TechnicalIssues { get; set; } = string.Empty;

    public string Recommendations { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
