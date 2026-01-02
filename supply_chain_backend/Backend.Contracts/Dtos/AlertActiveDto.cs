namespace Backend.Contracts.Dtos;

public sealed class AlertActiveDto
{
    public Guid AlertId { get; set; }
    public string Category { get; set; } = null!;
    public string Severity { get; set; } = null!;
    public Guid? NodeId { get; set; }
    public Guid? MaterialId { get; set; }
    public string Message { get; set; } = null!;
    public DateTime RaisedAt { get; set; }
}
