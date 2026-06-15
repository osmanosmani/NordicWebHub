using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Models;
using NordicWebHub.Api.Models.Enums;

namespace NordicWebHub.Api.Data;

public static class DbInitializer
{
    private const string AdminRole = "Admin";
    private const string CustomerRole = "Customer";
    private const string AdminEmail = "admin@nordicwebhub.se";
    private const string CustomerEmail = "customer@nordicwebhub.se";
    private const string DemoCustomerEmail = "demo@nordicwebhub.se";

    // Development/demo seed data only. Do not use these credentials or records in production.
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger("NordicWebHub.Api.Data.DbInitializer");
        var resetDemoData = configuration.GetValue<bool>("SeedData:ResetDemoData");

        logger.LogInformation(
            "Starting development demo seed. ResetDemoData: {ResetDemoData}.",
            resetDemoData);

        await dbContext.Database.MigrateAsync();

        await SeedRoleAsync(roleManager, AdminRole, logger);
        await SeedRoleAsync(roleManager, CustomerRole, logger);

        var admin = await SeedUserAsync(
            userManager,
            AdminEmail,
            "Admin123!",
            "Saga",
            "Lind",
            resetDemoData,
            logger);
        var customer = await SeedUserAsync(
            userManager,
            CustomerEmail,
            "Customer123!",
            "Erik",
            "Holm",
            resetDemoData,
            logger);
        var demoCustomer = await SeedUserAsync(
            userManager,
            DemoCustomerEmail,
            "Customer123!",
            "Maja",
            "Berg",
            resetDemoData,
            logger);

        await AddUserToRoleAsync(userManager, admin, AdminRole, logger);
        await AddUserToRoleAsync(userManager, customer, CustomerRole, logger);
        await AddUserToRoleAsync(userManager, demoCustomer, CustomerRole, logger);

        var packages = await SeedServicePackagesAsync(
            dbContext,
            resetDemoData,
            logger);
        var companies = await SeedCompaniesAsync(
            dbContext,
            customer.Id,
            demoCustomer.Id,
            resetDemoData,
            logger);
        await SeedServiceOrdersAsync(
            dbContext,
            companies,
            packages,
            customer.Id,
            demoCustomer.Id,
            resetDemoData,
            logger);
        var requests = await SeedProjectRequestsAsync(
            dbContext,
            companies,
            packages,
            customer.Id,
            demoCustomer.Id,
            resetDemoData);
        var tickets = await SeedSupportTicketsAsync(
            dbContext,
            companies,
            customer.Id,
            demoCustomer.Id,
            resetDemoData);

        await SeedProjectsAsync(dbContext, companies, requests, resetDemoData);
        await SeedTicketRepliesAsync(dbContext, tickets, customer.Id, demoCustomer.Id, admin.Id);
        await SeedMaintenanceLogsAsync(dbContext, companies, resetDemoData);
        await SeedHostingStatusesAsync(dbContext, companies, resetDemoData);
        await SeedSeoReportsAsync(dbContext, companies, resetDemoData);
        await SeedAiSeoRequestsAsync(
            dbContext,
            companies,
            customer.Id,
            demoCustomer.Id,
            resetDemoData);

