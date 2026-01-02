
using Backend.Contracts.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Api.Controllers
{
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize]
    [Route("api/alerts")]
    public sealed class AlertsController : ControllerBase
    {
        private readonly IAlertRepository _alerts;
        public AlertsController(IAlertRepository alerts) => _alerts = alerts;

        [HttpGet("active")]
        public async Task<IActionResult> GetActive([FromQuery] string? category = null)
        {
            var rows = await _alerts.GetActiveAsync(category);
            return Ok(rows);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AlertCreateDto dto)
        {
            await _alerts.LogAlertAsync(dto.Category, dto.Severity, dto.NodeId, dto.MaterialId, dto.Message);
            return Accepted();
        }
    }

    public sealed record AlertCreateDto(
        string Category,
        string Severity,
        Guid? NodeId,
        Guid? MaterialId,
        string Message
    );
}
