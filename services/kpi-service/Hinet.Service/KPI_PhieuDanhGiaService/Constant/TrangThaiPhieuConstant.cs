using Hinet.Service.Constant;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.KPI_PhieuDanhGiaService.Constant
{
    /// <summary>
    /// Constants trạng thái cho Luồng Đánh giá v1 (Đơn cấp / Truyền thống: Cấp dưới gửi lên cấp trên 1 cấp -> Cấp trên duyệt là Đã duyệt)
    /// </summary>
    public class TrangThaiPhieuV1Constant
    {
        public const string KhoiTao = "KhoiTao";
        public const string GuiPhoTruongPhong = "GuiPhoTruongPhong";
        public const string GuiTruongPhong = "GuiTruongPhong";
        public const string GuiPhoCucTruong = "GuiPhoCucTruong";
        public const string GuiPhoVuTruong = "GuiPhoVuTruong";
        public const string GuiVuTruong = "GuiVuTruong";
        public const string GuiCucTruong = "GuiCucTruong";
        public const string GuiPhoGiamDocTT = "GuiPhoGiamDocTT";
        public const string GuiGiamDocTT = "GuiGiamDocTT";
        public const string GuiPhoChanhVanPhong = "GuiPhoChanhVanPhong";
        public const string GuiChanhVanPhong = "GuiChanhVanPhong";
        public const string DaDuyet = "DaDuyet";
        public const string TuChoi = "TuChoi";
        public const string TraVe = "TraVe";
        // Chỉ dùng cho bản ghi lịch sử quá trình khi người dùng thu hồi phiếu.
        // Trạng thái của phiếu vẫn được chuyển về KhoiTao để tiếp tục chỉnh sửa.
        public const string ThuHoi = "ThuHoi";

        public static List<string> LuongChuyenVien = new List<string>()
        {
            KhoiTao,
            GuiPhoTruongPhong,
            DaDuyet,
        };

        public static List<string> LuongPhoTruongPhong = new List<string>()
        {
            KhoiTao,
            GuiTruongPhong,
            DaDuyet,
        };

        public static List<string> LuongTruongPhong = new List<string>()
        {
            KhoiTao,
            GuiPhoCucTruong,
            DaDuyet,
        };

        public static List<string> LuongPhoCucTruong = new List<string>()
        {
            KhoiTao,
            GuiCucTruong,
            DaDuyet,
        };

        public static List<string> LuongCucTruong = new List<string>()
        {
            KhoiTao,
            DaDuyet,
        };

        public static List<string> LuongChuyenVienCapVu = new List<string>()
        {
            KhoiTao,
            GuiPhoVuTruong,
            DaDuyet,
        };

        public static List<string> LuongPhoVuTruong = new List<string>()
        {
            KhoiTao,
            GuiVuTruong,
            DaDuyet,
        };

        public static List<string> LuongVuTruong = new List<string>()
        {
            KhoiTao,
            DaDuyet,
        };

        public static List<string> LuongTruongPhongTT = new List<string>()
        {
            KhoiTao,
            GuiPhoGiamDocTT,
            DaDuyet,
        };

        public static List<string> LuongPhoGiamDocTT = new List<string>()
        {
            KhoiTao,
            GuiGiamDocTT,
            DaDuyet,
        };

        public static List<string> LuongGiamDocTT = new List<string>()
        {
            KhoiTao,
            DaDuyet,
        };

        public static List<string> LuongChuyenVienVanPhongCap2 = new List<string>()
        {
            KhoiTao,
            GuiPhoChanhVanPhong,
            DaDuyet,
        };

        public static List<string> LuongPhoChanhVanPhong = new List<string>()
        {
            KhoiTao,
            GuiChanhVanPhong,
            DaDuyet,
        };

        public static List<string> LuongChanhVanPhong = new List<string>()
        {
            KhoiTao,
            DaDuyet,
        };
    }

    /// <summary>
    /// Constants trạng thái cho Luồng Đánh giá v2 (Đa cấp / Multi-Cap 5 cấp duyệt tuần tự)
    /// </summary>
    public class TrangThaiPhieuV2Constant
    {
        public const string KhoiTao = "KhoiTao";
        public const string GuiPhoTruongPhong = "GuiPhoTruongPhong";
        public const string GuiTruongPhong = "GuiTruongPhong";
        public const string GuiPhoCucTruong = "GuiPhoCucTruong";
        public const string GuiCucTruong = "GuiCucTruong";
        public const string DaDuyet = "DaDuyet";
        public const string TuChoi = "TuChoi";
        public const string TraVe = "TraVe";
        public const string ThuHoi = "ThuHoi";

        public static List<string> LuongChuyenVien = new List<string>()
        {
            KhoiTao,
            GuiPhoTruongPhong,
            GuiTruongPhong,
            GuiPhoCucTruong,
            GuiCucTruong,
            DaDuyet,
        };

        public static List<string> LuongPhoTruongPhong = new List<string>()
        {
            KhoiTao,
            GuiTruongPhong,
            GuiPhoCucTruong,
            GuiCucTruong,
            DaDuyet,
        };

        public static List<string> LuongTruongPhong = new List<string>()
        {
            KhoiTao,
            GuiPhoCucTruong,
            GuiCucTruong,
            DaDuyet,
        };

        public static List<string> LuongPhoCucTruong = new List<string>()
        {
            KhoiTao,
            GuiCucTruong,
            DaDuyet,
        };
    }

    /// <summary>
    /// Constants các vai trò đánh giá chi tiết trong Luồng v2
    /// </summary>
    public class VaiTroDanhGiaV2Constant
    {
        public const string CaNhan = "CaNhan";
        public const string PhoTruongPhong = "PhoTruongPhong";
        public const string TruongPhong = "TruongPhong";
        public const string PhoCucTruong = "PhoCucTruong";
        public const string CucTruong = "CucTruong";
        public const string PhoVuTruong = "PhoVuTruong";
        public const string VuTruong = "VuTruong";
    }

    /// <summary>
    /// Giữ nguyên class TrangThaiPhieuConstant kế thừa TrangThaiPhieuV1Constant để đảm bảo luồng v1 chuẩn 1 cấp
    /// </summary>
    public class TrangThaiPhieuConstant : TrangThaiPhieuV1Constant
    {
    }
}
