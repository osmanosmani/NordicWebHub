using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.Projects;

public class UpdateProjectDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Company is required.")]
    public int CompanyId { get; set; }

    public int? ProjectRequestId { get; set; }

    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, ErrorMessage = "Title cannot be longer than 200 characters.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(2000, ErrorMessage = "Description cannot be longer than 2000 characters.")]
    public string Description { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime Deadline { get; set; }
}
