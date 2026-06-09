using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.SupportTickets;

public class CreateSupportTicketDto
{
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, ErrorMessage = "Title cannot be longer than 200 characters.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(2000, ErrorMessage = "Description cannot be longer than 2000 characters.")]
    public string Description { get; set; } = string.Empty;

    public string Priority { get; set; } = "Medium";
}
