namespace Backend.Contracts.Dtos;

public sealed class UnloadingEventDto
{
    public Guid UnloadId { get; set; }
    public Guid OperationId { get; set; }
    public string RailcarId { get; set; } = null!;
    public Guid MaterialId { get; set; }
    public DateTime UnloadedAt { get; set; }
    public decimal? Quantity { get; set; }
    public string? SourceRef { get; set; }

    // Optional display fields (if you join or load navs)
    public string? OperationName { get; set; }
    public string? MaterialName { get; set; }
}