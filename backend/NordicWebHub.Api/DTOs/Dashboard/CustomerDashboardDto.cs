namespace NordicWebHub.Api.DTOs.Dashboard;

public class CustomerDashboardDto
{
    public DashboardCompanyDto? Company { get; set; }

    public IReadOnlyCollection<DashboardProjectDto> ActiveProjects { get; set; } = [];

    public IReadOnlyCollection<DashboardSupportTicketDto> OpenTickets { get; set; } = [];

    public IReadOnlyCollection<DashboardProjectRequestDto> RecentProjectRequests { get; set; } = [];

    public IReadOnlyCollection<DashboardSupportTicketDto> RecentSupportTickets { get; set; } = [];
}
