using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.ProjectRequests;

public class UpdateProjectRequestStatusDto
{
    [Required(ErrorMessage = "Status is required.")]
    public string Status { get; set; } = string.Empty;
}
