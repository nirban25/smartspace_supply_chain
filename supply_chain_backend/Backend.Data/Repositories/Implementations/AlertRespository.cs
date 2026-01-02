using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data.Data;
using Backend.Data.Data.Entities;
using Backend.Contracts.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Repositories.Implementations
{
    public sealed class AlertRepository : IAlertRepository
    {
        private readonly SupplyChainDbContext _db;
        public AlertRepository(SupplyChainDbContext db) => _db = db;


        public async Task LogAlertAsync(string category, string severity, Guid? nodeId, Guid? materialId, string message)
        {
            var a = new alert
            {
                alert_id = Guid.NewGuid(),
                category = category,
                severity = severity,
                node_id = nodeId,
                material_id = materialId,
                message = message,
                raised_at = DateTime.UtcNow // ✅ matches entity type
            };

            _db.Alerts.Add(a);
            await _db.SaveChangesAsync();
        }

        public async Task<IReadOnlyList<object>> GetActiveAsync(string? category = null)
        {
            var q = _db.Alerts.Where(a => a.cleared_at == null);
            if (!string.IsNullOrWhiteSpace(category))
                q = q.Where(a => a.category == category);

            var rows = await q
                .OrderByDescending(a => a.raised_at)
                .Select(a => new
                {
                    a.alert_id,
                    a.category,
                    a.severity,
                    a.node_id,
                    a.material_id,
                    a.message,
                    a.raised_at
                })
                .ToListAsync();

            return rows;
        }
    }
}
