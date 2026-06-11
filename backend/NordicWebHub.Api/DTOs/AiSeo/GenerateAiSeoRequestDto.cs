using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.AiSeo;

public class GenerateAiSeoRequestDto
{
    [Required(ErrorMessage = "Industry is required.")]
    [StringLength(100, ErrorMessage = "Industry cannot be longer than 100 characters.")]
    public string Industry { get; set; } = string.Empty;

    [Required(ErrorMessage = "City is required.")]
    [StringLength(100, ErrorMessage = "City cannot be longer than 100 characters.")]
    public string City { get; set; } = string.Empty;
}
