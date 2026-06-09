using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.Projects;

public class UpdateProjectStatusDto
{
    [Required(ErrorMessage = "Status is required.")]
    public string Status { get; set; } = string.Empty;
}
