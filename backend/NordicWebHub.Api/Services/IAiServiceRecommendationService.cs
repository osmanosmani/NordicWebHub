using NordicWebHub.Api.DTOs.AiSeo;

namespace NordicWebHub.Api.Services;

public interface IAiServiceRecommendationService
{
    AiServiceRecommendationResultDto Generate(
        GenerateAiServiceRecommendationDto input);
}
