using NordicWebHub.Api.DTOs.AiSeo;

namespace NordicWebHub.Api.Services;

public class AiServiceRecommendationService : IAiServiceRecommendationService
{
    public AiServiceRecommendationResultDto Generate(
        GenerateAiServiceRecommendationDto input)
    {
        var services = input.NeededServices
            .Select(service => service.Trim())
            .Where(service => service.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var normalizedServices = services
            .Select(service => service.ToLowerInvariant())
            .ToArray();

        var recommendedPackage = SelectPackage(
            input,
            normalizedServices);

        return new AiServiceRecommendationResultDto
        {
            RecommendedPackageName = recommendedPackage,
            RecommendedServices = BuildRecommendedServices(
                services,
                recommendedPackage),
            SuggestedWebsiteStructure = BuildWebsiteStructure(
                normalizedServices),
            SuggestedSeoKeywords = BuildSeoKeywords(
                input.Industry,
                input.City,
                normalizedServices),
            EstimatedPriority = EstimatePriority(input),
            NextSteps =
            [
                $"Review the {recommendedPackage} package and confirm the preferred scope.",
                "Prepare brand assets, service descriptions, and current website access if available.",
                "Submit a service order or project request so the team can confirm delivery and pricing."
            ],
            Explanation = BuildExplanation(input, recommendedPackage)
        };
    }

    private static string SelectPackage(
        GenerateAiServiceRecommendationDto input,
        IReadOnlyCollection<string> services)
    {
        if (ContainsAny(services, "e-commerce", "ecommerce", "online store"))
        {
            return "E-commerce Setup";
        }

        var needsWebsite = ContainsAny(
            services,
            "website",
            "web development",
            "redesign");

        var needsSeo = ContainsAny(
            services,
            "seo",
            "local seo",
            "content");

        var needsOngoingSupport = ContainsAny(
            services,
            "hosting",
            "maintenance",
            "support");

        if (needsWebsite
            && (needsSeo
                || needsOngoingSupport
                || IsGrowthFocused(input.BusinessGoal)
                || IsLargerBudget(input.BudgetRange)))
        {
            return "Business Website";
        }

        if (needsWebsite || string.IsNullOrWhiteSpace(input.CurrentWebsiteUrl))
        {
            return "Starter Website";
        }

        if (needsSeo && IsGrowthFocused(input.BusinessGoal))
        {
            return "SEO Growth";
        }

        if (needsSeo)
        {
            return "SEO Basic";
        }

        return "Hosting & Maintenance";
    }

    private static IReadOnlyCollection<string> BuildRecommendedServices(
        IReadOnlyCollection<string> selectedServices,
        string recommendedPackage)
    {
        var recommendations = new List<string>(selectedServices);

        AddIfMissing(recommendations, "Discovery and requirements workshop");

        if (recommendedPackage.Contains("Website", StringComparison.OrdinalIgnoreCase)
            || recommendedPackage.Contains("E-commerce", StringComparison.OrdinalIgnoreCase))
        {
            AddIfMissing(recommendations, "Responsive UX and website implementation");
            AddIfMissing(recommendations, "Analytics and conversion tracking setup");
        }

        if (recommendedPackage.Contains("SEO", StringComparison.OrdinalIgnoreCase)
            || recommendedPackage == "Business Website")
        {
            AddIfMissing(recommendations, "Local SEO foundations");
        }

        AddIfMissing(recommendations, "Launch quality assurance");

        return recommendations.Take(7).ToArray();
    }

    private static IReadOnlyCollection<string> BuildWebsiteStructure(
        IReadOnlyCollection<string> services)
    {
        var pages = new List<string>
        {
            "Home",
            "Services",
            "About the company",
            "Case studies or customer results",
            "Contact and request form"
        };

        if (ContainsAny(services, "e-commerce", "ecommerce", "online store"))
        {
            pages.Insert(2, "Products and product categories");
            pages.Add("Delivery, returns, and terms");
        }

        if (ContainsAny(services, "seo", "local seo", "content"))
        {
            pages.Insert(pages.Count - 1, "Insights or guides");
        }

        return pages;
    }

    private static IReadOnlyCollection<string> BuildSeoKeywords(
        string industry,
        string city,
        IReadOnlyCollection<string> services)
    {
        var cleanIndustry = industry.Trim().ToLowerInvariant();
        var cleanCity = city.Trim().ToLowerInvariant();
        var primaryService = services
            .FirstOrDefault(service =>
                service.Contains("website")
                || service.Contains("seo")
                || service.Contains("e-commerce")
                || service.Contains("hosting"));

        return
        [
            $"{cleanIndustry} {cleanCity}",
            $"{cleanIndustry} services {cleanCity}",
            $"local {cleanIndustry} company {cleanCity}",
            $"{cleanIndustry} quote {cleanCity}",
            primaryService is null
                ? $"professional {cleanIndustry} {cleanCity}"
                : $"{primaryService} {cleanCity}"
        ];
    }

    private static string EstimatePriority(GenerateAiServiceRecommendationDto input)
    {
        var timeline = input.PreferredTimeline.ToLowerInvariant();

        if (timeline.Contains("as soon")
            || timeline.Contains("1 month")
            || string.IsNullOrWhiteSpace(input.CurrentWebsiteUrl))
        {
            return "High";
        }

        if (timeline.Contains("1-3") || IsGrowthFocused(input.BusinessGoal))
        {
            return "Medium";
        }

        return "Low";
    }

    private static string BuildExplanation(
        GenerateAiServiceRecommendationDto input,
        string recommendedPackage)
    {
        var websiteContext = string.IsNullOrWhiteSpace(input.CurrentWebsiteUrl)
            ? "Because the business does not currently list a website, the recommendation prioritizes a clear digital foundation."
            : "Because a current website is available, the recommendation focuses on improving its ability to support the stated business goal.";

        return
            $"{recommendedPackage} is the closest match for {input.BusinessName}'s goal to {input.BusinessGoal.Trim().TrimEnd('.')}. "
            + $"{websiteContext} The suggested scope is tailored to {input.TargetCustomers.Trim()} in {input.City.Trim()} and should be confirmed with the NordicWebHub team before delivery begins.";
    }

    private static bool ContainsAny(
        IEnumerable<string> values,
        params string[] candidates)
    {
        return values.Any(value =>
            candidates.Any(candidate =>
                value.Contains(candidate, StringComparison.OrdinalIgnoreCase)));
    }

    private static bool IsGrowthFocused(string goal)
    {
        return goal.Contains("lead", StringComparison.OrdinalIgnoreCase)
            || goal.Contains("grow", StringComparison.OrdinalIgnoreCase)
            || goal.Contains("sales", StringComparison.OrdinalIgnoreCase)
            || goal.Contains("customer", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsLargerBudget(string budgetRange)
    {
        return budgetRange.Contains("50,000", StringComparison.OrdinalIgnoreCase)
            || budgetRange.Contains("50 000", StringComparison.OrdinalIgnoreCase)
            || budgetRange.Contains("100,000", StringComparison.OrdinalIgnoreCase)
            || budgetRange.Contains("100 000", StringComparison.OrdinalIgnoreCase);
    }

    private static void AddIfMissing(
        ICollection<string> values,
        string value)
    {
        if (!values.Contains(value, StringComparer.OrdinalIgnoreCase))
        {
            values.Add(value);
        }
    }
}
