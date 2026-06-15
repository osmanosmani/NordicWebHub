using NordicWebHub.Api.Models.Enums;

namespace NordicWebHub.Api.Models;

public class AiSeoRequest
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public Company Company { get; set; } = null!;

    public string CustomerId { get; set; } = string.Empty;

    public ApplicationUser Customer { get; set; } = null!;

    public string Industry { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public AiSeoRequestType RequestType { get; set; } = AiSeoRequestType.Seo;

    public string? InputJson { get; set; }

    public string ResultJson { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
