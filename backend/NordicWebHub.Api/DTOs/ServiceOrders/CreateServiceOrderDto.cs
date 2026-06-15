using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.ServiceOrders;

public class CreateServiceOrderDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Service package is required.")]
    public int ServicePackageId { get; set; }

    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, ErrorMessage = "Title cannot be longer than 200 characters.")]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000, ErrorMessage = "Notes cannot be longer than 2000 characters.")]
    public string Notes { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "Payment reference cannot be longer than 100 characters.")]
    public string? PaymentReference { get; set; }
}
