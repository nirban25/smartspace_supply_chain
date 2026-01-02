namespace Backend.Contracts.Dtos;

public sealed class MaterialQuantityDto
{
    public string MaterialCode { get; set; } = null!;
    public int Quantity { get; set; }
}
