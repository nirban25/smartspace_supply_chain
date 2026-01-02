using Backend.Contracts.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize]
    [Route("api/inventory")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryRepository _repo;
        public InventoryController(IInventoryRepository repo) => _repo = repo;

        [HttpGet("tiles")]
        public async Task<IActionResult> GetTiles([FromQuery] string node)
        {
            var breakdown = await _repo.GetNodeMaterialBreakdownAsync(node);
            return Ok(breakdown.Select(b => new { material = b.MaterialCode, quantity = b.Quantity }));
        }
    }
}
