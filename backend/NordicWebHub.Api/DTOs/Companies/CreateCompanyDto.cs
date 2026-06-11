using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.Companies;

public class CreateCompanyDto
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(150, ErrorMessage = "Name cannot be longer than 150 characters.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Organization number is required.")]
    [RegularExpression(@"^\d{6}-\d{4}$", ErrorMessage = "Organization number must match Swedish format XXXXXX-XXXX.")]
    public string OrgNumber { get; set; } = string.Empty;

    [Url(ErrorMessage = "Website URL must be a valid URL.")]
    [StringLength(250, ErrorMessage = "Website URL cannot be longer than 250 characters.")]
    public string? WebsiteUrl { get; set; }

    [Required(ErrorMessage = "City is required.")]
    [StringLength(100, ErrorMessage = "City cannot be longer than 100 characters.")]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "Industry is required.")]
    [StringLength(100, ErrorMessage = "Industry cannot be longer than 100 characters.")]
    public string Industry { get; set; } = string.Empty;

    [StringLength(50, ErrorMessage = "Phone cannot be longer than 50 characters.")]
    public string Phone { get; set; } = string.Empty;

    public string? OwnerId { get; set; }
}