        logger.LogInformation("Development demo seed completed.");
    }

    private static async Task SeedRoleAsync(
        RoleManager<IdentityRole> roleManager,
        string roleName,
        ILogger logger)
    {
        if (await roleManager.RoleExistsAsync(roleName))
        {
            logger.LogInformation("Demo seed role already exists: {RoleName}.", roleName);
            return;
        }

        var result = await roleManager.CreateAsync(new IdentityRole(roleName));
        ThrowIfFailed(result, $"Failed to create role '{roleName}'.");
        logger.LogInformation("Demo seed role created: {RoleName}.", roleName);
    }

    private static async Task<ApplicationUser> SeedUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string password,
        string firstName,
        string lastName,
        bool resetDemoData,
        ILogger logger)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is not null)
        {
            var requiresUpdate = ResetDemoUserLockout(user);

            if (resetDemoData)
            {
                user.FirstName = firstName;
                user.LastName = lastName;
                user.EmailConfirmed = true;
                requiresUpdate = true;
            }

            if (requiresUpdate)
            {
                var updateResult = await userManager.UpdateAsync(user);
                ThrowIfFailed(updateResult, $"Failed to update demo user '{email}'.");
            }

            if (resetDemoData)
            {
                await ResetDemoUserPasswordAsync(userManager, user, password);
                logger.LogInformation("Demo seed user reset: {Email}.", email);
            }
            else
            {
                logger.LogInformation("Demo seed user already exists: {Email}.", email);
            }

            return user;
        }

        user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FirstName = firstName,
            LastName = lastName,
            AccessFailedCount = 0,
            LockoutEnd = null,
            LockoutEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        var createResult = await userManager.CreateAsync(user, password);
        ThrowIfFailed(createResult, $"Failed to create demo user '{email}'.");
        logger.LogInformation("Demo seed user created: {Email}.", email);

        return user;
    }

    private static bool ResetDemoUserLockout(ApplicationUser user)
    {
        var requiresUpdate = user.AccessFailedCount != 0
            || user.LockoutEnd is not null
            || !user.LockoutEnabled;

        user.AccessFailedCount = 0;
        user.LockoutEnd = null;
        user.LockoutEnabled = true;

        return requiresUpdate;
    }

    private static async Task ResetDemoUserPasswordAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string password)
    {
        var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);
        var result = await userManager.ResetPasswordAsync(user, resetToken, password);
        ThrowIfFailed(result, $"Failed to reset demo user '{user.Email}'.");
    }

    private static async Task AddUserToRoleAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string roleName,
        ILogger logger)
    {
        if (await userManager.IsInRoleAsync(user, roleName))
        {
            logger.LogInformation(
                "Demo seed user {Email} already has role {RoleName}.",
                user.Email,
                roleName);
            return;
        }

        var result = await userManager.AddToRoleAsync(user, roleName);
        ThrowIfFailed(result, $"Failed to add user '{user.Email}' to role '{roleName}'.");
        logger.LogInformation(
            "Demo seed assigned role {RoleName} to {Email}.",
            roleName,
            user.Email);
    }

    private static async Task<Dictionary<string, ServicePackage>> SeedServicePackagesAsync(
        ApplicationDbContext dbContext,
        bool resetDemoData,
        ILogger logger)
    {
        var packages = new[]
        {
            new ServicePackage
            {
                Name = "Starter Website",
                Description = "A polished starter website for small companies that need a trustworthy online presence.",
                Category = "Web Design",
                MonthlyPrice = 499,
                SetupFee = 4990,
                DeliveryTime = "2-3 weeks",
                IsActive = true
            },
            new ServicePackage
            {
                Name = "Business Website",
                Description = "A larger website package with stronger conversion sections, service pages, and structured content.",
                Category = "Web Design",
                MonthlyPrice = 999,
                SetupFee = 12990,
                DeliveryTime = "4-6 weeks",
                IsActive = true
            },
            new ServicePackage
            {
                Name = "SEO Basic",
                Description = "Technical SEO setup, metadata cleanup, sitemap review, and basic keyword alignment.",
                Category = "SEO",
                MonthlyPrice = 1499,
                SetupFee = 2990,
                DeliveryTime = "1-2 weeks",
                IsActive = true
            },
            new ServicePackage
            {
                Name = "SEO Growth",
                Description = "Ongoing SEO improvements, content recommendations, monthly reports, and local search optimization.",
                Category = "SEO",
                MonthlyPrice = 3990,
                SetupFee = 4990,
                DeliveryTime = "Monthly",
                IsActive = true
            },
            new ServicePackage
            {
                Name = "Hosting & Maintenance",
                Description = "Managed hosting, CMS updates, uptime checks, backups, and maintenance support.",
                Category = "Support",
                MonthlyPrice = 799,
                SetupFee = 0,
                DeliveryTime = "1 week",
                IsActive = true
            },
            new ServicePackage
            {
                Name = "E-commerce Setup",
                Description = "Store setup for product pages, payments, checkout, shipping rules, and launch support.",
                Category = "E-commerce",
                MonthlyPrice = 1999,
                SetupFee = 19990,
                DeliveryTime = "6-8 weeks",
                IsActive = true
            }
        };

        var seededPackages = new Dictionary<string, ServicePackage>();

        foreach (var servicePackage in packages)
        {
            var existingPackage = await dbContext.ServicePackages
                .FirstOrDefaultAsync(package => package.Name == servicePackage.Name);

            if (existingPackage is null)
            {
                servicePackage.CreatedAt = DateTime.UtcNow;
                dbContext.ServicePackages.Add(servicePackage);
                seededPackages[servicePackage.Name] = servicePackage;
                logger.LogInformation(
                    "Demo seed package created: {PackageName}.",
                    servicePackage.Name);
                continue;
            }

            seededPackages[servicePackage.Name] = existingPackage;
            logger.LogInformation(
                "Demo seed package already exists: {PackageName}.",
                servicePackage.Name);

            if (resetDemoData)
            {
                existingPackage.Description = servicePackage.Description;
                existingPackage.Category = servicePackage.Category;
                existingPackage.MonthlyPrice = servicePackage.MonthlyPrice;
                existingPackage.SetupFee = servicePackage.SetupFee;
                existingPackage.DeliveryTime = servicePackage.DeliveryTime;
                existingPackage.IsActive = servicePackage.IsActive;
            }
        }

        await dbContext.SaveChangesAsync();

        return seededPackages;
    }

    private static async Task<Dictionary<string, Company>> SeedCompaniesAsync(
        ApplicationDbContext dbContext,
        string customerId,
        string demoCustomerId,
        bool resetDemoData,
        ILogger logger)
    {
        var companies = new[]
        {
            new Company
            {
                Name = "Nordic Build AB",
                OrgNumber = "559482-1047",
                WebsiteUrl = "https://nordicbuild-demo.test",
                City = "Stockholm",
                Industry = "Construction",
                Phone = "+46 8 442 18 20",
                OwnerId = customerId
            },
            new Company
            {
                Name = "Skåne Clean Service AB",
                OrgNumber = "559618-7721",
                WebsiteUrl = "https://skaneclean-demo.test",
                City = "Malmö",
                Industry = "Cleaning Services",
                Phone = "+46 40 612 45 90",
                OwnerId = demoCustomerId
            }
        };

        var seededCompanies = new Dictionary<string, Company>();

        foreach (var company in companies)
        {
            var existingCompany = await dbContext.Companies
                .SingleOrDefaultAsync(existing => existing.OwnerId == company.OwnerId);

            if (existingCompany is null)
            {
                existingCompany = await dbContext.Companies
                    .FirstOrDefaultAsync(existing => existing.Name == company.Name);

                if (existingCompany is not null
                    && existingCompany.OwnerId != company.OwnerId)
                {
                    throw new InvalidOperationException(
                        $"Demo company '{company.Name}' already belongs to another user.");
                }
            }

            if (existingCompany is null)
            {
                company.CreatedAt = DateTime.UtcNow;
                dbContext.Companies.Add(company);
                seededCompanies[company.Name] = company;
                logger.LogInformation(
                    "Demo seed company created: {CompanyName}.",
                    company.Name);
                continue;
            }

            seededCompanies[company.Name] = existingCompany;
            logger.LogInformation(
                "Demo seed company already exists for owner {OwnerId}: {CompanyName}.",
                company.OwnerId,
                existingCompany.Name);

            if (resetDemoData)
            {
                existingCompany.Name = company.Name;
                existingCompany.OrgNumber = company.OrgNumber;
                existingCompany.WebsiteUrl = company.WebsiteUrl;
                existingCompany.City = company.City;
                existingCompany.Industry = company.Industry;
                existingCompany.Phone = company.Phone;
            }
        }

        await dbContext.SaveChangesAsync();

        return seededCompanies;
    }

    private static async Task SeedServiceOrdersAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, Company> companies,
        IReadOnlyDictionary<string, ServicePackage> packages,
        string customerId,
        string demoCustomerId,
        bool resetDemoData,
        ILogger logger)
    {
        var now = DateTime.UtcNow;
        var orders = new[]
        {
            new ServiceOrder
            {
                CompanyId = companies["Nordic Build AB"].Id,
                CustomerId = customerId,
                ServicePackageId = packages["Business Website"].Id,
                Title = "Business website service order",
                Notes = "Demo order for a new company website with structured service and reference pages.",
                Amount = GetPackageOrderAmount(packages["Business Website"]),
                Status = ServiceOrderStatus.Pending,
                PaymentReference = "DEMO-NB-WEB-001",
                CreatedAt = now.AddDays(-6),
                UpdatedAt = now.AddDays(-6)
            },
            new ServiceOrder
            {
                CompanyId = companies["Nordic Build AB"].Id,
                CustomerId = customerId,
                ServicePackageId = packages["Hosting & Maintenance"].Id,
                Title = "Managed hosting service order",
                Notes = "Demo order for managed hosting, updates, backups, and availability checks.",
                Amount = GetPackageOrderAmount(packages["Hosting & Maintenance"]),
                Status = ServiceOrderStatus.Paid,
                PaymentReference = "DEMO-NB-HOST-001",
                CreatedAt = now.AddDays(-20),
                UpdatedAt = now.AddDays(-18),
                PaidAt = now.AddDays(-18)
            },
            new ServiceOrder
            {
                CompanyId = companies["Skåne Clean Service AB"].Id,
                CustomerId = demoCustomerId,
                ServicePackageId = packages["SEO Growth"].Id,
                Title = "SEO growth service order",
                Notes = "Demo order for ongoing local SEO improvements and monthly reporting.",
                Amount = GetPackageOrderAmount(packages["SEO Growth"]),
                Status = ServiceOrderStatus.Approved,
                PaymentReference = "DEMO-SC-SEO-001",
                CreatedAt = now.AddDays(-10),
                UpdatedAt = now.AddDays(-8)
            }
        };

        foreach (var order in orders)
        {
            var existingOrder = await dbContext.ServiceOrders
                .FirstOrDefaultAsync(existing =>
                    existing.CompanyId == order.CompanyId
                    && existing.Title == order.Title);

            if (existingOrder is null)
            {
                dbContext.ServiceOrders.Add(order);
                logger.LogInformation(
                    "Demo seed service order created: {OrderTitle}.",
                    order.Title);
                continue;
            }

            logger.LogInformation(
                "Demo seed service order already exists: {OrderTitle}.",
                order.Title);

            if (resetDemoData)
            {
                existingOrder.CustomerId = order.CustomerId;
                existingOrder.ServicePackageId = order.ServicePackageId;
                existingOrder.Notes = order.Notes;
                existingOrder.Amount = order.Amount;
                existingOrder.Status = order.Status;
                existingOrder.PaymentReference = order.PaymentReference;
                existingOrder.CreatedAt = order.CreatedAt;
                existingOrder.UpdatedAt = order.UpdatedAt;
                existingOrder.PaidAt = order.PaidAt;
            }
        }

        await dbContext.SaveChangesAsync();
    }

    private static decimal GetPackageOrderAmount(ServicePackage servicePackage)
    {
        var amount = servicePackage.SetupFee + servicePackage.MonthlyPrice;

        if (amount < 0)
        {
            throw new InvalidOperationException(
                $"Demo package '{servicePackage.Name}' has an invalid negative order amount.");
        }

        return amount;
    }

    private static async Task<Dictionary<string, ProjectRequest>> SeedProjectRequestsAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, Company> companies,
        IReadOnlyDictionary<string, ServicePackage> packages,
        string customerId,
        string demoCustomerId,
        bool resetDemoData)
    {
        var projectRequests = new[]
        {
            new ProjectRequest
            {
                CompanyId = companies["Nordic Build AB"].Id,
                ServicePackageId = packages["Business Website"].Id,
                CustomerId = customerId,
                Title = "New service website for construction leads",
                Description = "Nordic Build needs a modern website that presents services, references, and clear contact paths.",
                BudgetRange = "25 000 - 40 000 SEK",
                Status = ProjectRequestStatus.New,
                CreatedAt = DateTime.UtcNow.AddDays(-24)
            },
            new ProjectRequest
            {
                CompanyId = companies["Skåne Clean Service AB"].Id,
                ServicePackageId = packages["SEO Basic"].Id,
                CustomerId = demoCustomerId,
                Title = "Local SEO setup for cleaning services",
                Description = "The customer wants better local visibility for office cleaning and recurring cleaning contracts.",
                BudgetRange = "8 000 - 15 000 SEK",
                Status = ProjectRequestStatus.Reviewed,
                CreatedAt = DateTime.UtcNow.AddDays(-18)
            },
            new ProjectRequest
            {
                CompanyId = companies["Nordic Build AB"].Id,
                ServicePackageId = packages["Hosting & Maintenance"].Id,
                CustomerId = customerId,
                Title = "Hosting and monthly maintenance agreement",
                Description = "Move the customer website to managed hosting with backups, updates, and monthly checks.",
                BudgetRange = "Monthly agreement",
                Status = ProjectRequestStatus.Approved,
                CreatedAt = DateTime.UtcNow.AddDays(-12)
            },
            new ProjectRequest
            {
                CompanyId = companies["Skåne Clean Service AB"].Id,
                ServicePackageId = packages["E-commerce Setup"].Id,
                CustomerId = demoCustomerId,
                Title = "Online booking and product checkout idea",
                Description = "Initial request for online sales of cleaning kits and booking add-ons, postponed due to scope.",
                BudgetRange = "35 000 - 60 000 SEK",
                Status = ProjectRequestStatus.Rejected,
                CreatedAt = DateTime.UtcNow.AddDays(-7)
            }
        };

        var seededRequests = new Dictionary<string, ProjectRequest>();

        foreach (var request in projectRequests)
        {
            var existingRequest = await dbContext.ProjectRequests
                .FirstOrDefaultAsync(existing =>
                    existing.CompanyId == request.CompanyId && existing.Title == request.Title);

            if (existingRequest is null)
            {
                dbContext.ProjectRequests.Add(request);
                seededRequests[request.Title] = request;
                continue;
            }

            seededRequests[request.Title] = existingRequest;

            if (resetDemoData)
            {
                existingRequest.ServicePackageId = request.ServicePackageId;
                existingRequest.CustomerId = request.CustomerId;
                existingRequest.Description = request.Description;
                existingRequest.BudgetRange = request.BudgetRange;
                existingRequest.Status = request.Status;
                existingRequest.CreatedAt = request.CreatedAt;
            }
        }

        await dbContext.SaveChangesAsync();

        return seededRequests;
    }

    private static async Task SeedProjectsAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, Company> companies,
        IReadOnlyDictionary<string, ProjectRequest> requests,
        bool resetDemoData)
    {
        var projects = new[]
        {
            new Project
            {
                CompanyId = companies["Nordic Build AB"].Id,
                ProjectRequestId = requests["New service website for construction leads"].Id,
                Title = "Nordic Build website rebuild",
                Description = "Full rebuild of company website with service pages, project references, and lead forms.",
                Status = ProjectStatus.Planning,
                StartDate = DateTime.UtcNow.Date.AddDays(2),
                Deadline = DateTime.UtcNow.Date.AddDays(35),
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            },
            new Project
            {
                CompanyId = companies["Skåne Clean Service AB"].Id,
                ProjectRequestId = requests["Local SEO setup for cleaning services"].Id,
                Title = "Skåne Clean local SEO setup",
                Description = "Keyword mapping, metadata updates, sitemap checks, and local landing page recommendations.",
                Status = ProjectStatus.Design,
                StartDate = DateTime.UtcNow.Date.AddDays(-5),
                Deadline = DateTime.UtcNow.Date.AddDays(16),
                CreatedAt = DateTime.UtcNow.AddDays(-8)
            },
            new Project
            {
                CompanyId = companies["Nordic Build AB"].Id,
                ProjectRequestId = requests["Hosting and monthly maintenance agreement"].Id,
                Title = "Managed hosting migration",
                Description = "Move hosting, configure uptime checks, schedule backups, and document maintenance routines.",
                Status = ProjectStatus.Development,
                StartDate = DateTime.UtcNow.Date.AddDays(-12),
                Deadline = DateTime.UtcNow.Date.AddDays(5),
                CreatedAt = DateTime.UtcNow.AddDays(-14)
            },
            new Project
            {
                CompanyId = companies["Skåne Clean Service AB"].Id,
                Title = "Cleaning service landing page refresh",
                Description = "Refresh content blocks and review mobile layout before campaign launch.",
                Status = ProjectStatus.Review,
                StartDate = DateTime.UtcNow.Date.AddDays(-20),
                Deadline = DateTime.UtcNow.Date.AddDays(3),
                CreatedAt = DateTime.UtcNow.AddDays(-22)
            },
            new Project
            {
                CompanyId = companies["Nordic Build AB"].Id,
                Title = "Reference gallery launch",
                Description = "Publish project gallery and verify image performance on mobile.",
                Status = ProjectStatus.Live,
                StartDate = DateTime.UtcNow.Date.AddDays(-30),
                Deadline = DateTime.UtcNow.Date.AddDays(-1),
                CreatedAt = DateTime.UtcNow.AddDays(-32)
            },
            new Project
            {
                CompanyId = companies["Skåne Clean Service AB"].Id,
                Title = "Contact form improvement",
                Description = "Improve form labels, spam protection, and confirmation messages.",
                Status = ProjectStatus.Completed,
                StartDate = DateTime.UtcNow.Date.AddDays(-45),
                Deadline = DateTime.UtcNow.Date.AddDays(-28),
                CreatedAt = DateTime.UtcNow.AddDays(-48)
            }
        };

        foreach (var project in projects)
        {
            var existingProject = await dbContext.Projects
                .FirstOrDefaultAsync(existing =>
                    existing.CompanyId == project.CompanyId && existing.Title == project.Title);

            if (existingProject is null)
            {
                dbContext.Projects.Add(project);
                continue;
            }

            if (resetDemoData)
            {
                existingProject.ProjectRequestId = project.ProjectRequestId;
                existingProject.Description = project.Description;
                existingProject.Status = project.Status;
                existingProject.StartDate = project.StartDate;
                existingProject.Deadline = project.Deadline;
                existingProject.CreatedAt = project.CreatedAt;
            }
        }

        await dbContext.SaveChangesAsync();
    }

    private static async Task<Dictionary<string, SupportTicket>> SeedSupportTicketsAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, Company> companies,
        string customerId,
        string demoCustomerId,
        bool resetDemoData)
    {
        var tickets = new[]
        {
            new SupportTicket
            {
                CompanyId = companies["Nordic Build AB"].Id,
                CustomerId = customerId,
                Title = "Contact form emails are delayed",
                Description = "The customer noticed that form submissions sometimes arrive several minutes late.",
                Status = TicketStatus.Open,
                Priority = TicketPriority.High,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new SupportTicket
            {
                CompanyId = companies["Skåne Clean Service AB"].Id,
                CustomerId = demoCustomerId,
                Title = "Request to update cleaning service prices",
                Description = "Customer wants to update three price examples on the service page before a campaign.",
                Status = TicketStatus.InProgress,
                Priority = TicketPriority.Normal,
                CreatedAt = DateTime.UtcNow.AddDays(-4)
            },
            new SupportTicket
            {
                CompanyId = companies["Nordic Build AB"].Id,
                CustomerId = customerId,
                Title = "Add new project photos",
                Description = "New reference photos should be added to the project gallery.",
                Status = TicketStatus.WaitingForCustomer,
                Priority = TicketPriority.Low,
                CreatedAt = DateTime.UtcNow.AddDays(-8)
            },
            new SupportTicket
            {
                CompanyId = companies["Skåne Clean Service AB"].Id,
                CustomerId = demoCustomerId,
                Title = "Mobile menu overlap resolved",
                Description = "The mobile menu overlapped the booking button on smaller screens.",
                Status = TicketStatus.Closed,
                Priority = TicketPriority.Urgent,
                CreatedAt = DateTime.UtcNow.AddDays(-15),
                ClosedAt = DateTime.UtcNow.AddDays(-13)
            }
        };

        var seededTickets = new Dictionary<string, SupportTicket>();

        foreach (var ticket in tickets)
        {
            var existingTicket = await dbContext.SupportTickets
                .FirstOrDefaultAsync(existing =>
                    existing.CompanyId == ticket.CompanyId && existing.Title == ticket.Title);

            if (existingTicket is null)
            {
                dbContext.SupportTickets.Add(ticket);
                seededTickets[ticket.Title] = ticket;
                continue;
            }

            seededTickets[ticket.Title] = existingTicket;

            if (resetDemoData)
            {
                existingTicket.CustomerId = ticket.CustomerId;
                existingTicket.Description = ticket.Description;
                existingTicket.Status = ticket.Status;
                existingTicket.Priority = ticket.Priority;
                existingTicket.ClosedAt = ticket.ClosedAt;
                existingTicket.CreatedAt = ticket.CreatedAt;
            }
        }

        await dbContext.SaveChangesAsync();

        return seededTickets;
    }

    private static async Task SeedTicketRepliesAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, SupportTicket> tickets,
        string customerId,
        string demoCustomerId,
        string adminId)
    {
        var replies = new[]
        {
            new TicketReply
            {
                SupportTicketId = tickets["Contact form emails are delayed"].Id,
                UserId = customerId,
                Message = "We received two lead form submissions late this morning. Can you check the mail delivery?",
                CreatedAt = DateTime.UtcNow.AddDays(-2).AddHours(1)
            },
            new TicketReply
            {
                SupportTicketId = tickets["Contact form emails are delayed"].Id,
                UserId = adminId,
                Message = "We are reviewing SMTP logs and will confirm once delivery timing is stable.",
                CreatedAt = DateTime.UtcNow.AddDays(-2).AddHours(3)
            },
            new TicketReply
            {
                SupportTicketId = tickets["Request to update cleaning service prices"].Id,
                UserId = demoCustomerId,
                Message = "The new office cleaning prices are ready. I attached the updated values in the customer portal notes.",
                CreatedAt = DateTime.UtcNow.AddDays(-4).AddHours(2)
            },
            new TicketReply
            {
                SupportTicketId = tickets["Mobile menu overlap resolved"].Id,
                UserId = adminId,
                Message = "The menu spacing issue is fixed and verified on common mobile widths.",
                CreatedAt = DateTime.UtcNow.AddDays(-13)
            }
        };

        foreach (var reply in replies)
        {
            var exists = await dbContext.TicketReplies.AnyAsync(existing =>
                existing.SupportTicketId == reply.SupportTicketId
                && existing.UserId == reply.UserId
                && existing.Message == reply.Message);

            if (!exists)
            {
                dbContext.TicketReplies.Add(reply);
            }
        }

        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedMaintenanceLogsAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, Company> companies,
        bool resetDemoData)
    {
        var logs = new[]
        {
            new MaintenanceLog
            {
                CompanyId = companies["Nordic Build AB"].Id,
                Title = "Website layout issue after CMS update",
                Description = "The customer reported that some sections looked broken after a system update.",
                ActionTaken = "Cleared cache, reviewed CSS structure, restored affected layout section.",
                Result = "Layout restored and verified on desktop and mobile.",
                CreatedAt = DateTime.UtcNow.AddDays(-6)
            },
            new MaintenanceLog
            {
                CompanyId = companies["Skåne Clean Service AB"].Id,
                Title = "Monthly CMS and plugin review",
                Description = "Routine monthly maintenance for the customer website.",
                ActionTaken = "Updated CMS components, reviewed logs, checked contact form delivery, and verified backup status.",
                Result = "Maintenance completed without downtime.",
                CreatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new MaintenanceLog
            {
                CompanyId = companies["Nordic Build AB"].Id,
                Title = "Image optimization pass",
                Description = "Project gallery images were larger than needed for mobile visitors.",
                ActionTaken = "Compressed images, regenerated thumbnails, and reviewed lazy loading behavior.",
                Result = "Gallery pages load faster and image quality remains acceptable.",
                CreatedAt = DateTime.UtcNow.AddDays(-18)
            }
        };

        foreach (var log in logs)
        {
            var existingLog = await dbContext.MaintenanceLogs
                .FirstOrDefaultAsync(existing =>
                    existing.CompanyId == log.CompanyId && existing.Title == log.Title);

            if (existingLog is null)
            {
                dbContext.MaintenanceLogs.Add(log);
                continue;
            }

            if (resetDemoData)
            {
                existingLog.Description = log.Description;
                existingLog.ActionTaken = log.ActionTaken;
                existingLog.Result = log.Result;
                existingLog.CreatedAt = log.CreatedAt;
            }
        }

        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedHostingStatusesAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, Company> companies,
        bool resetDemoData)
    {
        var statuses = new[]
        {
            new HostingStatus
            {
                CompanyId = companies["Nordic Build AB"].Id,
                DomainName = "nordicbuild-demo.test",
                IsOnline = true,
                LastCheckedAt = DateTime.UtcNow.AddMinutes(-12),
                StatusCode = 200,
                Notes = "Website is online. SSL and homepage response checked successfully."
            },
            new HostingStatus
            {
                CompanyId = companies["Skåne Clean Service AB"].Id,
                DomainName = "skaneclean-demo.test",
                IsOnline = true,
                LastCheckedAt = DateTime.UtcNow.AddMinutes(-18),
                StatusCode = 200,
                Notes = "Website is online. Booking page response verified."
            }
        };

        foreach (var status in statuses)
        {
            var existingStatus = await dbContext.HostingStatuses
                .FirstOrDefaultAsync(existing =>
                    existing.CompanyId == status.CompanyId && existing.DomainName == status.DomainName);

            if (existingStatus is null)
            {
                dbContext.HostingStatuses.Add(status);
                continue;
            }

            if (resetDemoData)
            {
                existingStatus.IsOnline = status.IsOnline;
                existingStatus.LastCheckedAt = status.LastCheckedAt;
                existingStatus.StatusCode = status.StatusCode;
                existingStatus.Notes = status.Notes;
            }
        }

        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedSeoReportsAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, Company> companies,
        bool resetDemoData)
    {
        var reports = new[]
        {
            new SeoReport
            {
                CompanyId = companies["Nordic Build AB"].Id,
                SeoScore = 78,
                TopKeywords = "byggfirma stockholm, renovering stockholm, byggprojekt offert",
                TechnicalIssues = "Missing alt text on gallery images. Some service pages need stronger internal linking.",
                Recommendations = "Add project case pages, improve service page metadata, and add FAQ content for common construction searches.",
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new SeoReport
            {
                CompanyId = companies["Skåne Clean Service AB"].Id,
                SeoScore = 84,
                TopKeywords = "städfirma malmö, kontorsstädning malmö, flyttstädning skåne",
                TechnicalIssues = "Several headings are duplicated across local service pages.",
                Recommendations = "Create separate landing pages for office cleaning and move-out cleaning, then add local testimonials.",
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            }
        };

        foreach (var report in reports)
        {
            var existingReport = await dbContext.SeoReports
                .FirstOrDefaultAsync(existing =>
                    existing.CompanyId == report.CompanyId && existing.TopKeywords == report.TopKeywords);

            if (existingReport is null)
            {
                dbContext.SeoReports.Add(report);
                continue;
            }

            if (resetDemoData)
            {
                existingReport.SeoScore = report.SeoScore;
                existingReport.TechnicalIssues = report.TechnicalIssues;
                existingReport.Recommendations = report.Recommendations;
                existingReport.CreatedAt = report.CreatedAt;
            }
        }

        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedAiSeoRequestsAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, Company> companies,
        string customerId,
        string demoCustomerId,
        bool resetDemoData)
    {
        var requests = new[]
        {
            new AiSeoRequest
            {
                CompanyId = companies["Nordic Build AB"].Id,
                CustomerId = customerId,
                Industry = "Construction",
                City = "Stockholm",
                RequestType = AiSeoRequestType.Seo,
                ResultJson = """{"localKeywords":["byggfirma stockholm","renovering stockholm","byggentreprenör stockholm","byggprojekt offert stockholm","lokal byggservice stockholm"],"blogPostIdeas":[{"title":"Så väljer du rätt byggfirma i Stockholm","focus":"Praktiska kriterier för att jämföra lokala byggföretag."},{"title":"Planera en lyckad renovering i Stockholm","focus":"Budget, tidsplan och tillstånd inför en renovering."},{"title":"Vanliga frågor inför ett byggprojekt","focus":"Svar på kundernas vanligaste frågor före offert."}],"metaTitle":"Byggfirma Stockholm | Nordic Build AB","metaDescription":"Nordic Build AB hjälper företag och privatpersoner med byggprojekt och renovering i Stockholm. Kontakta oss för en tydlig offert.","recommendations":["Skapa separata lokala sidor för renovering och byggservice.","Publicera projektcase med område, arbete och resultat.","Förbättra Google Business Profile med bilder och kundomdömen."]}""",
                CreatedAt = DateTime.UtcNow.AddDays(-4)
            },
            new AiSeoRequest
            {
                CompanyId = companies["Skåne Clean Service AB"].Id,
                CustomerId = demoCustomerId,
                Industry = "Cleaning Services",
                City = "Malmö",
                RequestType = AiSeoRequestType.Seo,
                ResultJson = """{"localKeywords":["städfirma malmö","kontorsstädning malmö","företagsstädning malmö","flyttstädning malmö","lokalvård malmö"],"blogPostIdeas":[{"title":"Så väljer du städfirma i Malmö","focus":"Kvalitet, försäkring och tydliga avtal för lokal städning."},{"title":"Fördelar med regelbunden kontorsstädning","focus":"Hur en ren arbetsmiljö påverkar trivsel och produktivitet."},{"title":"Checklista inför flyttstädning","focus":"Moment som kunder bör kontrollera före besiktning."}],"metaTitle":"Städfirma Malmö | Skåne Clean Service AB","metaDescription":"Professionell kontorsstädning, företagsstädning och flyttstädning i Malmö. Begär offert från Skåne Clean Service AB.","recommendations":["Skapa tjänstesidor för varje städtjänst i Malmö.","Samla lokala kundomdömen och visa dem nära offertformuläret.","Publicera guider som svarar på vanliga frågor om städning."]}""",
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            }
        };

        foreach (var request in requests)
        {
            var existingRequest = await dbContext.AiSeoRequests
                .FirstOrDefaultAsync(existing =>
                    existing.CompanyId == request.CompanyId
                    && existing.RequestType == AiSeoRequestType.Seo
                    && existing.Industry == request.Industry
                    && existing.City == request.City);

            if (existingRequest is null)
            {
                dbContext.AiSeoRequests.Add(request);
                continue;
            }

            if (resetDemoData)
            {
                existingRequest.CustomerId = request.CustomerId;
                existingRequest.RequestType = AiSeoRequestType.Seo;
                existingRequest.InputJson = null;
                existingRequest.ResultJson = request.ResultJson;
                existingRequest.CreatedAt = request.CreatedAt;
            }
        }

        await dbContext.SaveChangesAsync();
    }

    private static void ThrowIfFailed(IdentityResult result, string message)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = string.Join(", ", result.Errors.Select(error => error.Description));
        throw new InvalidOperationException($"{message} {errors}");
    }
}
