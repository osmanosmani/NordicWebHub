using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NordicWebHub.Api.DTOs.Auth;
using NordicWebHub.Api.Models;

namespace NordicWebHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    SignInManager<ApplicationUser> signInManager)
    : ControllerBase
{
    private const string CustomerRole = "Customer";

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        var email = dto.Email.Trim();

        if (await userManager.FindByEmailAsync(email) is not null)
        {
            return BadRequest(new
            {
                message = "An account with this email already exists."
            });
        }

        await EnsureRoleExistsAsync(CustomerRole);

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await userManager.CreateAsync(user, dto.Password);
        if (!createResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "Registration failed. Please check the details and try again.",
                errors = GetIdentityErrors(createResult)
            });
        }

        var roleResult = await userManager.AddToRoleAsync(user, CustomerRole);
        if (!roleResult.Succeeded)
        {
            return BadRequest(new
            {
                message = "Account was created, but the customer role could not be assigned.",
                errors = GetIdentityErrors(roleResult)
            });
        }

        await signInManager.SignInAsync(user, isPersistent: true);

        return Ok(await CreateAuthResponseAsync(user));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email.Trim());

        if (user is null)
        {
            return Unauthorized(new
            {
                message = "Invalid login attempt."
            });
        }

        var signInResult = await signInManager.PasswordSignInAsync(
            user,
            dto.Password,
            isPersistent: true,
            lockoutOnFailure: true);

        if (signInResult.IsLockedOut)
        {
            return StatusCode(StatusCodes.Status423Locked, new
            {
                message = "Account is temporarily locked. Please try again later."
            });
        }

        if (!signInResult.Succeeded)
        {
            return Unauthorized(new
            {
                message = "Invalid login attempt."
            });
        }

        return Ok(await CreateAuthResponseAsync(user));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();

        return Ok(new
        {
            message = "You have been logged out."
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AuthResponseDto>> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new
            {
                message = "Your session is invalid. Please log in again."
            });
        }

        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Unauthorized(new
            {
                message = "User account was not found. Please log in again."
            });
        }

        return Ok(await CreateAuthResponseAsync(user));
    }

    private async Task<AuthResponseDto> CreateAuthResponseAsync(ApplicationUser user)
    {
        var role = await GetPrimaryRoleAsync(user);

        return new AuthResponseDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = GetFullName(user),
            Role = role
        };
    }

    private async Task<string> GetPrimaryRoleAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);

        return roles.FirstOrDefault() ?? CustomerRole;
    }

    private static string GetFullName(ApplicationUser user)
    {
        return $"{user.FirstName} {user.LastName}".Trim();
    }

    private async Task EnsureRoleExistsAsync(string roleName)
    {
        if (await roleManager.RoleExistsAsync(roleName))
        {
            return;
        }

        var result = await roleManager.CreateAsync(new IdentityRole(roleName));
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                $"Could not create role '{roleName}': {string.Join(", ", GetIdentityErrors(result))}");
        }
    }

    private static IEnumerable<string> GetIdentityErrors(IdentityResult result)
    {
        return result.Errors.Select(error => error.Description);
    }
}
