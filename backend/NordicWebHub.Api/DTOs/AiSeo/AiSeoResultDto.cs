namespace NordicWebHub.Api.DTOs.AiSeo;

public class AiSeoResultDto
{
    public IReadOnlyCollection<string> LocalKeywords { get; set; } = [];

    public IReadOnlyCollection<AiSeoBlogPostIdeaDto> BlogPostIdeas { get; set; } = [];

    public string MetaTitle { get; set; } = string.Empty;

    public string MetaDescription { get; set; } = string.Empty;

    public IReadOnlyCollection<string> Recommendations { get; set; } = [];
}

public class AiSeoBlogPostIdeaDto
{
    public string Title { get; set; } = string.Empty;

    public string Focus { get; set; } = string.Empty;
}
