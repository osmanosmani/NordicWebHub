using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.SupportTickets;

public class UpdateTicketStatusDto
{
    [Required(ErrorMessage = "Status is required.")]
    public string Status { get; set; } = string.Empty;
}
