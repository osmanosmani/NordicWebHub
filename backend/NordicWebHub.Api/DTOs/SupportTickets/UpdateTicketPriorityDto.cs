using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.SupportTickets;

public class UpdateTicketPriorityDto
{
    [Required(ErrorMessage = "Priority is required.")]
    public string Priority { get; set; } = string.Empty;
}
