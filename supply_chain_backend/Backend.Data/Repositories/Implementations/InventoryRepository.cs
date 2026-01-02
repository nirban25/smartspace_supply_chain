using Backend.Contracts.Dtos;
using Backend.Contracts.Interfaces;
using Backend.Data.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Repositories.Implementations
{
    public sealed class InventoryRepository : IInventoryRepository
    {
        private readonly SupplyChainDbContext _db;
        public InventoryRepository(SupplyChainDbContext db) => _db = db;

        public async Task<int?> GetNodeCapacityAsync(string nodeName)
            => await _db.Nodes
                        .Where(n => n.name == nodeName)
                        .Select(n => n.design_capacity)
                        .FirstOrDefaultAsync();

        public async Task<int?> GetNodeTotalAsync(string nodeName)
            => await (from v in _db.MvCurrentInventories
                      join n in _db.Nodes on v.node_id equals n.node_id
                      where n.name == nodeName
                      select v.quantity)
                     .SumAsync();

        public async Task<IReadOnlyList<MaterialQuantityDto>> GetNodeMaterialBreakdownAsync(string nodeName)
        {
            var rows = await (from v in _db.MvCurrentInventories
                              join n in _db.Nodes on v.node_id equals n.node_id
                              join m in _db.Materials on v.material_id equals m.material_id
                              where n.name == nodeName
                              group v by m.code into g
                              select new
                              {
                                  MaterialCode = g.Key,
                                  Quantity = g.Sum(x => x.quantity) ?? 0
                              })
                             .ToListAsync();

            return rows.Select(r => new MaterialQuantityDto
            {
                MaterialCode = r.MaterialCode,
                Quantity = r.Quantity
            }).ToList();
        }
    }
}