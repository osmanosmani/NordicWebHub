using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.SeoReports;

public class CreateSeoReportDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Company is required.")]
    public int CompanyId { get; set; }

    [Range(0, 100, ErrorMessage = "SEO score must be between 0 and 100.")]
    public int SeoScore { get; set; }

    [Required(ErrorMessage = "Top keywords are required.")]
    [StringLength(1000, ErrorMessage = "Top keywords cannot be longer than 1000 characters.")]
    public string TopKeywords { get; set; } = string.Empty;

    [Required(ErrorMessage = "Technical issues are required.")]
    [StringLength(2000, ErrorMessage = "Technical issues cannot be longer than 2000 characters.")]
    public string TechnicalIssues { get; set; } = string.Empty;

    [Required(ErrorMessage = "Recommendations are required.")]
    [StringLength(2000, ErrorMessage = "Recommendations cannot be longer than 2000 characters.")]
    public string Recommendations { get; set; } = string.Empty;
}
