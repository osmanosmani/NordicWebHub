using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.SupportTickets;

public class CreateTicketReplyDto
{
    [Required(ErrorMessage = "Message is required.")]
    [StringLength(4000, ErrorMessage = "Message cannot be longer than 4000 characters.")]
    public string Message { get; set; } = string.Empty;
}
