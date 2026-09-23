using System;

namespace Hinet.Service.KPI_PhieuDanhGiaService.Dto
{
    public class NguoiXuLyDto
    {
        public Guid Id { get; set; }
        public string HoTen { get; set; }
        public string? ChucVu_txt { get; set; }
        public string? ChucVu { get; set; }
    }
}
