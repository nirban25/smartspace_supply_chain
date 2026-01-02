
using System;
using System.Threading.Tasks;

namespace Backend.Contracts.Interfaces
{
    public interface IAuditRepository
    {
        Task LogActionAsync(string actor, string action, string entityType, Guid? entityId, object? details = null);
    }
}
