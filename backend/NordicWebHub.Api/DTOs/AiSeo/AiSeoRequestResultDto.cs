namespace NordicWebHub.Api.DTOs.AiSeo;

public class AiSeoRequestResultDto
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string Industry { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public AiSeoResultDto Result { get; set; } = new();

    public DateTime CreatedAt { get; set; }
}
