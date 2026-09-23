using Hinet.Service.IGateSyncService;
using Hinet.Service.IGateSyncService.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    public class IGateSyncController : ControllerBase
    {
        private readonly IIGateSyncService _gateSyncService;
        private readonly ILogger<IGateSyncController> _logger;

        public IGateSyncController(
            IIGateSyncService gateSyncService,
            ILogger<IGateSyncController> logger)
        {
            _gateSyncService = gateSyncService;
            _logger = logger;
        }

        // POST /api/IGateSync/SyncDossiers
        [HttpPost("SyncDossiers")]
        public async Task<IActionResult> SyncDossiers([FromQuery] string? maTthc)
        {
            try
            {
                var result = await _gateSyncService.SyncNewDossiersAsync(maTthc);
                if (result == null)
                {
                    return BadRequest(new { message = "Lấy danh sách hồ sơ từ iGate thất bại." });
                }
                return Ok(new { total = result.Count, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SyncDossiers error");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST /api/IGateSync/ConfirmReceived
        [HttpPost("ConfirmReceived")]
        public async Task<IActionResult> ConfirmReceived([FromQuery] string maHoSo, [FromQuery] int status = 1)
        {
            try
            {
                var success = await _gateSyncService.ConfirmDossierReceivedAsync(maHoSo, status);
                return Ok(new { success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ConfirmReceived error");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST /api/IGateSync/UpdateProgress
        [HttpPost("UpdateProgress")]
        public async Task<IActionResult> UpdateProgress([FromBody] List<DossierProgressDto> progresses)
        {
            try
            {
                var success = await _gateSyncService.UpdateProcessProgressAsync(progresses);
                return Ok(new { success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdateProgress error");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST /api/IGateSync/UpdateStatus
        [HttpPost("UpdateStatus")]
        public async Task<IActionResult> UpdateStatus([FromQuery] string maHoSo, [FromQuery] int status)
        {
            try
            {
                var success = await _gateSyncService.UpdateDossierStatusAsync(maHoSo, status);
                return Ok(new { success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "UpdateStatus error");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
