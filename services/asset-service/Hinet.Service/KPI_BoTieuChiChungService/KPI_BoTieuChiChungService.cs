using Hinet.Model.Entities;
using Hinet.Repository.KPI_BoTieuChiChungRepository;
using Hinet.Repository.DepartmentRepository;
using Hinet.Repository.KPI_DotTheoDoiDanhGiaRepository;
using Hinet.Repository.KPI_TieuChiChungRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_BoTieuChiChungService.Dto;
using Hinet.Service.KPI_BoTieuChiChungService.ViewModels;
using Hinet.Service.Common;
using Hinet.Service.Constant;
using Hinet.Service.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Hinet.Service.KPI_BoTieuChiChungService
{
    public class KPI_BoTieuChiChungService : Service<KPI_BoTieuChiChung>, IKPI_BoTieuChiChungService
    {
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IKPI_DotTheoDoiDanhGiaRepository _dotTheoDoiDanhGiaRepository;
        private readonly IKPI_BoTieuChiChungRepository _boTieuChiChungRepository;
        private readonly IKPI_TieuChiChungRepository _tieuChiChungRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public KPI_BoTieuChiChungService(
            IKPI_BoTieuChiChungRepository kPI_BoTieuChiChungRepository,
            IDepartmentRepository departmentRepository,
            IKPI_DotTheoDoiDanhGiaRepository dotTheoDoiDanhGiaRepository,
            IKPI_TieuChiChungRepository tieuChiChungRepository,
            IHttpContextAccessor httpContextAccessor
            ) : base(kPI_BoTieuChiChungRepository)
        {
            _boTieuChiChungRepository = kPI_BoTieuChiChungRepository;
            _departmentRepository = departmentRepository;
            _dotTheoDoiDanhGiaRepository = dotTheoDoiDanhGiaRepository;
            _tieuChiChungRepository = tieuChiChungRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        private bool IsCurrentUserAdmin()
        {
            return _httpContextAccessor.HttpContext?.User?
                .FindAll(ClaimTypes.Role)
                .SelectMany(x => x.Value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                .Contains(RoleConstant.Admin) == true;
        }

        public async Task<KPI_BoTieuChiChungDto> GetDto(System.Guid id)
        {
            var query = from q in GetQueryable()
                        join donVi in _departmentRepository.GetQueryable() on q.IdDonVi equals donVi.Id into donViGroup
                        from donVi in donViGroup.DefaultIfEmpty()
                        join dot in _dotTheoDoiDanhGiaRepository.GetQueryable() on q.IdDot equals dot.Id into dotGroup
                        from dot in dotGroup.DefaultIfEmpty()
                        where q.Id == id
                        select new KPI_BoTieuChiChungDto()
                        {
                            TenDonVi = donVi.Name,
                            TenDot = dot.TenDotTheoDoiDanhGia,
                            SoQuyetDinh = q.SoQuyetDinh,
                            TenBoTieuChiDonVi = q.TenBoTieuChiDonVi,
                            Type = q.Type,
                            IdDonVi = q.IdDonVi,
                            IdDot = q.IdDot,
                            NgayQuyetDinh = q.NgayQuyetDinh,
                            ApDungTuNgay = q.ApDungTuNgay,
                            ApDungToiNgay = q.ApDungToiNgay,
                            IsActive = q.IsActive,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            Id = q.Id,
                        };
            return await query.FirstOrDefaultAsync();
        }

        public async Task<PagedList<KPI_BoTieuChiChungDto>> GetData(KPI_BoTieuChiChungSearch search)
        {
            var query = from q in GetQueryable()
                        join donVi in _departmentRepository.GetQueryable() on q.IdDonVi equals donVi.Id into donViGroup
                        from donVi in donViGroup.DefaultIfEmpty()
                        join dot in _dotTheoDoiDanhGiaRepository.GetQueryable() on q.IdDot equals dot.Id into dotGroup
                        from dot in dotGroup.DefaultIfEmpty()
                        select new KPI_BoTieuChiChungDto()
                        {
                            TenDonVi = donVi.Name,
                            TenDot = dot.TenDotTheoDoiDanhGia,
                            SoQuyetDinh = q.SoQuyetDinh,
                            TenBoTieuChiDonVi = q.TenBoTieuChiDonVi,
                            Type = q.Type,
                            IdDonVi = q.IdDonVi,
                            IdDot = q.IdDot,
                            NgayQuyetDinh = q.NgayQuyetDinh,
                            ApDungTuNgay = q.ApDungTuNgay,
                            ApDungToiNgay = q.ApDungToiNgay,
                            IsActive = q.IsActive,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            Id = q.Id,
                        };
            if (search != null)
            {
                if (!string.IsNullOrEmpty(search.SoQuyetDinh))
                {
                    query = query.Where(x => EF.Functions.Like(x.SoQuyetDinh, $"%{search.SoQuyetDinh}%"));
                }
                if (!string.IsNullOrEmpty(search.TenBoTieuChiDonVi))
                {
                    query = query.Where(x => EF.Functions.Like(x.TenBoTieuChiDonVi, $"%{search.TenBoTieuChiDonVi}%"));
                }
                if (!string.IsNullOrEmpty(search.Type))
                {
                    query = query.Where(x => x.Type == search.Type);
                }
                if (search.IdDonVi.HasValue)
                {
                    query = query.Where(x => x.IdDonVi == search.IdDonVi);
                }
                if (search.IdDot.HasValue)
                {
                    query = query.Where(x => x.IdDot == search.IdDot);
                }
                if (search.IsActive.HasValue)
                {
                    query = query.Where(x => x.IsActive == search.IsActive.Value);
                }
            }

            query = query.OrderByDescending(x => x.IsActive == true).ThenByDescending(x => x.CreatedDate);
            var result = await PagedList<KPI_BoTieuChiChungDto>.CreateAsync(query, search);
            var isAdmin = IsCurrentUserAdmin();
            foreach (var item in result.Items)
            {
                item.IsAdmin = isAdmin;
            }
            return result;
        }

        public async Task SetActiveBoTieuChiChungAsync(System.Guid activeId, System.Guid idDonVi, string? type = null)
        {
            if (string.IsNullOrEmpty(type))
            {
                var activeEntity = await _boTieuChiChungRepository.GetByIdAsync(activeId);
                type = activeEntity?.Type;
            }

            var query = _boTieuChiChungRepository.GetQueryableWithTracking()
                .Where(x => x.Id != activeId && x.IdDonVi == idDonVi);

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(x => x.Type == type);
            }
            else
            {
                query = query.Where(x => x.Type == null || x.Type == "");
            }

            var otherItems = await query.ToListAsync();

            if (otherItems.Count == 0) return;

            foreach (var item in otherItems)
            {
                item.IsActive = false;
                _boTieuChiChungRepository.Update(item);
            }
            await _boTieuChiChungRepository.SaveAsync();
        }

        public async Task<string> ExportTemplateImportAsync()
        {
            try
            {
                OfficeOpenXml.ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;
                using (var package = new OfficeOpenXml.ExcelPackage())
                {
                    var ws = package.Workbook.Worksheets.Add("TieuChiChung");
                    ws.View.ShowGridLines = true;

                    // Title
                    ws.Cells["A1:D1"].Merge = true;
                    ws.Cells["A1"].Value = "BỘ TIÊU CHÍ ĐÁNH GIÁ, XẾP LOẠI CHẤT LƯỢNG CÔNG CHỨC HẰNG QUÝ (TIÊU CHÍ CHUNG)";
                    ws.Cells["A1"].Style.Font.Bold = true;
                    ws.Cells["A1"].Style.Font.Size = 14;
                    ws.Cells["A1"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    ws.Cells["A1"].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
                    ws.Row(1).Height = 30;

                    // Subtitle
                    ws.Cells["A2:D2"].Merge = true;
                    ws.Cells["A2"].Value = "(Ban hành kèm theo Quyết định số 392/QĐ-BDTTG ngày 29/06/2026 của Bộ trưởng Bộ Dân tộc và Tôn giáo)";
                    ws.Cells["A2"].Style.Font.Italic = true;
                    ws.Cells["A2"].Style.Font.Size = 11;
                    ws.Cells["A2"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                    ws.Cells["A2"].Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
                    ws.Row(2).Height = 22;

                    // Table Headers
                    ws.Cells["A4"].Value = "STT";
                    ws.Cells["B4"].Value = "Tiêu chí chấm điểm";
                    ws.Cells["C4"].Value = "Điểm tối đa";
                    ws.Cells["D4"].Value = "Điểm do cá nhân tự chấm";

                    using (var range = ws.Cells["A4:D4"])
                    {
                        range.Style.Font.Bold = true;
                        range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                        range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(3, 85, 162)); // #0355a2
                        range.Style.Font.Color.SetColor(System.Drawing.Color.White);
                        range.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                        range.Style.VerticalAlignment = OfficeOpenXml.Style.ExcelVerticalAlignment.Center;
                    }
                    ws.Row(4).Height = 28;

                    // Standard Criteria from Phụ lục 2
                    var standardData = new List<(string stt, string ten, string diem, bool isHeader, bool isBold)>
                    {
                        ("I", "PHẨM CHẤT CHÍNH TRỊ, PHẨM CHẤT ĐẠO ĐỨC, VĂN HÓA THỰC THI CÔNG VỤ VÀ Ý THỨC KỶ LUẬT, KỶ CƯƠNG TRONG THỰC THI CÔNG VỤ", "10", true, true),
                        ("1", "Phẩm chất chính trị, phẩm chất đạo đức, văn hóa thực thi công vụ", "5", false, true),
                        ("1.1", "Chấp hành nghiêm túc đường lối, chủ trương của Đảng, chính sách pháp luật của Nhà nước và các nguyên tắc tổ chức, kỷ luật của Đảng", "1", false, false),
                        ("1.2", "Có quan điểm, bản lĩnh chính trị vững vàng; kiên định lập trường; không dao động trước mọi khó khăn, thách thức", "1", false, false),
                        ("1.3", "Có ý thức nghiên cứu, học tập, vận dụng chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh, nghị quyết, chỉ thị, quyết định và các văn bản của Đảng và Nhà nước", "0.5", false, false),
                        ("1.4", "Giữ gìn phẩm chất đạo đức, lối sống trong sáng, trung thực, khiêm tốn, chân thành, giản dị; cần, kiệm, liêm, chính, chí công vô tư trong thực thi công vụ; không có biểu hiện suy thoái về tư tưởng chính trị, đạo đức, lối sống, “tự diễn biến”, “tự chuyển hóa”", "0.5", false, false),
                        ("1.5", "Không tham ô, tham nhũng, lãng phí, tiêu cực, quan liêu, hách dịch, cửa quyền, vụ lợi; không để người thân, người quen lợi dụng chức vụ, quyền hạn của mình để trục lợi", "0.5", false, false),
                        ("1.6", "Có tinh thần đoàn kết, ý thức xây dựng cơ quan, tổ chức, đơn vị trong sạch, vững mạnh; tích cực tham gia các hoạt động tập thể", "0.5", false, false),
                        ("1.7", "Thực hiện văn hóa công vụ: có thái độ đúng mực, phong cách làm việc chuẩn mực, chuyên nghiệp trong quan hệ công tác", "0.5", false, false),
                        ("1.8", "Tinh thần tự phê bình; tự soi, tự sửa; mức độ tự giác nhận diện hạn chế, khuyết điểm của bản thân và kết quả khắc phục sau khi đã được chỉ ra", "0.5", false, false),
                        ("2", "Ý thức kỷ luật, kỷ cương trong thực thi công vụ", "5", false, true),
                        ("2.1", "Chấp hành sự phân công của tổ chức", "2", false, false),
                        ("2.2", "Thực hiện các quy định, quy chế, nội quy của cơ quan, tổ chức, đơn vị nơi công tác", "2", false, false),
                        ("2.3", "Thực hiện việc kê khai và công khai tài sản, thu nhập theo quy định", "0.5", false, false),
                        ("2.4", "Báo cáo đầy đủ, trung thực, cung cấp thông tin chính xác, khách quan về những nội dung liên quan đến việc thực hiện chức trách, nhiệm vụ được giao và hoạt động của cơ quan, tổ chức, đơn vị với cấp trên khi được yêu cầu", "0.5", false, false),

                        ("II", "NĂNG LỰC CHUYÊN MÔN, NGHIỆP VỤ THEO YÊU CẦU CỦA VỊ TRÍ VIỆC LÀM; KHẢ NĂNG ĐÁP ỨNG YÊU CẦU THỰC THI NHIỆM VỤ ĐƯỢC GIAO; TINH THẦN TRÁCH NHIỆM TRONG THỰC THI CÔNG VỤ; THÁI ĐỘ PHỤC VỤ NHÂN DÂN, DOANH NGHIỆP VÀ KHẢ NĂNG PHỐI HỢP VỚI ĐỒNG NGHIỆP", "10", true, true),
                        ("1", "Năng lực chuyên môn, nghiệp vụ theo yêu cầu của vị trí việc làm", "2.5", false, true),
                        ("1.1", "Có kiến thức chuyên sâu, toàn diện về lĩnh vực công tác được phân công; hiểu biết đầy đủ về quy định pháp luật, quy trình nghiệp vụ có liên quan đến vị trí việc làm", "1", false, false),
                        ("1.2", "Thường xuyên cập nhật kiến thức mới, có khả năng nghiên cứu, phân tích, tổng hợp và vận dụng sáng tạo vào công việc; đáp ứng yêu cầu đổi mới, cải cách hành chính", "1", false, false),
                        ("1.3", "Có kỹ năng xử lý công việc độc lập, làm việc nhóm hiệu quả; sử dụng thành thạo công nghệ thông tin và các công cụ hỗ trợ phục vụ chuyên môn, nghiệp vụ", "0.5", false, false),
                        ("2", "Khả năng đáp ứng yêu cầu thực thi nhiệm vụ được giao thường xuyên, đột xuất", "2.5", false, true),
                        ("2.1", "Nhiệm vụ thường xuyên: Có khả năng vận dụng thành thạo kiến thức chuyên môn, nghiệp vụ để xử lý công việc chuyên môn theo kế hoạch định kỳ; duy trì ổn định chất lượng chuyên môn", "1.5", false, false),
                        ("2.2", "Nhiệm vụ đột xuất: Chủ động đề xuất giải pháp, thực hiện hiệu quả các công việc phát sinh có tính chất chuyên môn cao; có khả năng phản ứng nhanh, chính xác với yêu cầu mới", "1", false, false),
                        ("3", "Tinh thần trách nhiệm trong thực thi công vụ", "2.5", false, true),
                        ("3.1", "Có tinh thần trách nhiệm trong việc nghiên cứu, đề xuất, tham mưu nội dung chuyên môn; chủ động tiếp cận thông tin, kịp thời điều chỉnh cách làm để phù hợp với yêu cầu mới", "1", false, false),
                        ("3.2", "Tích cực cập nhật, ứng dụng kiến thức, công nghệ mới trong công việc chuyên môn", "1", false, false),
                        ("3.3", "Có tinh thần cầu thị, phối hợp tốt trong các hoạt động liên quan đến chuyên môn", "0.5", false, false),
                        ("4", "Thái độ phục vụ Nhân dân, doanh nghiệp và khả năng phối hợp với đồng nghiệp", "2.5", false, true),
                        ("4.1", "Được người dân, doanh nghiệp đánh giá tích cực về tính chuyên nghiệp, rõ ràng, minh bạch trong tiếp nhận, giải quyết thủ tục hành chính, cung cấp thông tin, tư vấn chuyên môn (đối với các vị trí việc làm tiếp xúc trực tiếp với người dân, doanh nghiệp).", "1.25", false, false),
                        ("4.2", "Được đánh giá có tinh thần trách nhiệm, hợp tác trong chuyên môn; bảo đảm phối hợp hiệu quả trong xử lý liên thông các thủ tục, công việc (đối với các vị trí việc làm không tiếp xúc trực tiếp với người dân, doanh nghiệp).", "1.25", false, false),

                        ("III", "NĂNG LỰC ĐỔI MỚI, SÁNG TẠO, DÁM NGHĨ, DÁM LÀM, DÁM CHỊU TRÁCH NHIỆM VÌ LỢI ÍCH CHUNG TRONG THỰC THI CÔNG VỤ", "10", true, true),
                        ("1", "Có sản phẩm, giải pháp đột phá, sáng tạo đem lại giá trị, hiệu quả thiết thực, tác động tích cực đến kết quả thực hiện nhiệm vụ của cơ quan, tổ chức, đơn vị", "2.5", false, false),
                        ("2", "Sẵn sàng tham gia thực hiện nhiệm vụ chính trị đặc biệt quan trọng, nhiệm vụ có tính chất đột xuất, phức tạp hoặc trong điều kiện khó khăn", "2.5", false, false),
                        ("3", "Có tinh thần chịu trách nhiệm trước kết quả công việc; chủ động nhận trách nhiệm khi có sai sót và có biện pháp khắc phục rõ ràng, cụ thể", "2.5", false, false),
                        ("4", "Chủ động đưa ra quyết định trong phạm vi thẩm quyền, không né tránh; có tinh thần tiên phong trong thực hiện những nhiệm vụ mới", "2.5", false, false),
                        ("TỔNG CỘNG", "", "30", true, true)
                    };

                    int curRow = 5;
                    foreach (var item in standardData)
                    {
                        ws.Cells[curRow, 1].Value = item.stt;
                        ws.Cells[curRow, 2].Value = item.ten;
                        ws.Cells[curRow, 3].Value = item.diem;

                        ws.Cells[curRow, 1].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                        ws.Cells[curRow, 3].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

                        if (item.isHeader)
                        {
                            using (var r = ws.Cells[curRow, 1, curRow, 4])
                            {
                                r.Style.Font.Bold = true;
                                r.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                                r.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(240, 244, 248));
                            }
                        }
                        else if (item.isBold)
                        {
                            ws.Cells[curRow, 1, curRow, 4].Style.Font.Bold = true;
                        }

                        ws.Cells[curRow, 2].Style.WrapText = true;
                        curRow++;
                    }

                    // Borders
                    using (var range = ws.Cells[4, 1, curRow - 1, 4])
                    {
                        range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    }

                    ws.Column(1).Width = 10;
                    ws.Column(2).Width = 85;
                    ws.Column(3).Width = 16;
                    ws.Column(4).Width = 24;

                    var bytes = package.GetAsByteArray();
                    return Convert.ToBase64String(bytes);
                }
            }
            catch (Exception)
            {
                return "";
            }
        }

        public async Task<ImportExcelResultDto> ImportExcelDirectAsync(Microsoft.AspNetCore.Http.IFormFile file, KPI_BoTieuChiChungImportVM data)
        {
            var result = new ImportExcelResultDto();
            try
            {
                if (file == null || file.Length == 0)
                {
                    result.Status = false;
                    result.Message = "Vui lòng chọn file Excel để import";
                    return result;
                }

                if (data == null) data = new KPI_BoTieuChiChungImportVM();

                OfficeOpenXml.ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;
                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    stream.Position = 0;

                    using (var package = new OfficeOpenXml.ExcelPackage(stream))
                    {
                        OfficeOpenXml.ExcelWorksheet worksheet = null;
                        if (!string.IsNullOrEmpty(data.WorkSheetName))
                        {
                            worksheet = package.Workbook.Worksheets[data.WorkSheetName];
                        }
                        if (worksheet == null)
                        {
                            worksheet = package.Workbook.Worksheets.FirstOrDefault(ws => ws.Hidden == OfficeOpenXml.eWorkSheetHidden.Visible);
                        }
                        if (worksheet == null || worksheet.Dimension == null)
                        {
                            result.Status = false;
                            result.Message = "File Excel không có dữ liệu hợp lệ";
                            return result;
                        }

                        // 1. Determine TenBoTieuChiDonVi
                        string tenBoTieuChi = data.TenBoTieuChiDonVi?.Trim();
                        if (string.IsNullOrWhiteSpace(tenBoTieuChi))
                        {
                            int rName = data.RowName ?? 1;
                            tenBoTieuChi = worksheet.Cells[rName, 1].Text.Trim();
                            if (string.IsNullOrWhiteSpace(tenBoTieuChi))
                            {
                                tenBoTieuChi = worksheet.Cells[rName, 2].Text.Trim();
                            }
                            if (string.IsNullOrWhiteSpace(tenBoTieuChi))
                            {
                                for (int r = 1; r <= 5; r++)
                                {
                                    var text = worksheet.Cells[r, 1].Text.Trim();
                                    if (string.IsNullOrWhiteSpace(text)) text = worksheet.Cells[r, 2].Text.Trim();
                                    if (text.Contains("BỘ TIÊU CHÍ", StringComparison.OrdinalIgnoreCase) ||
                                        text.Contains("TIÊU CHÍ CHUNG", StringComparison.OrdinalIgnoreCase) ||
                                        text.Contains("PHIẾU THEO DÕI", StringComparison.OrdinalIgnoreCase))
                                    {
                                        tenBoTieuChi = text;
                                        break;
                                    }
                                }
                            }
                        }
                        if (string.IsNullOrWhiteSpace(tenBoTieuChi))
                        {
                            tenBoTieuChi = "Bộ tiêu chí chung đánh giá, xếp loại chất lượng công chức hằng quý";
                        }

                        // 2. Determine SoQuyetDinh & NgayQuyetDinh
                        string soQuyetDinh = data.SoQuyetDinh?.Trim();
                        DateTime? ngayQuyetDinh = data.NgayQuyetDinh;

                        if (string.IsNullOrWhiteSpace(soQuyetDinh) || !ngayQuyetDinh.HasValue)
                        {
                            int rInfo = data.RowInfo ?? 2;
                            string infoText = worksheet.Cells[rInfo, 1].Text.Trim();
                            if (string.IsNullOrWhiteSpace(infoText)) infoText = worksheet.Cells[rInfo, 2].Text.Trim();

                            if (string.IsNullOrWhiteSpace(infoText))
                            {
                                for (int r = 1; r <= 6; r++)
                                {
                                    var t = worksheet.Cells[r, 1].Text.Trim();
                                    if (string.IsNullOrWhiteSpace(t)) t = worksheet.Cells[r, 2].Text.Trim();
                                    if (t.Contains("Quyết định số", StringComparison.OrdinalIgnoreCase) ||
                                        t.Contains("QĐ-", StringComparison.OrdinalIgnoreCase) ||
                                        t.Contains("ngày", StringComparison.OrdinalIgnoreCase))
                                    {
                                        infoText = t;
                                        break;
                                    }
                                }
                            }

                            if (!string.IsNullOrWhiteSpace(infoText))
                            {
                                if (string.IsNullOrWhiteSpace(soQuyetDinh))
                                {
                                    var matchSo = System.Text.RegularExpressions.Regex.Match(infoText, @"(?:Quyết định số|số)\s+([^\s,]+(?:/\S+)?)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                                    if (matchSo.Success)
                                    {
                                        soQuyetDinh = matchSo.Groups[1].Value.Trim().TrimEnd('.', ',');
                                    }
                                }
                                if (!ngayQuyetDinh.HasValue)
                                {
                                    var matchNgay = System.Text.RegularExpressions.Regex.Match(infoText, @"ngày\s+(\d{1,2})\s*(?:/|tháng)\s*(\d{1,2})\s*(?:/|năm)\s*(\d{4})", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                                    if (matchNgay.Success)
                                    {
                                        if (int.TryParse(matchNgay.Groups[1].Value, out int day) &&
                                            int.TryParse(matchNgay.Groups[2].Value, out int month) &&
                                            int.TryParse(matchNgay.Groups[3].Value, out int year))
                                        {
                                            try { ngayQuyetDinh = new DateTime(year, month, day); } catch { }
                                        }
                                    }
                                }
                            }
                        }

                        // 3. Create BoTieuChiChung
                        var boTieuChi = new KPI_BoTieuChiChung
                        {
                            Id = Guid.NewGuid(),
                            TenBoTieuChiDonVi = tenBoTieuChi,
                            SoQuyetDinh = soQuyetDinh,
                            NgayQuyetDinh = ngayQuyetDinh,
                            IdDonVi = data.IdDonVi,
                            IdDot = data.IdDot,
                            ApDungTuNgay = data.ApDungTuNgay,
                            ApDungToiNgay = data.ApDungToiNgay,
                            IsActive = data.IsActive ?? true,
                            CreatedDate = DateTime.Now
                        };

                        _boTieuChiChungRepository.Add(boTieuChi);
                        await _boTieuChiChungRepository.SaveAsync();

                        // 4. Parse Criteria Rows
                        var listTieuChi = new List<KPI_TieuChiChung>();
                        var lstFalse = new List<object>();

                        // Detect Header Row & Columns
                        int detectedHeaderRow = 4;
                        int colStt = 1;
                        int colTen = 2;
                        int colDiem = -1;

                        for (int r = 1; r <= Math.Min(worksheet.Dimension.End.Row, 15); r++)
                        {
                            bool foundStt = false;
                            for (int c = 1; c <= worksheet.Dimension.End.Column; c++)
                            {
                                var txt = worksheet.Cells[r, c].Text?.Trim().ToUpper() ?? "";
                                if (txt == "STT" || txt == "TT" || txt == "SỐ TT")
                                {
                                    detectedHeaderRow = r;
                                    colStt = c;
                                    foundStt = true;
                                }
                                else if (txt.Contains("TIÊU CHÍ") || txt.Contains("NỘI DUNG"))
                                {
                                    colTen = c;
                                }
                                else if (txt.Contains("ĐIỂM TỐI ĐA") || txt.Contains("ĐIỂM") || txt.Contains("TRỌNG SỐ"))
                                {
                                    colDiem = c;
                                }
                            }
                            if (foundStt) break;
                        }

                        int startRow = data.RowStart > 0 ? data.RowStart : (detectedHeaderRow + 1);
                        int endRow = worksheet.Dimension.End.Row;

                        Guid? currentMasterId = null; // Cấp 0: Số La Mã (I, II, III...)
                        Guid? currentSubId = null;    // Cấp 1: Số nguyên (1, 2, 3...)

                        int priorityCounter = 1;

                        for (int row = startRow; row <= endRow; row++)
                        {
                            var sttRaw = worksheet.Cells[row, colStt].Text?.Trim() ?? "";
                            var tenRaw = worksheet.Cells[row, colTen].Text?.Trim() ?? "";

                            if (string.IsNullOrWhiteSpace(sttRaw) && string.IsNullOrWhiteSpace(tenRaw))
                            {
                                continue;
                            }

                            // Skip repeated header rows (e.g., page breaks in converted files)
                            var upperStt = sttRaw.ToUpper();
                            var upperTen = tenRaw.ToUpper();
                            if (upperStt == "STT" || upperStt == "TT" || upperStt == "SỐ TT" || upperTen.Contains("TIÊU CHÍ CHẤM ĐIỂM"))
                            {
                                continue;
                            }

                            // Stop at footer / summary rows
                            if (upperStt == "TỔNG CỘNG" || upperTen.StartsWith("TỔNG CỘNG") || upperTen.StartsWith("II. TỔNG HỢP") || upperTen.Contains("ĐIỂM TIÊU CHÍ CHUNG"))
                            {
                                break;
                            }

                            // Extract point / score
                            decimal? diem = null;
                            if (colDiem > 0)
                            {
                                var diemText = worksheet.Cells[row, colDiem].Text?.Trim().Replace(",", ".");
                                if (!string.IsNullOrWhiteSpace(diemText) &&
                                    decimal.TryParse(diemText, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out decimal d))
                                {
                                    diem = d;
                                }
                            }

                            if (!diem.HasValue)
                            {
                                for (int c = colTen + 1; c <= worksheet.Dimension.End.Column; c++)
                                {
                                    var cellVal = worksheet.Cells[row, c].Value;
                                    if (cellVal != null)
                                    {
                                        if (cellVal is double db)
                                        {
                                            diem = (decimal)db;
                                            break;
                                        }
                                        else if (cellVal is decimal dec)
                                        {
                                            diem = dec;
                                            break;
                                        }
                                        else if (cellVal is int iVal)
                                        {
                                            diem = (decimal)iVal;
                                            break;
                                        }
                                        else
                                        {
                                            var strVal = cellVal.ToString()?.Trim().Replace(",", ".");
                                            if (!string.IsNullOrWhiteSpace(strVal) &&
                                                decimal.TryParse(strVal, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out decimal dVal))
                                            {
                                                diem = dVal;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }

                            if (string.IsNullOrWhiteSpace(tenRaw))
                            {
                                if (!string.IsNullOrWhiteSpace(sttRaw) && sttRaw.Length > 5)
                                {
                                    tenRaw = sttRaw;
                                    sttRaw = "";
                                }
                                else
                                {
                                    lstFalse.Add(new { row = row, tenNhom = sttRaw, congViec = "", reason = "Tên tiêu chí không được để trống" });
                                    continue;
                                }
                            }

                            var tieuChi = new KPI_TieuChiChung
                            {
                                Id = Guid.NewGuid(),
                                IdBoTieuChiChung = boTieuChi.Id,
                                Ten = tenRaw.Replace("\r", "").Replace("\n", " ").Trim(),
                                MyProperty = diem,
                                Priority = priorityCounter++,
                                CreatedDate = DateTime.Now
                            };

                            string cleanStt = sttRaw.Trim().TrimEnd('.');

                            // Check if Roman numeral (Level 0)
                            if (IsRomanNumeral(cleanStt))
                            {
                                tieuChi.ParentId = null;
                                currentMasterId = tieuChi.Id;
                                currentSubId = null;
                            }
                            // Check if integer (Level 1, e.g. "1", "2", "3")
                            else if (System.Text.RegularExpressions.Regex.IsMatch(cleanStt, @"^\d+$"))
                            {
                                tieuChi.ParentId = currentMasterId;
                                currentSubId = tieuChi.Id;
                            }
                            // Check if decimal (Level 2, e.g. "1.1", "1.2", "2.1")
                            else if (System.Text.RegularExpressions.Regex.IsMatch(cleanStt, @"^\d+\.\d+"))
                            {
                                tieuChi.ParentId = currentSubId ?? currentMasterId;
                            }
                            else
                            {
                                tieuChi.ParentId = currentSubId ?? currentMasterId;
                            }

                            listTieuChi.Add(tieuChi);
                        }

                        if (listTieuChi.Count > 0)
                        {
                            _tieuChiChungRepository.AddRange(listTieuChi);
                            await _tieuChiChungRepository.SaveAsync();
                        }

                        if (boTieuChi.IsActive == true && boTieuChi.IdDonVi.HasValue)
                        {
                            await SetActiveBoTieuChiChungAsync(boTieuChi.Id, boTieuChi.IdDonVi.Value, boTieuChi.Type);
                        }

                        result.Status = true;
                        result.TotalSuccess = listTieuChi.Count;
                        result.TotalFailed = lstFalse.Count;
                        result.ListTrue = listTieuChi;
                        result.LstFalse = lstFalse;
                        result.BoTieuChi = boTieuChi;
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.Message = "Lỗi khi import file Excel: " + ex.Message;
                return result;
            }
        }

        private static bool IsRomanNumeral(string s)
        {
            if (string.IsNullOrWhiteSpace(s)) return false;
            var trimmed = s.Trim().TrimEnd('.').ToUpper();
            var romans = new HashSet<string> { "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV" };
            return romans.Contains(trimmed);
        }
    }
}
