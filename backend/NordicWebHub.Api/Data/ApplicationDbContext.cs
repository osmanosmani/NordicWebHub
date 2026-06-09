using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using NordicWebHub.Api.Models;

namespace NordicWebHub.Api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Company> Companies => Set<Company>();

    public DbSet<ServicePackage> ServicePackages => Set<ServicePackage>();

    public DbSet<ProjectRequest> ProjectRequests => Set<ProjectRequest>();

    public DbSet<Project> Projects => Set<Project>();

    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();

    public DbSet<TicketReply> TicketReplies => Set<TicketReply>();

    public DbSet<MaintenanceLog> MaintenanceLogs => Set<MaintenanceLog>();

    public DbSet<HostingStatus> HostingStatuses => Set<HostingStatus>();

    public DbSet<SeoReport> SeoReports => Set<SeoReport>();

    public DbSet<AiSeoRequest> AiSeoRequests => Set<AiSeoRequest>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(user => user.FirstName)
                .HasMaxLength(100);

            entity.Property(user => user.LastName)
                .HasMaxLength(100);

            entity.Property(user => user.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");
        });

        builder.Entity<Company>(entity =>
        {
            entity.Property(company => company.Name)
                .HasMaxLength(150);

            entity.Property(company => company.OrgNumber)
                .HasMaxLength(50);

            entity.Property(company => company.WebsiteUrl)
                .HasMaxLength(250);

            entity.Property(company => company.City)
                .HasMaxLength(100);

            entity.Property(company => company.Industry)
                .HasMaxLength(100);

            entity.Property(company => company.Phone)
                .HasMaxLength(50);

            entity.Property(company => company.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(company => company.Owner)
                .WithMany(user => user.OwnedCompanies)
                .HasForeignKey(company => company.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<ServicePackage>(entity =>
        {
            entity.Property(servicePackage => servicePackage.Name)
                .HasMaxLength(150);

            entity.Property(servicePackage => servicePackage.Description)
                .HasMaxLength(1000);

            entity.Property(servicePackage => servicePackage.Category)
                .HasMaxLength(100);

            entity.Property(servicePackage => servicePackage.MonthlyPrice)
                .HasPrecision(18, 2);

            entity.Property(servicePackage => servicePackage.SetupFee)
                .HasPrecision(18, 2);

            entity.Property(servicePackage => servicePackage.DeliveryTime)
                .HasMaxLength(100);

            entity.Property(servicePackage => servicePackage.IsActive)
                .HasDefaultValue(true);

            entity.Property(servicePackage => servicePackage.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");
        });

        builder.Entity<ProjectRequest>(entity =>
        {
            entity.Property(projectRequest => projectRequest.Title)
                .HasMaxLength(200);

            entity.Property(projectRequest => projectRequest.Description)
                .HasMaxLength(2000);

            entity.Property(projectRequest => projectRequest.BudgetRange)
                .HasMaxLength(100);

            entity.Property(projectRequest => projectRequest.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

            entity.Property(projectRequest => projectRequest.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(projectRequest => projectRequest.Company)
                .WithMany(company => company.ProjectRequests)
                .HasForeignKey(projectRequest => projectRequest.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(projectRequest => projectRequest.ServicePackage)
                .WithMany(servicePackage => servicePackage.ProjectRequests)
                .HasForeignKey(projectRequest => projectRequest.ServicePackageId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(projectRequest => projectRequest.Customer)
                .WithMany(user => user.ProjectRequests)
                .HasForeignKey(projectRequest => projectRequest.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Project>(entity =>
        {
            entity.Property(project => project.Title)
                .HasMaxLength(200);

            entity.Property(project => project.Description)
                .HasMaxLength(2000);

            entity.Property(project => project.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

            entity.Property(project => project.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(project => project.Company)
                .WithMany(company => company.Projects)
                .HasForeignKey(project => project.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(project => project.ProjectRequest)
                .WithOne(projectRequest => projectRequest.Project)
                .HasForeignKey<Project>(project => project.ProjectRequestId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<SupportTicket>(entity =>
        {
            entity.Property(supportTicket => supportTicket.Title)
                .HasMaxLength(200);

            entity.Property(supportTicket => supportTicket.Description)
                .HasMaxLength(2000);

            entity.Property(supportTicket => supportTicket.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

            entity.Property(supportTicket => supportTicket.Priority)
                .HasConversion<string>()
                .HasMaxLength(50);

            entity.Property(supportTicket => supportTicket.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(supportTicket => supportTicket.Company)
                .WithMany(company => company.SupportTickets)
                .HasForeignKey(supportTicket => supportTicket.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(supportTicket => supportTicket.Customer)
                .WithMany(user => user.SupportTickets)
                .HasForeignKey(supportTicket => supportTicket.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<TicketReply>(entity =>
        {
            entity.Property(ticketReply => ticketReply.Message)
                .HasMaxLength(4000);

            entity.Property(ticketReply => ticketReply.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(ticketReply => ticketReply.SupportTicket)
                .WithMany(supportTicket => supportTicket.Replies)
                .HasForeignKey(ticketReply => ticketReply.SupportTicketId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ticketReply => ticketReply.User)
                .WithMany(user => user.TicketReplies)
                .HasForeignKey(ticketReply => ticketReply.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<MaintenanceLog>(entity =>
        {
            entity.Property(maintenanceLog => maintenanceLog.Title)
                .HasMaxLength(200);

            entity.Property(maintenanceLog => maintenanceLog.Description)
                .HasMaxLength(2000);

            entity.Property(maintenanceLog => maintenanceLog.ActionTaken)
                .HasMaxLength(2000);

            entity.Property(maintenanceLog => maintenanceLog.Result)
                .HasMaxLength(1000);

            entity.Property(maintenanceLog => maintenanceLog.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(maintenanceLog => maintenanceLog.Company)
                .WithMany(company => company.MaintenanceLogs)
                .HasForeignKey(maintenanceLog => maintenanceLog.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<HostingStatus>(entity =>
        {
            entity.Property(hostingStatus => hostingStatus.DomainName)
                .HasMaxLength(250);

            entity.Property(hostingStatus => hostingStatus.Notes)
                .HasMaxLength(1000);

            entity.Property(hostingStatus => hostingStatus.LastCheckedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(hostingStatus => hostingStatus.Company)
                .WithMany(company => company.HostingStatuses)
                .HasForeignKey(hostingStatus => hostingStatus.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<SeoReport>(entity =>
        {
            entity.Property(seoReport => seoReport.TopKeywords)
                .HasMaxLength(1000);

            entity.Property(seoReport => seoReport.TechnicalIssues)
                .HasMaxLength(2000);

            entity.Property(seoReport => seoReport.Recommendations)
                .HasMaxLength(2000);

            entity.Property(seoReport => seoReport.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(seoReport => seoReport.Company)
                .WithMany(company => company.SeoReports)
                .HasForeignKey(seoReport => seoReport.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<AiSeoRequest>(entity =>
        {
            entity.Property(aiSeoRequest => aiSeoRequest.Industry)
                .HasMaxLength(100);

            entity.Property(aiSeoRequest => aiSeoRequest.City)
                .HasMaxLength(100);

            entity.Property(aiSeoRequest => aiSeoRequest.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(aiSeoRequest => aiSeoRequest.Company)
                .WithMany(company => company.AiSeoRequests)
                .HasForeignKey(aiSeoRequest => aiSeoRequest.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(aiSeoRequest => aiSeoRequest.Customer)
                .WithMany(user => user.AiSeoRequests)
                .HasForeignKey(aiSeoRequest => aiSeoRequest.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
