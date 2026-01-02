using Backend.Data.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize]
    [Route("api/materials")]
    public sealed class MaterialsController : ControllerBase
    {
        private readonly SupplyChainDbContext _db;
        public MaterialsController(SupplyChainDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(await _db.Materials.OrderBy(m => m.code).ToListAsync());

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetOne(Guid id)
        {
            var material = await _db.Materials.FindAsync(id);
            return material is null ? NotFound() : Ok(material);
        }
    }
}
