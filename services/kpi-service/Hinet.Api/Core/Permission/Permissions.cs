namespace Hinet.Api.Core.Permission
{
    public static class Permissions
    {
        public static class Tinh
        {
            public const string Data = "A.1";
            public const string Create = "A.2";
            public const string Update = "A.3";
            public const string Delete = "A.4";
            public const string Report = "A.5";
            public const string BaoCao = "A.6";
        }
        public static class Huyen
        {
            public const string Data = "A.1";
            public const string Create = "A.2";
            public const string Update = "A.3";
            public const string Delete = "A.4";
        }

        public static class PlatformManage
        {
            // List tabs
            public const string ListAll = "PLATFORM_MANAGE_LIST_ALL";
            public const string ListChoDuyet = "PLATFORM_MANAGE_LIST_CHODUYET";
            public const string ListBiTuChoi = "PLATFORM_MANAGE_LIST_BITUCHOI";
            public const string ListDaDuyetDienTu = "PLATFORM_MANAGE_LIST_DADUYETDIENTU";
            public const string ListDaReview = "PLATFORM_MANAGE_LIST_DAREVIEW";
            public const string ListDaXacNhan = "PLATFORM_MANAGE_LIST_DAXACNHAN";

            // Detail tabs
            public const string DetailTabThongTinHoSo = "PLATFORM_MANAGE_DETAIL_TAB_THONGTINHOSO";
            public const string DetailTabTaiLieuDinhKem = "PLATFORM_MANAGE_DETAIL_TAB_TAILIEUDINHKEM";
            public const string DetailTabPhanAnh = "PLATFORM_MANAGE_DETAIL_TAB_PHANANH";
            public const string DetailTabCanhBaoViPham = "PLATFORM_MANAGE_DETAIL_TAB_CANHBAOVIPHAM";
            public const string DetailTabLichSuThayDoi = "PLATFORM_MANAGE_DETAIL_TAB_LICHSUTHAYDOI";
            public const string DetailTabYeuCauDoanhNghiep = "PLATFORM_MANAGE_DETAIL_TAB_YEUCAUDOANHNGHIEP";
            public const string DetailTabTichHop = "PLATFORM_MANAGE_DETAIL_TAB_TICHHOP";

            // Cán bộ xem/sửa nền tảng TMĐT tích hợp của doanh nghiệp (ngoài Admin)
            public const string ActionTichHopEdit = "PLATFORM_MANAGE_ACTION_TICHHOP_EDIT";

            // Actions
            public const string ActionDuyetDienTu = "PLATFORM_MANAGE_ACTION_DUYETDIENTU";
            public const string ActionPhanCong = "PLATFORM_MANAGE_ACTION_PHANCONG";

            // Granular actions for NenTangTrucTuyen
            // Chuyên viên
            public const string ActionNhanTuXuLy = "PLATFORM_MANAGE_ACTION_NHANTUXULY";
            public const string ActionBoSungCV = "PLATFORM_MANAGE_ACTION_BOSUNG_CV";
            public const string ActionXinYKien = "PLATFORM_MANAGE_ACTION_XINYKIEN";
            public const string ActionTuChoiCV = "PLATFORM_MANAGE_ACTION_TUCHOI_CV";
            public const string ActionChamDut = "PLATFORM_MANAGE_ACTION_CHAMDUT";
            public const string ActionChoDuyetCV = "PLATFORM_MANAGE_ACTION_CHODUYET_CV";

            // Trưởng phòng
            public const string ActionReviewThongQua = "PLATFORM_MANAGE_ACTION_REVIEWTHONGQUA";
            public const string ActionYeuCauBanGiay = "PLATFORM_MANAGE_ACTION_YEUCAUBANGIAY";
            public const string ActionBoSungTP = "PLATFORM_MANAGE_ACTION_BOSUNG_TP";
            public const string ActionTuChoiTP = "PLATFORM_MANAGE_ACTION_TUCHOI_TP";

            // Lãnh đạo
            public const string ActionPheDuyet = "PLATFORM_MANAGE_ACTION_PHEDUYET";
            public const string ActionBoSungLD = "PLATFORM_MANAGE_ACTION_BOSUNG_LD";
            public const string ActionTuChoiLD = "PLATFORM_MANAGE_ACTION_TUCHOI_LD";
        }

        public static class PlatformBanNenTang
        {
            // Chuyên viên
            public const string ActionNhanTuXuLy = "PLATFORMBANENTANG_MANAGE_ACTION_NHANTUXULY";
            public const string ActionDuyetDienTu = "PLATFORMBANENTANG_MANAGE_ACTION_DUYETDIENTU";
            public const string ActionBoSungCV = "PLATFORMBANENTANG_MANAGE_ACTION_BOSUNG_CV";
            public const string ActionXinYKien = "PLATFORMBANENTANG_MANAGE_ACTION_XINYKIEN";
            public const string ActionTuChoiCV = "PLATFORMBANENTANG_MANAGE_ACTION_TUCHOI_CV";
            public const string ActionChamDut = "PLATFORMBANENTANG_MANAGE_ACTION_CHAMDUT";
            public const string ActionChoDuyetCV = "PLATFORMBANENTANG_MANAGE_ACTION_CHODUYET_CV";

            // Trưởng phòng
            public const string ActionPhanCong = "PLATFORMBANENTANG_MANAGE_ACTION_PHANCONG";
            public const string ActionReviewThongQua = "PLATFORMBANENTANG_MANAGE_ACTION_REVIEWTHONGQUA";
            public const string ActionYeuCauBanGiay = "PLATFORMBANENTANG_MANAGE_ACTION_YEUCAUBANGIAY";
            public const string ActionBoSungTP = "PLATFORMBANENTANG_MANAGE_ACTION_BOSUNG_TP";
            public const string ActionTuChoiTP = "PLATFORMBANENTANG_MANAGE_ACTION_TUCHOI_TP";

            // Lãnh đạo
            public const string ActionPheDuyet = "PLATFORMBANENTANG_MANAGE_ACTION_PHEDUYET";
            public const string ActionBoSungLD = "PLATFORMBANENTANG_MANAGE_ACTION_BOSUNG_LD";
            public const string ActionTuChoiLD = "PLATFORMBANENTANG_MANAGE_ACTION_TUCHOI_LD";
        }
    }
}
