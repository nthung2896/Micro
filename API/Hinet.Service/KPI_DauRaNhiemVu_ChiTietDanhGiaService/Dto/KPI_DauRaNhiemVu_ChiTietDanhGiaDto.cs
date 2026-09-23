using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;

namespace Hinet.Service.KPI_DauRaNhiemVu_ChiTietDanhGiaService.Dto
{
    public class KPI_DauRaNhiemVu_ChiTietDanhGiaDto : KPI_DauRaNhiemVu_ChiTietDanhGia
    {
        public string TenNguoiDanhGia { get; set; }
        public string UserName { get; set; }
        public string TenChucVu { get; set; }
    }
}
