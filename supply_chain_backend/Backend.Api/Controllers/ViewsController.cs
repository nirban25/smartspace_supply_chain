using Backend.Data.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize]
    [Route("api/views")]
    public sealed class ViewsControllers : ControllerBase
    {
        private readonly SupplyChainDbContext _db;
        public ViewsControllers(SupplyChainDbContext db) => _db = db;

        // mv_current_inventory
        [HttpGet("inventory/current")]
        public async Task<IActionResult> GetCurrentInventory([FromQuery] string node, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var query =
                from v in _db.MvCurrentInventories
                join n in _db.Nodes on v.node_id equals n.node_id
                join m in _db.Materials on v.material_id equals m.material_id
                where n.name == node
                orderby m.code
                select new { node = n.name, material = m.code, quantity = v.quantity, asOf = v.as_of };

            var total = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return Ok(new { total, page, pageSize, items });
        }

        // mv_daily_receipts
        [HttpGet("receipts/daily")]
        public async Task<IActionResult> GetDailyReceipts([FromQuery] string node, [FromQuery] DateOnly? date)
        {
            var d = date ?? DateOnly.FromDateTime(DateTime.UtcNow);
            var rows = await (from v in _db.MvDailyReceipts
                              join n in _db.Nodes on v.node_id equals n.node_id
                              where n.name == node && v.receipt_date == d
                              select new { node = n.name, date = v.receipt_date, arrivals = v.arrivals }).ToListAsync();
            return Ok(rows);
        }

        // mv_release_vs_unload
        [HttpGet("releases/ratio")]
        public async Task<IActionResult> GetReleaseVsUnload([FromQuery] DateOnly? date)
        {
            var d = date ?? DateOnly.FromDateTime(DateTime.UtcNow);
            var rows = await _db.MvReleaseVsUnloads
                .Where(r => r.business_date == d)
                .Select(r => new { businessDate = r.business_date, unloaded = r.unloaded_cnt, released = r.released_cnt, delta = r.delta })
                .ToListAsync();

            return Ok(rows);
        }

        // v_plan_compliance
        [HttpGet("compliance/summary")]
        public async Task<IActionResult> GetPlanCompliance([FromQuery] DateOnly date, [FromQuery] int version = 1)
        {
            var rows = await _db.VPlanCompliances
                .Where(v => v.plan_date == date && v.version == version)
                .Select(v => new { v.plan_id, v.plan_date, v.version, v.planned_units, v.actual_unloads, v.compliance_pct })
                .ToListAsync();

            return Ok(rows);
        }
    }
}
