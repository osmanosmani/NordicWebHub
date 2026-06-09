namespace NordicWebHub.Api.Models;

public class SeoReport
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public Company Company { get; set; } = null!;

    public int SeoScore { get; set; }

    public string TopKeywords { get; set; } = string.Empty;

    public string TechnicalIssues { get; set; } = string.Empty;

    public string Recommendations { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
