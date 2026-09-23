//using Hinet.Api.ActionFilters;
using Hinet.Api.Dto;
using Hinet.Model;
using Hinet.Model.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Hinet.Service.Common;
using Hinet.Service.KPI_CauHinhCongThucNhiemVuService;
using Hinet.Service.KPI_CauHinhCongThucNhiemVuService.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Hinet.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KPI_CauHinhCongThucNhiemVuController : ControllerBase
    {
        private readonly IKPI_CauHinhCongThucNhiemVuService _kPI_CauHinhCongThucNhiemVuService;
        private readonly ILogger<KPI_CauHinhCongThucNhiemVuController> _logger;

        public KPI_CauHinhCongThucNhiemVuController(
            IKPI_CauHinhCongThucNhiemVuService kPI_CauHinhCongThucNhiemVuService,
            ILogger<KPI_CauHinhCongThucNhiemVuController> logger
            )
        {
            _kPI_CauHinhCongThucNhiemVuService = kPI_CauHinhCongThucNhiemVuService;
            _logger = logger;
        }

        [HttpGet("GetKpiTables")]
        public IActionResult GetKpiTables([FromServices] HinetContext dbContext)
        {
            try
            {
                var tableNames = dbContext.Model.GetEntityTypes()
                    .Select(t => t.GetTableName())
                    .Where(t => !string.IsNullOrEmpty(t) && t.StartsWith("KPI_"))
                    .Distinct()
                    .OrderBy(t => t)
                    .ToList();

                return Ok(DataResponse.Success(tableNames, "Lấy danh sách bảng thành công"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách bảng KPI_");
                return Ok(DataResponse.False("Đã xảy ra lỗi khi lấy danh sách bảng."));
            }
        }

        [HttpGet("GetKpiColumns")]
        public IActionResult GetKpiColumns([FromQuery] string tableName, [FromServices] HinetContext dbContext)
        {
            try
            {
                if (string.IsNullOrEmpty(tableName))
                    return Ok(DataResponse.Success(new List<string>(), "Tên bảng trống"));

                var entityType = dbContext.Model.GetEntityTypes()
                    .FirstOrDefault(t => t.GetTableName() == tableName);

                if (entityType == null)
                    return Ok(DataResponse.False("Không tìm thấy bảng."));

                var numericTypes = new HashSet<Type>
                {
                    typeof(int), typeof(double), typeof(float), typeof(decimal), typeof(long), typeof(short), typeof(byte),
                    typeof(int?), typeof(double?), typeof(float?), typeof(decimal?), typeof(long?), typeof(short?), typeof(byte?)
                };

                var columns = entityType.GetProperties()
                    .Where(p => numericTypes.Contains(p.ClrType))
                    .Select(p => 
                    {
                        var clrProperty = entityType.ClrType.GetProperty(p.Name);
                        string displayName = null;
                        if (clrProperty != null)
                        {
                            var displayAttr = clrProperty.GetCustomAttributes(typeof(System.ComponentModel.DataAnnotations.DisplayAttribute), false)
                                .FirstOrDefault() as System.ComponentModel.DataAnnotations.DisplayAttribute;
                            
                            if (displayAttr != null)
                                displayName = displayAttr.Name;
                            else
                            {
                                var displayNameAttr = clrProperty.GetCustomAttributes(typeof(System.ComponentModel.DisplayNameAttribute), false)
                                    .FirstOrDefault() as System.ComponentModel.DisplayNameAttribute;
                                if (displayNameAttr != null)
                                    displayName = displayNameAttr.DisplayName;
                            }
                        }

                        string label = string.IsNullOrEmpty(displayName) 
                            ? p.GetColumnName() 
                            : $"{displayName} ({p.GetColumnName()})";

                        return new
                        {
                            Value = p.GetColumnName(),
                            Label = label
                        };
                    })
                    .Where(c => !string.IsNullOrEmpty(c.Value))
                    .GroupBy(c => c.Value)
                    .Select(g => g.First())
                    .OrderBy(c => c.Label)
                    .ToList();

                return Ok(DataResponse.Success(columns, "Lấy danh sách cột thành công"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách cột cho bảng {tableName}", tableName);
                return Ok(DataResponse.False("Đã xảy ra lỗi khi lấy danh sách cột."));
            }
        }

        [HttpPost("Create")]
        public async Task<DataResponse> Create([FromBody] KPI_CauHinhCongThucNhiemVu entity)
        {
            try
            {
                entity.CreatedDate = DateTime.Now;

                if (entity.IdDonVi == null && entity.IdDotDanhGia == null)
                {
                    entity.Type = "MACDINH";
                }
                else
                {
                    entity.Type = "TUYCHINH";
                }

                await _kPI_CauHinhCongThucNhiemVuService.CreateAsync(entity);
                return DataResponse.Success("Thêm mới thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo mới KPI_CauHinhCongThucNhiemVu");
                return DataResponse.False("Đã xảy ra lỗi khi tạo mới.");
            }
        }

        [HttpPut("Update")]
        public async Task<DataResponse> Update([FromBody] KPI_CauHinhCongThucNhiemVu entity)
        {
            try
            {
                var existingEntity = await _kPI_CauHinhCongThucNhiemVuService.GetByIdAsync(entity.Id);
                if (existingEntity == null) return DataResponse.False("Không tìm thấy dữ liệu.");

                existingEntity.IdDonVi = entity.IdDonVi;
                existingEntity.IdDotDanhGia = entity.IdDotDanhGia;
                existingEntity.TargetTable = entity.TargetTable;
                existingEntity.TargetColumn = entity.TargetColumn;
                existingEntity.fomula = entity.fomula;
                existingEntity.UpdatedDate = DateTime.Now;

                if (existingEntity.IdDonVi == null && existingEntity.IdDotDanhGia == null)
                {
                    existingEntity.Type = "MACDINH";
                }
                else
                {
                    existingEntity.Type = "TUYCHINH";
                }

                await _kPI_CauHinhCongThucNhiemVuService.UpdateAsync(existingEntity);
                return DataResponse.Success("Cập nhật thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_CauHinhCongThucNhiemVu với Id: {Id}", entity.Id);
                return DataResponse.False("Đã xảy ra lỗi khi cập nhật dữ liệu.");
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_CauHinhCongThucNhiemVuDto>> Get(Guid id)
        {
            var dto = await _kPI_CauHinhCongThucNhiemVuService.GetDto(id);
            return DataResponse<KPI_CauHinhCongThucNhiemVuDto>.Success(dto);
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<KPI_CauHinhCongThucNhiemVuDto>>> GetData([FromBody] KPI_CauHinhCongThucNhiemVuSearch search)
        {
            var data = await _kPI_CauHinhCongThucNhiemVuService.GetData(search);
            return DataResponse<PagedList<KPI_CauHinhCongThucNhiemVuDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_CauHinhCongThucNhiemVuService.GetByIdAsync(id);
                await _kPI_CauHinhCongThucNhiemVuService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_CauHinhCongThucNhiemVu với Id: {Id}", id);
                return DataResponse.False("Đã xảy ra lỗi khi xóa dữ liệu.");
            }
        }

        [HttpGet("GetFormula")]
        public async Task<IActionResult> GetFormula([FromQuery] string targetTable, [FromQuery] string targetColumn, [FromQuery] Guid? idDotDanhGia, [FromQuery] Guid? idDonVi)
        {
            try
            {
                var exactMatch = await _kPI_CauHinhCongThucNhiemVuService.GetQueryable().FirstOrDefaultAsync(x => x.TargetTable == targetTable && x.TargetColumn == targetColumn && x.IdDotDanhGia == idDotDanhGia && x.IdDonVi == idDonVi);

                if (exactMatch != null && !string.IsNullOrEmpty(exactMatch.fomula))
                {
                    return Ok(DataResponse.Success(exactMatch, "Lấy cấu hình công thức thành công"));
                }

                var defaultMatch = await _kPI_CauHinhCongThucNhiemVuService.GetQueryable().FirstOrDefaultAsync(x => x.TargetTable == targetTable && x.TargetColumn == targetColumn && x.Type == "MACDINH");

                if (defaultMatch != null && !string.IsNullOrEmpty(defaultMatch.fomula))
                {
                    return Ok(DataResponse.Success(defaultMatch, "Lấy cấu hình công thức mặc định thành công"));
                }

                return Ok(DataResponse.False("Không tìm thấy công thức phù hợp"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy công thức");
                return Ok(DataResponse.False("Đã xảy ra lỗi khi lấy công thức"));
            }
        }

        [HttpPost("CalculateFormula")]
        public async Task<IActionResult> CalculateFormula([FromBody] CalculateFormulaRequest request, [FromServices] HinetContext dbContext)
        {
            try
            {
                var config = await _kPI_CauHinhCongThucNhiemVuService.GetByIdAsync(request.Id);
                if (config == null || string.IsNullOrEmpty(config.fomula))
                    return Ok(DataResponse.False("Không tìm thấy cấu hình công thức hoặc công thức bị trống"));

                var connection = dbContext.Database.GetDbConnection();
                bool connectionWasClosed = connection.State == System.Data.ConnectionState.Closed;
                if (connectionWasClosed)
                    await connection.OpenAsync();

                try
                {
                    string tableName = config.TargetTable;
                    string targetColumn = config.TargetColumn;

                    using var command = connection.CreateCommand();
                    
                    string query = $"SELECT * FROM \"{tableName}\" WHERE 1=1";
                    if (config.IdDonVi.HasValue)
                        query += $" AND \"IdDonVi\" = '{config.IdDonVi.Value}'";
                    if (config.IdDotDanhGia.HasValue)
                        query += $" AND \"IdDotDanhGia\" = '{config.IdDotDanhGia.Value}'";

                    command.CommandText = query;
                    using var reader = await command.ExecuteReaderAsync();

                    var updateCommands = new System.Text.StringBuilder();
                    var columns = new System.Collections.Generic.List<string>();
                    for (int i = 0; i < reader.FieldCount; i++) columns.Add(reader.GetName(i));

                    while (await reader.ReadAsync())
                    {
                        var expr = new NCalc.Expression(config.fomula);
                        
                        foreach (var colName in columns)
                        {
                            int ordinal = reader.GetOrdinal(colName);
                            if (!reader.IsDBNull(ordinal))
                            {
                                try {
                                    expr.Parameters[colName] = Convert.ToDouble(reader.GetValue(ordinal));
                                } catch { }
                            }
                        }

                        try
                        {
                            var evalResult = expr.Evaluate();
                            if (evalResult != null)
                            {
                                double val = Convert.ToDouble(evalResult);
                                if (val < 0) val = 0;
                                var idCol = columns.FirstOrDefault(c => c.Equals("Id", StringComparison.OrdinalIgnoreCase));
                                if (idCol != null)
                                {
                                    var rowId = reader.GetValue(reader.GetOrdinal(idCol));
                                    updateCommands.AppendLine($"UPDATE \"{tableName}\" SET \"{targetColumn}\" = {val.ToString(System.Globalization.CultureInfo.InvariantCulture)} WHERE \"{idCol}\" = '{rowId}';");
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Lỗi tính toán dòng dữ liệu bảng {TableName}: {Msg}", tableName, ex.Message);
                        }
                    }
                    reader.Close();

                    if (updateCommands.Length > 0)
                    {
                        using var updateCmd = connection.CreateCommand();
                        updateCmd.CommandText = updateCommands.ToString();
                        await updateCmd.ExecuteNonQueryAsync();
                    }

                    return Ok(DataResponse.Success("Đã tính toán và cập nhật toàn bộ dữ liệu thành công!"));
                }
                finally
                {
                    if (connectionWasClosed)
                        await connection.CloseAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tính toán công thức");
                return Ok(DataResponse.False("Lỗi khi tính toán: Vui lòng kiểm tra lại cấu trúc bảng hoặc công thức. (Chi tiết: " + ex.Message + ")"));
            }
        }
        [HttpPost("CalculateFormulaV2")]
        public async Task<IActionResult> CalculateFormulaV2([FromBody] CalculateFormulaRequestV2 request)
        {
            try
            {
                var config = await _kPI_CauHinhCongThucNhiemVuService.GetByIdAsync(request.Id);
                if (config == null || string.IsNullOrEmpty(config.fomula))
                    return Ok(DataResponse.False("Không tìm thấy cấu hình công thức hoặc công thức bị trống"));

                var expr = new NCalc.Expression(config.fomula);
                
                if (request.Parameters != null)
                {
                    foreach (var kvp in request.Parameters)
                    {
                        expr.Parameters[kvp.Key] = kvp.Value;
                    }
                }

                var result = expr.Evaluate();
                if (result != null && double.TryParse(result.ToString(), out double doubleVal))
                {
                    if (doubleVal < 0)
                    {
                        result = 0;
                    }
                }
                return Ok(DataResponse.Success(result, "Tính toán thành công"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tính toán công thức");
                return Ok(DataResponse.False("Lỗi khi tính toán: Vui lòng kiểm tra lại cú pháp công thức. (Chi tiết: " + ex.Message + ")"));
            }
        }
    }

    public class CalculateFormulaRequest
    {
        public Guid Id { get; set; }
    }

    public class CalculateFormulaRequestV2
    {
        public Guid Id { get; set; }
        public Dictionary<string, double> Parameters { get; set; }
    }
}
