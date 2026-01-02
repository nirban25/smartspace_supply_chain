namespace Backend.Contracts.Interfaces
{
    public interface IReleaseRepository
    {
        Task<int> CountReleasedAsync(DateOnly date);
    }
}