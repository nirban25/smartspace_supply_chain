using Backend.Data.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize]
    [Route("api/movements")]
    public sealed class RailcarMovementsController : ControllerBase
    {
        private readonly SupplyChainDbContext _db;
        public RailcarMovementsController(SupplyChainDbContext db) => _db = db;

        [HttpGet("by-railcar/{railcarId}")]
        public async Task<IActionResult> GetByRailcar(string railcarId)
        {
            var rows = await _db.RailcarMovements
                .Where(m => m.railcar_id == railcarId)
                .OrderByDescending(m => m.event_time)
                .ToListAsync();

            return Ok(rows);
        }

        [HttpGet("latest/{count:int}")]
        public async Task<IActionResult> GetLatest(int count = 50)
        {
            var rows = await _db.RailcarMovements
                .OrderByDescending(m => m.event_time)
                .Take(count)
                .ToListAsync();

            return Ok(rows);
        }
    }
}
