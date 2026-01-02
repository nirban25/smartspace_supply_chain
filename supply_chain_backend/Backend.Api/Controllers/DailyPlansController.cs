using Backend.Contracts.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize]
    [Route("api/plans")]
    public sealed class DailyPlansController : ControllerBase
    {
        private readonly IPlanRepository _plans;
        public DailyPlansController(IPlanRepository plans) => _plans = plans;

        [HttpGet("{date}")]
        public async Task<IActionResult> GetPlan(DateOnly date, [FromQuery] int version = 1)
        {
            var plan = await _plans.GetPlanAsync(date, version);
            return plan is null ? NotFound() : Ok(plan);
        }

        [HttpGet("{date}/unloads")]
        public async Task<IActionResult> GetPlanWithUnloads(DateOnly date, [FromQuery] int version = 1)
        {
            var dto = await _plans.GetPlanWithUnloadsAsync(date, version);
            return dto is null ? NotFound() : Ok(dto);
        }
    }
}
