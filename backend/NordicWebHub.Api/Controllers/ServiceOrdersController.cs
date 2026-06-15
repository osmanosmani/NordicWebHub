using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.ServiceOrders;
using NordicWebHub.Api.Models;
using NordicWebHub.Api.Models.Enums;
using NordicWebHub.Api.Services;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/service-orders")]
[Authorize]
public class ServiceOrdersController(
    ApplicationDbContext dbContext,
    ICurrentCustomerCompanyService currentCustomerCompanyService)
    : ControllerBase
{
    private const string AdminRole = "Admin";
    private const string CustomerRole = "Customer";

    [HttpGet]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<IEnumerable<ServiceOrderDto>>> GetServiceOrders()
    {
        var orders = await ServiceOrdersWithDetails()
            .OrderByDescending(serviceOrder => serviceOrder.CreatedAt)
            .ToListAsync();

        return Ok(orders.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<ServiceOrderDto>> GetServiceOrder(int id)
    {
        var serviceOrder = await ServiceOrdersWithDetails()
            .FirstOrDefaultAsync(order => order.Id == id);

        if (serviceOrder is null)
        {
            return NotFound(new
            {
                message = "Service order was not found."
            });
        }

        return Ok(ToDto(serviceOrder));
    }

    [HttpGet("my")]
    [Authorize(Roles = CustomerRole)]
    public async Task<ActionResult<IEnumerable<ServiceOrderDto>>> GetMyServiceOrders()
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new
            {
                message = "Your session is invalid. Please log in again."
            });
        }

        var company =
            await currentCustomerCompanyService.GetCurrentCustomerCompanyAsync();

        if (company is null)
        {
            return CustomerCompanyNotFound();
        }

        var orders = await ServiceOrdersWithDetails()
            .Where(serviceOrder =>
                serviceOrder.CompanyId == company.Id
                && serviceOrder.CustomerId == userId)
            .OrderByDescending(serviceOrder => serviceOrder.CreatedAt)
            .ToListAsync();

        return Ok(orders.Select(ToDto));
    }

    [HttpPost]
    [Authorize(Roles = CustomerRole)]
    public async Task<ActionResult<ServiceOrderDto>> CreateServiceOrder(
        CreateServiceOrderDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            return BadRequest(new
            {
                message = "Title is required."
            });
        }

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new
            {
                message = "Your session is invalid. Please log in again."
            });
        }

        var company =
            await currentCustomerCompanyService.GetCurrentCustomerCompanyAsync();

        if (company is null)
        {
            return CustomerCompanyNotFound();
        }

        var servicePackage = await dbContext.ServicePackages
            .AsNoTracking()
            .FirstOrDefaultAsync(package =>
                package.Id == dto.ServicePackageId && package.IsActive);

        if (servicePackage is null)
        {
            return BadRequest(new
            {
                message = "Service package was not found or is not active."
            });
        }

        var amount = servicePackage.SetupFee + servicePackage.MonthlyPrice;
        if (amount < 0)
        {
            return BadRequest(new
            {
                message = "The selected service package has an invalid amount."
            });
        }

        var now = DateTime.UtcNow;
        var serviceOrder = new ServiceOrder
        {
            CompanyId = company.Id,
            CustomerId = userId,
            ServicePackageId = servicePackage.Id,
            Title = dto.Title.Trim(),
            Notes = NormalizeOptionalText(dto.Notes),
            Amount = amount,
            Status = ServiceOrderStatus.Pending,
            PaymentReference = NormalizeOptionalTextOrNull(dto.PaymentReference),
            CreatedAt = now,
            UpdatedAt = now
        };

        dbContext.ServiceOrders.Add(serviceOrder);
        await dbContext.SaveChangesAsync();

        var createdOrder = await ServiceOrdersWithDetails()
            .FirstAsync(order => order.Id == serviceOrder.Id);

        return Created(
            "/api/service-orders/my",
            ToDto(createdOrder));
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<ServiceOrderDto>> UpdateServiceOrderStatus(
        int id,
        UpdateServiceOrderStatusDto dto)
    {
        if (!TryParseStatus(dto.Status, out var status))
        {
            return BadRequest(new
            {
                message = "Status must be one of: Pending, Approved, Paid, Cancelled."
            });
        }

        var serviceOrder = await dbContext.ServiceOrders
            .Include(order => order.Company)
            .Include(order => order.Customer)
            .Include(order => order.ServicePackage)
            .FirstOrDefaultAsync(order => order.Id == id);

        if (serviceOrder is null)
        {
            return NotFound(new
            {
                message = "Service order was not found."
            });
        }

        var now = DateTime.UtcNow;
        serviceOrder.Status = status;
        serviceOrder.UpdatedAt = now;
        serviceOrder.PaidAt = status == ServiceOrderStatus.Paid
            ? serviceOrder.PaidAt ?? now
            : null;

        await dbContext.SaveChangesAsync();

        return Ok(ToDto(serviceOrder));
    }

    private IQueryable<ServiceOrder> ServiceOrdersWithDetails()
    {
        return dbContext.ServiceOrders
            .AsNoTracking()
            .Include(serviceOrder => serviceOrder.Company)
            .Include(serviceOrder => serviceOrder.Customer)
            .Include(serviceOrder => serviceOrder.ServicePackage);
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private static ServiceOrderDto ToDto(ServiceOrder serviceOrder)
    {
        return new ServiceOrderDto
        {
            Id = serviceOrder.Id,
            CompanyId = serviceOrder.CompanyId,
            CompanyName = serviceOrder.Company.Name,
            CustomerId = serviceOrder.CustomerId,
            CustomerEmail = serviceOrder.Customer.Email ?? string.Empty,
            ServicePackageId = serviceOrder.ServicePackageId,
            ServicePackageName = serviceOrder.ServicePackage.Name,
            Title = serviceOrder.Title,
            Notes = serviceOrder.Notes,
            Amount = serviceOrder.Amount,
            Status = serviceOrder.Status.ToString(),
            PaymentReference = serviceOrder.PaymentReference,
            CreatedAt = serviceOrder.CreatedAt,
            UpdatedAt = serviceOrder.UpdatedAt,
            PaidAt = serviceOrder.PaidAt
        };
    }

    private static bool TryParseStatus(
        string? value,
        out ServiceOrderStatus status)
    {
        status = ServiceOrderStatus.Pending;

        return !string.IsNullOrWhiteSpace(value)
            && Enum.TryParse(value.Trim(), ignoreCase: true, out status)
            && Enum.IsDefined(status);
    }

    private static string NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim();
    }

    private static string? NormalizeOptionalTextOrNull(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private NotFoundObjectResult CustomerCompanyNotFound()
    {
        return NotFound(new
        {
            message = CurrentCustomerCompanyService.NoCompanyMessage
        });
    }
}
