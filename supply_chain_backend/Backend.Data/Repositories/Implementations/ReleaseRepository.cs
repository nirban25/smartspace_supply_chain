
using Backend.Data.Data;
using Backend.Contracts.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Repositories.Implementations
{
    public sealed class ReleaseRepository : IReleaseRepository
    {
        private readonly SupplyChainDbContext _db;
        public ReleaseRepository(SupplyChainDbContext db) => _db = db;

        public async Task<int> CountReleasedAsync(DateOnly date)
        {
            var start = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var end = date.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);

            return await _db.EmptyCarReleases
                .Where(r => r.released_time >= start && r.released_time <= end)
                .CountAsync();
        }
    }
}
