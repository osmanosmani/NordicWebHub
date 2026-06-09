using System.ComponentModel.DataAnnotations;

namespace NordicWebHub.Api.DTOs.ServicePackages;

public class UpdateServicePackageDto
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(150, ErrorMessage = "Name cannot be longer than 150 characters.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required.")]
    [StringLength(1000, ErrorMessage = "Description cannot be longer than 1000 characters.")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Category is required.")]
    [StringLength(100, ErrorMessage = "Category cannot be longer than 100 characters.")]
    public string Category { get; set; } = string.Empty;

    [Range(typeof(decimal), "0", "1000000000", ErrorMessage = "Monthly price cannot be negative.")]
    public decimal MonthlyPrice { get; set; }

    [Range(typeof(decimal), "0", "1000000000", ErrorMessage = "Setup fee cannot be negative.")]
    public decimal SetupFee { get; set; }

    [Required(ErrorMessage = "Delivery time is required.")]
    [StringLength(100, ErrorMessage = "Delivery time cannot be longer than 100 characters.")]
    public string DeliveryTime { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
