namespace NordicWebHub.Api.DTOs.AiSeo;

public class AiServiceRecommendationResultDto
{
    public string RecommendedPackageName { get; set; } = string.Empty;

    public IReadOnlyCollection<string> RecommendedServices { get; set; } = [];

    public IReadOnlyCollection<string> SuggestedWebsiteStructure { get; set; } = [];

    public IReadOnlyCollection<string> SuggestedSeoKeywords { get; set; } = [];

    public string EstimatedPriority { get; set; } = string.Empty;

    public IReadOnlyCollection<string> NextSteps { get; set; } = [];

    public string Explanation { get; set; } = string.Empty;
}
