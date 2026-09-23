using Hinet.Service.KPI_PhieuDanhGiaService.Constant;
using Hinet.Service.KPI_PhieuDanhGiaService.Dto;
using System.Collections.Generic;

namespace Hinet.Service.KPI_PhieuDanhGiaTapTheService.Constant
{
    public class LuongTapTheConstant
    {
        public enum LuongTapTheType
        {
            /// <summary>
            /// Đánh giá tập thể cấp Phòng ban thuộc Cục/Vụ/Trung tâm
            /// </summary>
            LuongPhongBan = 101,

            /// <summary>
            /// Đánh giá tập thể cấp Đơn vị (Cục, Vụ, Viện, Trung tâm trực thuộc Bộ)
            /// </summary>
            LuongDonVi = 102,
        }

        public static List<string> LuongPhongBanSteps = new List<string>()
        {
            TrangThaiPhieuConstant.KhoiTao,
            TrangThaiPhieuConstant.GuiTruongPhong,
            TrangThaiPhieuConstant.GuiCucTruong,
            TrangThaiPhieuConstant.DaDuyet
        };

        public static List<string> LuongDonViSteps = new List<string>()
        {
            TrangThaiPhieuConstant.KhoiTao,
            "GuiVuTCCB",
            TrangThaiPhieuConstant.DaDuyet
        };

        public static ButtonLuongDto? GetButtonLuong(int luong, string trangThaiHienTai)
        {
            if (trangThaiHienTai == TrangThaiPhieuConstant.DaDuyet)
                return null;

            List<string>? luongSteps = luong switch
            {
                (int)LuongTapTheType.LuongPhongBan => LuongPhongBanSteps,
                (int)LuongTapTheType.LuongDonVi => LuongDonViSteps,
                _ => LuongPhongBanSteps
            };

            if (luongSteps == null) return null;

            var stepToFind = trangThaiHienTai == TrangThaiPhieuConstant.TraVe
                ? TrangThaiPhieuConstant.KhoiTao
                : trangThaiHienTai;

            var currentIndex = luongSteps.IndexOf(stepToFind);
            if (currentIndex < 0 || currentIndex >= luongSteps.Count - 1)
                return null;

            var trangThaiTiepTheo = luongSteps[currentIndex + 1];
            var (tenButton, chucVuNguoiXuLy, canChonNguoiXuLy) = MapTrangThaiToButton(trangThaiTiepTheo);

            return new ButtonLuongDto
            {
                TrangThaiHienTai = trangThaiHienTai,
                TrangThaiTiepTheo = trangThaiTiepTheo,
                TenButton = tenButton,
                ChucVuNguoiXuLy = chucVuNguoiXuLy,
                CanChonNguoiXuLy = canChonNguoiXuLy
            };
        }

        private static (string tenButton, string? chucVuNguoiXuLy, bool canChonNguoiXuLy) MapTrangThaiToButton(string trangThaiTiepTheo)
        {
            return trangThaiTiepTheo switch
            {
                TrangThaiPhieuConstant.GuiTruongPhong => ("Gửi Trưởng Phòng duyệt", "TruongPhong", true),
                TrangThaiPhieuConstant.GuiPhoCucTruong => ("Gửi Phó Cục Trưởng", "PhoCucTruong", true),
                TrangThaiPhieuConstant.GuiCucTruong => ("Gửi Cục/Vụ Trưởng phê duyệt", "CucTruong", true),
                "GuiVuTCCB" => ("Gửi Vụ TCCB thẩm định", "QLNS_VuTCCB", true),
                TrangThaiPhieuConstant.DaDuyet => ("Phê duyệt", null, false),
                _ => ("Chuyển bước", null, false)
            };
        }

        public static string GetTenXepLoai(int? xepLoai)
        {
            return xepLoai switch
            {
                1 => "Hoàn thành xuất sắc nhiệm vụ",
                2 => "Hoàn thành tốt nhiệm vụ",
                3 => "Hoàn thành nhiệm vụ",
                4 => "Không hoàn thành nhiệm vụ",
                _ => ""
            };
        }
    }
}
