using Backend.Contracts.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize]
    [Route("api/releases")]
    public sealed class EmptyCarReleasesController : ControllerBase
    {
        private readonly IReleaseRepository _releases;
        public EmptyCarReleasesController(IReleaseRepository releases) => _releases = releases;

        [HttpGet("count")]
        public async Task<IActionResult> GetCount([FromQuery] DateOnly? date)
        {
            var d = date ?? DateOnly.FromDateTime(DateTime.UtcNow);
            var cnt = await _releases.CountReleasedAsync(d);
            return Ok(new { date = d, released = cnt });
        }
    }
}
