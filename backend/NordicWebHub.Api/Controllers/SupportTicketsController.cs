using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Data;
using NordicWebHub.Api.DTOs.SupportTickets;
using NordicWebHub.Api.Models;
using NordicWebHub.Api.Models.Enums;
using NordicWebHub.Api.Services;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize]
public class SupportTicketsController(
    ApplicationDbContext dbContext,
    ICurrentCustomerCompanyService currentCustomerCompanyService)
    : ControllerBase
{
    private const string AdminRole = "Admin";
    private const string CustomerRole = "Customer";

    private static readonly TicketStatus[] AllowedStatuses =
    [
        TicketStatus.Open,
        TicketStatus.InProgress,
        TicketStatus.WaitingForCustomer,
        TicketStatus.Closed
    ];

    [HttpGet]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<IEnumerable<SupportTicketDto>>> GetTickets()
    {
        var tickets = await TicketsWithDetails()
            .OrderBy(ticket => ticket.Status == TicketStatus.Closed)
            .ThenByDescending(ticket => ticket.CreatedAt)
            .ToListAsync();

        return Ok(tickets.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SupportTicketDto>> GetTicket(int id)
    {
        var ticket = await TicketsWithDetails()
            .FirstOrDefaultAsync(existingTicket => existingTicket.Id == id);

        if (ticket is null)
        {
            return NotFound(new
            {
                message = "Support ticket was not found."
            });
        }

        if (!User.IsInRole(AdminRole))
        {
            var company =
                await currentCustomerCompanyService.GetCurrentCustomerCompanyAsync();

            if (company is null)
            {
                return CustomerCompanyNotFound();
            }

            if (ticket.CompanyId != company.Id
                || ticket.CustomerId != GetCurrentUserId())
            {
                return Forbid();
            }
        }

        return Ok(ToDto(ticket));
    }

    [HttpGet("my")]
    [Authorize(Roles = CustomerRole)]
    public async Task<ActionResult<IEnumerable<SupportTicketDto>>> GetMyTickets()
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

        var tickets = await TicketsWithDetails()
            .Where(ticket =>
                ticket.CompanyId == company.Id
                && ticket.CustomerId == userId)
            .OrderBy(ticket => ticket.Status == TicketStatus.Closed)
            .ThenByDescending(ticket => ticket.CreatedAt)
            .ToListAsync();

        return Ok(tickets.Select(ToDto));
    }

    [HttpPost]
    [Authorize(Roles = CustomerRole)]
    public async Task<ActionResult<SupportTicketDto>> CreateTicket(CreateSupportTicketDto dto)
    {
        if (!ValidateRequiredText(dto.Title, dto.Description))
        {
            return BadRequest(new
            {
                message = "Please add a title and description for your ticket."
            });
        }

        if (!TryParsePriority(dto.Priority, out var priority))
        {
            return InvalidPriorityResponse();
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

        var ticket = new SupportTicket
        {
            CompanyId = company.Id,
            CustomerId = userId,
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Status = TicketStatus.Open,
            Priority = priority,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.SupportTickets.Add(ticket);
        await dbContext.SaveChangesAsync();

        var createdTicket = await TicketsWithDetails()
            .FirstAsync(existingTicket => existingTicket.Id == ticket.Id);

        return CreatedAtAction(
            nameof(GetTicket),
            new { id = createdTicket.Id },
            ToDto(createdTicket));
    }

    [HttpPost("{id:int}/reply")]
    public async Task<ActionResult<SupportTicketDto>> ReplyToTicket(
        int id,
        CreateTicketReplyDto dto)
    {
        if (!ValidateRequiredText(dto.Message))
        {
            return BadRequest(new
            {
                message = "Reply message is required."
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

        var ticket = await dbContext.SupportTickets
            .Include(existingTicket => existingTicket.Company)
            .Include(existingTicket => existingTicket.Customer)
            .FirstOrDefaultAsync(existingTicket => existingTicket.Id == id);

        if (ticket is null)
        {
            return NotFound(new
            {
                message = "Support ticket was not found."
            });
        }

        if (!User.IsInRole(AdminRole))
        {
            var company =
                await currentCustomerCompanyService.GetCurrentCustomerCompanyAsync();

            if (company is null)
            {
                return CustomerCompanyNotFound();
            }

            if (ticket.CompanyId != company.Id
                || ticket.CustomerId != userId)
            {
                return Forbid();
            }
        }

        var reply = new TicketReply
        {
            SupportTicketId = ticket.Id,
            UserId = userId,
            Message = dto.Message.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.TicketReplies.Add(reply);
        await dbContext.SaveChangesAsync();

        var updatedTicket = await TicketsWithDetails()
            .FirstAsync(existingTicket => existingTicket.Id == ticket.Id);

        return Ok(ToDto(updatedTicket));
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<SupportTicketDto>> UpdateTicketStatus(
        int id,
        UpdateTicketStatusDto dto)
    {
        if (!TryParseStatus(dto.Status, out var status))
        {
            return InvalidStatusResponse();
        }

        var ticket = await dbContext.SupportTickets
            .FirstOrDefaultAsync(existingTicket => existingTicket.Id == id);

        if (ticket is null)
        {
            return NotFound(new
            {
                message = "Support ticket was not found."
            });
        }

        ticket.Status = status;
        ticket.ClosedAt = status == TicketStatus.Closed ? DateTime.UtcNow : null;

        await dbContext.SaveChangesAsync();

        var updatedTicket = await TicketsWithDetails()
            .FirstAsync(existingTicket => existingTicket.Id == ticket.Id);

        return Ok(ToDto(updatedTicket));
    }

    [HttpPut("{id:int}/priority")]
    [Authorize(Roles = AdminRole)]
    public async Task<ActionResult<SupportTicketDto>> UpdateTicketPriority(
        int id,
        UpdateTicketPriorityDto dto)
    {
        if (!TryParsePriority(dto.Priority, out var priority))
        {
            return InvalidPriorityResponse();
        }

        var ticket = await dbContext.SupportTickets
            .FirstOrDefaultAsync(existingTicket => existingTicket.Id == id);

        if (ticket is null)
        {
            return NotFound(new
            {
                message = "Support ticket was not found."
            });
        }

        ticket.Priority = priority;

        await dbContext.SaveChangesAsync();

        var updatedTicket = await TicketsWithDetails()
            .FirstAsync(existingTicket => existingTicket.Id == ticket.Id);

        return Ok(ToDto(updatedTicket));
    }

    private IQueryable<SupportTicket> TicketsWithDetails()
    {
        return dbContext.SupportTickets
            .AsNoTracking()
            .Include(ticket => ticket.Company)
            .Include(ticket => ticket.Customer)
            .Include(ticket => ticket.Replies.OrderBy(reply => reply.CreatedAt))
            .ThenInclude(reply => reply.User);
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private static SupportTicketDto ToDto(SupportTicket ticket)
    {
        return new SupportTicketDto
        {
            Id = ticket.Id,
            CompanyId = ticket.CompanyId,
            CompanyName = ticket.Company.Name,
            CustomerId = ticket.CustomerId,
            CustomerEmail = ticket.Customer.Email ?? string.Empty,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status.ToString(),
            Priority = ToPriorityLabel(ticket.Priority),
            CreatedAt = ticket.CreatedAt,
            ClosedAt = ticket.ClosedAt,
            Replies = ticket.Replies
                .OrderBy(reply => reply.CreatedAt)
                .Select(ToDto)
                .ToList()
        };
    }

    private static TicketReplyDto ToDto(TicketReply reply)
    {
        return new TicketReplyDto
        {
            Id = reply.Id,
            SupportTicketId = reply.SupportTicketId,
            UserId = reply.UserId,
            UserEmail = reply.User.Email ?? string.Empty,
            UserFullName = GetFullName(reply.User),
            Message = reply.Message,
            CreatedAt = reply.CreatedAt
        };
    }

    private static bool TryParseStatus(string? value, out TicketStatus status)
    {
        status = TicketStatus.Open;

        return !string.IsNullOrWhiteSpace(value)
            && Enum.TryParse(value.Trim(), ignoreCase: true, out status)
            && AllowedStatuses.Contains(status);
    }

    private static bool TryParsePriority(string? value, out TicketPriority priority)
    {
        priority = TicketPriority.Normal;

        if (string.IsNullOrWhiteSpace(value))
        {
            return true;
        }

        var normalizedValue = value.Trim();
        if (normalizedValue.Equals("Medium", StringComparison.OrdinalIgnoreCase))
        {
            priority = TicketPriority.Normal;
            return true;
        }

        return Enum.TryParse(normalizedValue, ignoreCase: true, out priority)
            && priority is TicketPriority.Low or TicketPriority.Normal or TicketPriority.High or TicketPriority.Urgent;
    }

    private static string ToPriorityLabel(TicketPriority priority)
    {
        return priority == TicketPriority.Normal ? "Medium" : priority.ToString();
    }

    private static string GetFullName(ApplicationUser user)
    {
        return $"{user.FirstName} {user.LastName}".Trim();
    }

    private static bool ValidateRequiredText(params string?[] values)
    {
        return values.All(value => !string.IsNullOrWhiteSpace(value));
    }

    private BadRequestObjectResult InvalidStatusResponse()
    {
        return BadRequest(new
        {
            message = "Status must be one of: Open, InProgress, WaitingForCustomer, Closed."
        });
    }

    private BadRequestObjectResult InvalidPriorityResponse()
    {
        return BadRequest(new
        {
            message = "Priority must be one of: Low, Medium, High, Urgent."
        });
    }

    private NotFoundObjectResult CustomerCompanyNotFound()
    {
        return NotFound(new
        {
            message = CurrentCustomerCompanyService.NoCompanyMessage
        });
    }
}
