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

        await dbContext.Database.MigrateAsync();

        await SeedRoleAsync(roleManager, AdminRole);
        await SeedRoleAsync(roleManager, CustomerRole);

        var admin = await SeedUserAsync(userManager, AdminEmail, "Admin123!", "Saga", "Lind");
        var customer = await SeedUserAsync(userManager, CustomerEmail, "Customer123!", "Erik", "Holm");
        var demoCustomer = await SeedUserAsync(userManager, DemoCustomerEmail, "Customer123!", "Maja", "Berg");

        await AddUserToRoleAsync(userManager, admin, AdminRole);
        await AddUserToRoleAsync(userManager, customer, CustomerRole);
        await AddUserToRoleAsync(userManager, demoCustomer, CustomerRole);

        var packages = await SeedServicePackagesAsync(dbContext);
        var companies = await SeedCompaniesAsync(dbContext, customer.Id, demoCustomer.Id);
        var requests = await SeedProjectRequestsAsync(dbContext, companies, packages, customer.Id, demoCustomer.Id);
        var tickets = await SeedSupportTicketsAsync(dbContext, companies, customer.Id, demoCustomer.Id);

        await SeedProjectsAsync(dbContext, companies, requests);
        await SeedTicketRepliesAsync(dbContext, tickets, customer.Id, demoCustomer.Id, admin.Id);
        await SeedMaintenanceLogsAsync(dbContext, companies);
        await SeedHostingStatusesAsync(dbContext, companies);
        await SeedSeoReportsAsync(dbContext, companies);
        await SeedAiSeoRequestsAsync(dbContext, companies, customer.Id, demoCustomer.Id);
    }

    private static async Task SeedRoleAsync(RoleManager<IdentityRole> roleManager, string roleName)
    {
        if (await roleManager.RoleExistsAsync(roleName))
        {
            return;
        }

        var result = await roleManager.CreateAsync(new IdentityRole(roleName));
        ThrowIfFailed(result, $"Failed to create role '{roleName}'.");
    }

    private static async Task<ApplicationUser> SeedUserAsync(
        UserManager<ApplicationUser> userManager,
        string email,
        string password,
        string firstName,
        string lastName)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is not null)
        {
            user.FirstName = firstName;
            user.LastName = lastName;
            user.EmailConfirmed = true;
            ResetDemoUserLockout(user);

            var updateResult = await userManager.UpdateAsync(user);
            ThrowIfFailed(updateResult, $"Failed to update demo user '{email}'.");

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

        return user;
    }

    private static void ResetDemoUserLockout(ApplicationUser user)
    {
        user.AccessFailedCount = 0;
        user.LockoutEnd = null;
        user.LockoutEnabled = true;
    }

    private static async Task AddUserToRoleAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string roleName)
    {
        if (await userManager.IsInRoleAsync(user, roleName))
        {
            return;
        }

        var result = await userManager.AddToRoleAsync(user, roleName);
        ThrowIfFailed(result, $"Failed to add user '{user.Email}' to role '{roleName}'.");
    }

    private static async Task<Dictionary<string, ServicePackage>> SeedServicePackagesAsync(ApplicationDbContext dbContext)
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

        foreach (var servicePackage in packages)
        {
            var existingPackage = await dbContext.ServicePackages
                .FirstOrDefaultAsync(package => package.Name == servicePackage.Name);

            if (existingPackage is null)
            {
                servicePackage.CreatedAt = DateTime.UtcNow;
                dbContext.ServicePackages.Add(servicePackage);
                continue;
            }

            existingPackage.Description = servicePackage.Description;
            existingPackage.Category = servicePackage.Category;
            existingPackage.MonthlyPrice = servicePackage.MonthlyPrice;
            existingPackage.SetupFee = servicePackage.SetupFee;
            existingPackage.DeliveryTime = servicePackage.DeliveryTime;
            existingPackage.IsActive = servicePackage.IsActive;
        }

        await dbContext.SaveChangesAsync();

        return await dbContext.ServicePackages
            .Where(package => packages.Select(seed => seed.Name).Contains(package.Name))
            .ToDictionaryAsync(package => package.Name);
    }

    private static async Task<Dictionary<string, Company>> SeedCompaniesAsync(
        ApplicationDbContext dbContext,
        string customerId,
        string demoCustomerId)
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

        foreach (var company in companies)
        {
            var existingCompany = await dbContext.Companies
                .SingleOrDefaultAsync(existing => existing.OwnerId == company.OwnerId);

            if (existingCompany is null)
            {
                company.CreatedAt = DateTime.UtcNow;
                dbContext.Companies.Add(company);
                continue;
            }

            existingCompany.Name = company.Name;
            existingCompany.OrgNumber = company.OrgNumber;
            existingCompany.WebsiteUrl = company.WebsiteUrl;
            existingCompany.City = company.City;
            existingCompany.Industry = company.Industry;
            existingCompany.Phone = company.Phone;
        }

        await dbContext.SaveChangesAsync();

        return await dbContext.Companies
            .Where(company => companies.Select(seed => seed.Name).Contains(company.Name))
            .ToDictionaryAsync(company => company.Name);
    }

    private static async Task<Dictionary<string, ProjectRequest>> SeedProjectRequestsAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, Company> companies,
        IReadOnlyDictionary<string, ServicePackage> packages,
        string customerId,
        string demoCustomerId)
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

        foreach (var request in projectRequests)
        {
            var existingRequest = await dbContext.ProjectRequests
                .FirstOrDefaultAsync(existing =>
                    existing.CompanyId == request.CompanyId && existing.Title == request.Title);

            if (existingRequest is null)
            {
                dbContext.ProjectRequests.Add(request);
                continue;
            }

            existingRequest.ServicePackageId = request.ServicePackageId;
            existingRequest.CustomerId = request.CustomerId;
            existingRequest.Description = request.Description;
            existingRequest.BudgetRange = request.BudgetRange;
            existingRequest.Status = request.Status;
        }

        await dbContext.SaveChangesAsync();

        return await dbContext.ProjectRequests
            .Where(request => projectRequests.Select(seed => seed.Title).Contains(request.Title))
            .ToDictionaryAsync(request => request.Title);
    }

    private static async Task SeedProjectsAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, Company> companies,
        IReadOnlyDictionary<string, ProjectRequest> requests)
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

            existingProject.ProjectRequestId = project.ProjectRequestId;
            existingProject.Description = project.Description;
            existingProject.Status = project.Status;
            existingProject.StartDate = project.StartDate;
            existingProject.Deadline = project.Deadline;
        }

        await dbContext.SaveChangesAsync();
    }

    private static async Task<Dictionary<string, SupportTicket>> SeedSupportTicketsAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, Company> companies,
        string customerId,
        string demoCustomerId)
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

        foreach (var ticket in tickets)
        {
            var existingTicket = await dbContext.SupportTickets
                .FirstOrDefaultAsync(existing =>
                    existing.CompanyId == ticket.CompanyId && existing.Title == ticket.Title);

            if (existingTicket is null)
            {
                dbContext.SupportTickets.Add(ticket);
                continue;
            }

            existingTicket.CustomerId = ticket.CustomerId;
            existingTicket.Description = ticket.Description;
            existingTicket.Status = ticket.Status;
            existingTicket.Priority = ticket.Priority;
            existingTicket.ClosedAt = ticket.ClosedAt;
        }

        await dbContext.SaveChangesAsync();

        return await dbContext.SupportTickets
            .Where(ticket => tickets.Select(seed => seed.Title).Contains(ticket.Title))
            .ToDictionaryAsync(ticket => ticket.Title);
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
        IReadOnlyDictionary<string, Company> companies)
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

            existingLog.Description = log.Description;
            existingLog.ActionTaken = log.ActionTaken;
            existingLog.Result = log.Result;
        }

        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedHostingStatusesAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, Company> companies)
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

            existingStatus.IsOnline = status.IsOnline;
            existingStatus.LastCheckedAt = status.LastCheckedAt;
            existingStatus.StatusCode = status.StatusCode;
            existingStatus.Notes = status.Notes;
        }

        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedSeoReportsAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, Company> companies)
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

            existingReport.SeoScore = report.SeoScore;
            existingReport.TechnicalIssues = report.TechnicalIssues;
            existingReport.Recommendations = report.Recommendations;
        }

        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedAiSeoRequestsAsync(
        ApplicationDbContext dbContext,
        IReadOnlyDictionary<string, Company> companies,
        string customerId,
        string demoCustomerId)
    {
        var requests = new[]
        {
            new AiSeoRequest
            {
                CompanyId = companies["Nordic Build AB"].Id,
                CustomerId = customerId,
                Industry = "Construction",
                City = "Stockholm",
                ResultJson = """{"localKeywords":["byggfirma stockholm","renovering stockholm","byggentreprenör stockholm","byggprojekt offert stockholm","lokal byggservice stockholm"],"blogPostIdeas":[{"title":"Så väljer du rätt byggfirma i Stockholm","focus":"Praktiska kriterier för att jämföra lokala byggföretag."},{"title":"Planera en lyckad renovering i Stockholm","focus":"Budget, tidsplan och tillstånd inför en renovering."},{"title":"Vanliga frågor inför ett byggprojekt","focus":"Svar på kundernas vanligaste frågor före offert."}],"metaTitle":"Byggfirma Stockholm | Nordic Build AB","metaDescription":"Nordic Build AB hjälper företag och privatpersoner med byggprojekt och renovering i Stockholm. Kontakta oss för en tydlig offert.","recommendations":["Skapa separata lokala sidor för renovering och byggservice.","Publicera projektcase med område, arbete och resultat.","Förbättra Google Business Profile med bilder och kundomdömen."]}""",
                CreatedAt = DateTime.UtcNow.AddDays(-4)
            },
            new AiSeoRequest
            {
                CompanyId = companies["Skåne Clean Service AB"].Id,
                CustomerId = demoCustomerId,
                Industry = "Cleaning Services",
                City = "Malmö",
                ResultJson = """{"localKeywords":["städfirma malmö","kontorsstädning malmö","företagsstädning malmö","flyttstädning malmö","lokalvård malmö"],"blogPostIdeas":[{"title":"Så väljer du städfirma i Malmö","focus":"Kvalitet, försäkring och tydliga avtal för lokal städning."},{"title":"Fördelar med regelbunden kontorsstädning","focus":"Hur en ren arbetsmiljö påverkar trivsel och produktivitet."},{"title":"Checklista inför flyttstädning","focus":"Moment som kunder bör kontrollera före besiktning."}],"metaTitle":"Städfirma Malmö | Skåne Clean Service AB","metaDescription":"Professionell kontorsstädning, företagsstädning och flyttstädning i Malmö. Begär offert från Skåne Clean Service AB.","recommendations":["Skapa tjänstesidor för varje städtjänst i Malmö.","Samla lokala kundomdömen och visa dem nära offertformuläret.","Publicera guider som svarar på vanliga frågor om städning."]}""",
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            }
        };

        foreach (var request in requests)
        {
            var existingRequest = await dbContext.AiSeoRequests
                .FirstOrDefaultAsync(existing =>
                    existing.CompanyId == request.CompanyId
                    && existing.Industry == request.Industry
                    && existing.City == request.City);

            if (existingRequest is null)
            {
                dbContext.AiSeoRequests.Add(request);
                continue;
            }

            existingRequest.CustomerId = request.CustomerId;
            existingRequest.ResultJson = request.ResultJson;
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
