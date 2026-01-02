using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Contracts.Dtos;

namespace Backend.Contracts.Interfaces
{
    public interface IInventoryRepository
    {
        Task<int?> GetNodeCapacityAsync(string nodeName);
        Task<int?> GetNodeTotalAsync(string nodeName);
        Task<IReadOnlyList<MaterialQuantityDto>> GetNodeMaterialBreakdownAsync(string nodeName);
    }
}
