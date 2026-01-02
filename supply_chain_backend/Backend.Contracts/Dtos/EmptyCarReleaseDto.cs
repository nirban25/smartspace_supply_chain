namespace Backend.Contracts.Dtos;

public sealed class EmptyCarReleaseDto
{
    public Guid ReleaseId { get; set; }
    public string RailcarId { get; set; } = null!;
    public DateTime ReleasedTime { get; set; }
    public string? PortalTxnId { get; set; }
    public string? SourceRef { get; set; }
}