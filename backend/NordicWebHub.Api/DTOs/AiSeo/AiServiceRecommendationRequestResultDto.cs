namespace NordicWebHub.Api.DTOs.AiSeo;

public class AiServiceRecommendationRequestResultDto
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string CustomerEmail { get; set; } = string.Empty;

    public GenerateAiServiceRecommendationDto Input { get; set; } = new();

    public AiServiceRecommendationResultDto Result { get; set; } = new();

    public DateTime CreatedAt { get; set; }
}
