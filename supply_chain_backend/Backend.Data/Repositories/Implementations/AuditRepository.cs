using System;
using System.Text.Json;
using System.Threading.Tasks;
using Backend.Data.Data;                 // DbContext
using Backend.Data.Data.Entities;        // audit_event (lowercase scaffolded entity)
using Backend.Contracts.Interfaces;

namespace Backend.Data.Repositories.Implementations
{
    public sealed class AuditRepository : IAuditRepository
    {
        private readonly SupplyChainDbContext _db;

        public AuditRepository(SupplyChainDbContext db) => _db = db;

        public async Task LogActionAsync(string actor, string action, string entityType, Guid? entityId, object? details = null)
        {
            // NOTE: Your scaffolded entity is 'audit_event' (lowercase) with columns shown below.
            var entry = new audit_event
            {
                audit_id = Guid.NewGuid(),
                actor = actor,
                action = action,
                entity_type = entityType,
                entity_id = entityId,
                // Your entity shows 'occurred_at' as DateTime (not DateTimeOffset) -> use UTC DateTime
                occurred_at = DateTime.UtcNow,
                // Your entity maps 'details' as jsonb but typed string? (as per your class)
                // If you keep string, serialize to string:
                details = details is null ? null : JsonSerializer.Serialize(details)
                // If you change the property to 'JsonElement' or 'JsonDocument', use SerializeToElement instead.
            };

            _db.AuditEvents.Add(entry);   // ✅ Add to DbSet
            await _db.SaveChangesAsync();
        }
    }
}
