// using Backend.Data.Data;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// namespace Backend.Api.Controllers
// {
//     [ApiController]
//     [Route("api/unloads")]
//     public sealed class UnloadingEventsController : ControllerBase
//     {
//         private readonly SupplyChainDbContext _db;
//         public UnloadingEventsController(SupplyChainDbContext db) => _db = db;

//         [HttpGet("today")]
//         public async Task<IActionResult> GetToday()
//         {
//             var today = DateOnly.FromDateTime(DateTime.UtcNow);
//             var start = today.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
//             var end = today.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);

//             var rows = await _db.UnloadingEvents
//                 .Where(e => e.unloaded_at >= start && e.unloaded_at <= end)
//                 .OrderBy(e => e.unloaded_at)
//                 .ToListAsync();

//             return Ok(rows);
//         }

//         [HttpGet("by-operation/{operationName}")]
//         public async Task<IActionResult> GetByOperation(string operationName)
//         {
//             var rows = await (from e in _db.UnloadingEvents
//                               join o in _db.Operations on e.operation_id equals o.operation_id
//                               where o.name == operationName
//                               orderby e.unloaded_at descending
//                               select e).ToListAsync();
//             return Ok(rows);
//         }
//     }
// }

using Backend.Contracts.Dtos;
using Backend.Data.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize]
    [Route("api/unloads")]
    public sealed class UnloadingEventsController : ControllerBase
    {
        private readonly SupplyChainDbContext _db;
        public UnloadingEventsController(SupplyChainDbContext db) => _db = db;

        [HttpGet("today")]
        public async Task<IActionResult> GetToday()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var start = today.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var end = today.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);

            var rows = await _db.UnloadingEvents
                .Where(e => e.unloaded_at >= start && e.unloaded_at <= end)
                .OrderBy(e => e.unloaded_at)
                .Select(e => new UnloadingEventDto
                {
                    UnloadId = e.unload_id,
                    OperationId = e.operation_id,
                    RailcarId = e.railcar_id,
                    MaterialId = e.material_id,
                    UnloadedAt = e.unloaded_at,
                    Quantity = e.quantity,
                    SourceRef = e.source_ref,
                    OperationName = e.operation.name,      // valid if nav is mapped
                    MaterialName = e.material.display_name
                })
                .ToListAsync();

            return Ok(rows);
        }

        [HttpGet("by-operation/{operationName}")]
        public async Task<IActionResult> GetByOperation(string operationName)
        {
            var rows = await (from e in _db.UnloadingEvents
                              join o in _db.Operations on e.operation_id equals o.operation_id
                              where o.name == operationName
                              orderby e.unloaded_at descending
                              select new UnloadingEventDto
                              {
                                  UnloadId = e.unload_id,
                                  OperationId = e.operation_id,
                                  RailcarId = e.railcar_id,
                                  MaterialId = e.material_id,
                                  UnloadedAt = e.unloaded_at,
                                  Quantity = e.quantity,
                                  SourceRef = e.source_ref,
                                  OperationName = o.name
                              })
                              .ToListAsync();

            return Ok(rows);
        }
    }
}
