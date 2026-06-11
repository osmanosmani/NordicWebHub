using NordicWebHub.Api.DTOs.AiSeo;

namespace NordicWebHub.Api.Services;

public interface IAiSeoService
{
    Task<AiSeoResultDto> GenerateAsync(
        string industry,
        string city,
        CancellationToken cancellationToken = default);
}
