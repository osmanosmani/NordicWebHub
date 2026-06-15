using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.AiSeo;

public class GenerateAiServiceRecommendationDto
{
    [Required(ErrorMessage = "Business name is required.")]
    [StringLength(150, ErrorMessage = "Business name cannot be longer than 150 characters.")]
    public string BusinessName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Industry is required.")]
    [StringLength(100, ErrorMessage = "Industry cannot be longer than 100 characters.")]
    public string Industry { get; set; } = string.Empty;

    [Required(ErrorMessage = "City is required.")]
    [StringLength(100, ErrorMessage = "City cannot be longer than 100 characters.")]
    public string City { get; set; } = string.Empty;

    [Url(ErrorMessage = "Current website URL must be a valid URL.")]
    [StringLength(250, ErrorMessage = "Current website URL cannot be longer than 250 characters.")]
    public string? CurrentWebsiteUrl { get; set; }

    [Required(ErrorMessage = "Business goal is required.")]
    [StringLength(500, ErrorMessage = "Business goal cannot be longer than 500 characters.")]
    public string BusinessGoal { get; set; } = string.Empty;

    [Required(ErrorMessage = "Target customers are required.")]
    [StringLength(500, ErrorMessage = "Target customers cannot be longer than 500 characters.")]
    public string TargetCustomers { get; set; } = string.Empty;

    [Required(ErrorMessage = "Select at least one needed service.")]
    [MinLength(1, ErrorMessage = "Select at least one needed service.")]
    [MaxLength(8, ErrorMessage = "Select no more than 8 needed services.")]
    public IReadOnlyCollection<string> NeededServices { get; set; } = [];

    [Required(ErrorMessage = "Budget range is required.")]
    [StringLength(100, ErrorMessage = "Budget range cannot be longer than 100 characters.")]
    public string BudgetRange { get; set; } = string.Empty;

    [Required(ErrorMessage = "Preferred timeline is required.")]
    [StringLength(100, ErrorMessage = "Preferred timeline cannot be longer than 100 characters.")]
    public string PreferredTimeline { get; set; } = string.Empty;

    [StringLength(1000, ErrorMessage = "Notes cannot be longer than 1000 characters.")]
    public string? Notes { get; set; }
}
