using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.MaintenanceLogs;

public class UpdateMaintenanceLogDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Company is required.")]
    public int CompanyId { get; set; }

    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, ErrorMessage = "Title cannot be longer than 200 characters.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(2000, ErrorMessage = "Description cannot be longer than 2000 characters.")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Action taken is required.")]
    [StringLength(2000, ErrorMessage = "Action taken cannot be longer than 2000 characters.")]
    public string ActionTaken { get; set; } = string.Empty;

    [Required(ErrorMessage = "Result is required.")]
    [StringLength(1000, ErrorMessage = "Result cannot be longer than 1000 characters.")]
    public string Result { get; set; } = string.Empty;
}
