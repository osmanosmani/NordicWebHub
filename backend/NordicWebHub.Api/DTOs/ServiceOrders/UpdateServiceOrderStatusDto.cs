using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.ServiceOrders;

public class UpdateServiceOrderStatusDto
{
    [Required(ErrorMessage = "Status is required.")]
    public string Status { get; set; } = string.Empty;
}
