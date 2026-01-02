using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Contracts.Interfaces
{
    public interface IAlertRepository
    {
        Task LogAlertAsync(string category, string severity, Guid? nodeId, Guid? materialId, string message);
        Task<IReadOnlyList<object>> GetActiveAsync(string? category = null);
    }
}