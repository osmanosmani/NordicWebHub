using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.ProjectRequests;

public class CreateProjectRequestDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Service package is required.")]
    public int ServicePackageId { get; set; }

    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, ErrorMessage = "Title cannot be longer than 200 characters.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(2000, ErrorMessage = "Description cannot be longer than 2000 characters.")]
    public string Description { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "Budget range cannot be longer than 100 characters.")]
    public string BudgetRange { get; set; } = string.Empty;
}
