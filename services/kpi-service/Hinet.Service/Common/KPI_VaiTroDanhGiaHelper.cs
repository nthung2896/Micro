using System;
using System.Collections.Generic;
using System.Linq;
using Hinet.Service.Constant;
using Hinet.Service.KPI_PhieuDanhGiaService.Constant;
using Hinet.Service.KPI_PhieuDanhGiaService.Dto;

namespace Hinet.Service.Common
{
    /// <summary>
    /// File common quản lý và xác định các cột / vai trò đánh giá theo chức vụ và luồng
    /// </summary>
    public static class KPI_VaiTroDanhGiaHelper
    {
        private static bool IsChucVu(string? chucVu, IEnumerable<string> danhSachChucVu)
        {
            if (string.IsNullOrWhiteSpace(chucVu)) return false;

            var normalizedChucVu = new string(chucVu
                .Trim()
                .Where(char.IsLetterOrDigit)
                .ToArray())
                .ToUpperInvariant();
            return danhSachChucVu.Any(x => string.Equals(
                x == null
                    ? null
                    : new string(x.Trim().Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant(),
                normalizedChucVu,
                StringComparison.Ordinal));
        }

        /// <summary>
        /// Chuẩn hóa key vai trò về dạng chuẩn (CaNhan, PhoTruongPhong, TruongPhong, PhoCucTruong, CucTruong)
        /// </summary>
        public static string NormalizeRoleKey(string? rawRole)
        {
            if (string.IsNullOrWhiteSpace(rawRole)) return VaiTroDanhGiaV2Constant.CaNhan;
            var s = new string(rawRole
                .Trim()
                .ToLowerInvariant()
                .Where(char.IsLetterOrDigit)
                .ToArray());
            if (s == "canhan" || s == "ca_nhan") return VaiTroDanhGiaV2Constant.CaNhan;
            if (s == "photruongphong" || s == "phophong" || s == "photp" || s == "ptp") return VaiTroDanhGiaV2Constant.PhoTruongPhong;
            if (s == "truongphong" || s == "tp") return VaiTroDanhGiaV2Constant.TruongPhong;
            if (s == "phocuctruong" || s == "lanhdaocuc" || s == "phocuc" || s == "pct") return VaiTroDanhGiaV2Constant.PhoCucTruong;
            if (s == "cuctruong" || s == "ct") return VaiTroDanhGiaV2Constant.CucTruong;
            if (s == "phovutruong" || s == "phovu" || s == "pvt") return VaiTroDanhGiaV2Constant.PhoVuTruong;
            if (s == "vutruong" || s == "vt") return VaiTroDanhGiaV2Constant.VuTruong;

            return rawRole.Trim();
        }

        /// <summary>
        /// Lấy mã loại Luồng (LuongType) theo chức vụ của người được đánh giá
        /// </summary>
        public static LuongConstant.LuongType GetLuongTypeFromChucVu(string? chucVu)
        {
            if (string.IsNullOrWhiteSpace(chucVu))
            {
                return LuongConstant.LuongType.LuongChuyenVien;
            }

            var cv = chucVu.Trim();

            if (IsChucVu(cv, ChucVuConstant.ChucVuCucTruong))
            {
                return LuongConstant.LuongType.LuongCucTruong;
            }
            if (IsChucVu(cv, ChucVuConstant.ChucVuVuTruong) || string.Equals(cv, "VT", StringComparison.OrdinalIgnoreCase))
            {
                return LuongConstant.LuongType.LuongVuTruong;
            }
            if (IsChucVu(cv, ChucVuConstant.ChucVuPhoVuTruong) || string.Equals(cv, "PVT", StringComparison.OrdinalIgnoreCase))
            {
                return LuongConstant.LuongType.LuongPhoVuTruong;
            }
            if (IsChucVu(cv, ChucVuConstant.ChucVuPhoCucTruong))
            {
                return LuongConstant.LuongType.LuongPhoCucTruong;
            }
            if (IsChucVu(cv, ChucVuConstant.ChucVuTruongPhong))
            {
                return LuongConstant.LuongType.LuongTruongPhong;
            }
            if (IsChucVu(cv, ChucVuConstant.ChucVuPhoTruongPhong))
            {
                return LuongConstant.LuongType.LuongPhoTruongPhong;
            }

            return LuongConstant.LuongType.LuongChuyenVien;
        }

        /// <summary>
        /// Lấy danh sách các vai trò (cấp đánh giá) hợp lệ trong luồng của chức vụ người được đánh giá
        /// </summary>
        public static List<string> GetValidRoleCodesByChucVu(string? chucVu)
        {
            var luongType = GetLuongTypeFromChucVu(chucVu);
            return GetValidRoleCodesByLuong((int)luongType);
        }

        /// <summary>
        /// Lấy danh sách các vai trò hợp lệ theo mã Luồng (1: Chuyên viên, 2: Phó phòng, 3: Trưởng phòng, 4: Phó Cục trưởng, 5: Cục trưởng)
        /// </summary>
        public static List<string> GetValidRoleCodesByLuong(int luong)
        {
            switch ((LuongConstant.LuongType)luong)
            {
                case LuongConstant.LuongType.LuongPhoVuTruong:
                    // Người được đánh giá là Phó Vụ trưởng: Luồng cấp trên là Vụ trưởng
                    return new List<string>
                    {
                        VaiTroDanhGiaV2Constant.CaNhan,
                        VaiTroDanhGiaV2Constant.VuTruong
                    };

                case LuongConstant.LuongType.LuongVuTruong:
                    // Vụ trưởng tự đánh giá và phê duyệt
                    return new List<string>
                    {
                        VaiTroDanhGiaV2Constant.CaNhan
                    };

                case LuongConstant.LuongType.LuongChuyenVienCapVu:
                    // Chuyên viên thuộc Vụ: Cá nhân -> Phó Vụ trưởng -> Vụ trưởng
                    return new List<string>
                    {
                        VaiTroDanhGiaV2Constant.CaNhan,
                        VaiTroDanhGiaV2Constant.PhoVuTruong,
                        VaiTroDanhGiaV2Constant.VuTruong
                    };

                case LuongConstant.LuongType.LuongPhoTruongPhong:
                    // Người được đánh giá là Phó phòng: Luồng cấp trên bắt đầu từ Trưởng phòng
                    return new List<string>
                    {
                        VaiTroDanhGiaV2Constant.CaNhan,
                        VaiTroDanhGiaV2Constant.TruongPhong,
                        VaiTroDanhGiaV2Constant.PhoCucTruong,
                        VaiTroDanhGiaV2Constant.CucTruong
                    };

                case LuongConstant.LuongType.LuongTruongPhong:
                    // Người được đánh giá là Trưởng phòng: Luồng cấp trên bắt đầu từ Phó Cục trưởng/Cục trưởng
                    return new List<string>
                    {
                        VaiTroDanhGiaV2Constant.CaNhan,
                        VaiTroDanhGiaV2Constant.PhoCucTruong,
                        VaiTroDanhGiaV2Constant.CucTruong
                    };

                case LuongConstant.LuongType.LuongPhoCucTruong:
                    // Người được đánh giá là Phó Cục trưởng: Luồng cấp trên là Cục trưởng
                    return new List<string>
                    {
                        VaiTroDanhGiaV2Constant.CaNhan,
                        VaiTroDanhGiaV2Constant.CucTruong
                    };

                case LuongConstant.LuongType.LuongCucTruong:
                    // Cục trưởng tự đánh giá
                    return new List<string>
                    {
                        VaiTroDanhGiaV2Constant.CaNhan
                    };

                case LuongConstant.LuongType.LuongChuyenVien:
                default:
                    // Chuyên viên / Nhân viên: Đầy đủ các cấp
                    return new List<string>
                    {
                        VaiTroDanhGiaV2Constant.CaNhan,
                        VaiTroDanhGiaV2Constant.PhoTruongPhong,
                        VaiTroDanhGiaV2Constant.TruongPhong,
                        VaiTroDanhGiaV2Constant.PhoCucTruong,
                        VaiTroDanhGiaV2Constant.CucTruong
                    };
            }
        }

        /// <summary>
        /// Kiểm tra một vai trò cấp trên có hợp lệ để đánh giá cho chức vụ này hay không
        /// </summary>
        public static bool IsRoleValidForChucVu(string roleCode, string? chucVu)
        {
            var normalized = NormalizeRoleKey(roleCode);
            var validRoles = GetValidRoleCodesByChucVu(chucVu);
            return validRoles.Contains(normalized, StringComparer.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Lấy thông tin cấu hình hiển thị (Metadata) của một vai trò
        /// </summary>
        public static VaiTroDanhGiaColumnDto GetRoleColumnInfo(string roleCode, bool isEditable = false)
        {
            var normalized = NormalizeRoleKey(roleCode);
            switch (normalized)
            {
                case VaiTroDanhGiaV2Constant.CaNhan:
                    return new VaiTroDanhGiaColumnDto
                    {
                        Code = VaiTroDanhGiaV2Constant.CaNhan,
                        Name = "Cá nhân",
                        ShortLabel = "Cá nhân",
                        ScoreTitle = "Điểm cá nhân tự chấm",
                        Color = "#1d4ed8",
                        BgColor = "#dbeafe",
                        Order = 1,
                        IsEditable = isEditable
                    };

                case VaiTroDanhGiaV2Constant.PhoTruongPhong:
                    return new VaiTroDanhGiaColumnDto
                    {
                        Code = VaiTroDanhGiaV2Constant.PhoTruongPhong,
                        Name = "Phó phòng",
                        ShortLabel = "Phó phòng",
                        ScoreTitle = "PTP đánh giá",
                        Color = "#0891b2",
                        BgColor = "#cffafe",
                        Order = 2,
                        IsEditable = isEditable
                    };

                case VaiTroDanhGiaV2Constant.TruongPhong:
                    return new VaiTroDanhGiaColumnDto
                    {
                        Code = VaiTroDanhGiaV2Constant.TruongPhong,
                        Name = "Trưởng phòng",
                        ShortLabel = "Trưởng phòng",
                        ScoreTitle = "TP đánh giá",
                        Color = "#7c3aed",
                        BgColor = "#ede9fe",
                        Order = 3,
                        IsEditable = isEditable
                    };

                case VaiTroDanhGiaV2Constant.PhoCucTruong:
                    return new VaiTroDanhGiaColumnDto
                    {
                        Code = VaiTroDanhGiaV2Constant.PhoCucTruong,
                        Name = "Phó Cục trưởng",
                        ShortLabel = "Phó Cục trưởng",
                        ScoreTitle = "Phó Cục trưởng đánh giá",
                        Color = "#c026d3",
                        BgColor = "#fae8ff",
                        Order = 4,
                        IsEditable = isEditable
                    };

                case VaiTroDanhGiaV2Constant.CucTruong:
                    return new VaiTroDanhGiaColumnDto
                    {
                        Code = VaiTroDanhGiaV2Constant.CucTruong,
                        Name = "Cục trưởng",
                        ShortLabel = "Cục trưởng",
                        ScoreTitle = "Cục trưởng đánh giá",
                        Color = "#d97706",
                        BgColor = "#fef3c7",
                        Order = 5,
                        IsEditable = isEditable
                    };

                case VaiTroDanhGiaV2Constant.PhoVuTruong:
                    return new VaiTroDanhGiaColumnDto
                    {
                        Code = VaiTroDanhGiaV2Constant.PhoVuTruong,
                        Name = "Phó Vụ trưởng",
                        ShortLabel = "Phó Vụ trưởng",
                        ScoreTitle = "Phó Vụ trưởng đánh giá",
                        Color = "#0891b2",
                        BgColor = "#cffafe",
                        Order = 2,
                        IsEditable = isEditable
                    };

                case VaiTroDanhGiaV2Constant.VuTruong:
                    return new VaiTroDanhGiaColumnDto
                    {
                        Code = VaiTroDanhGiaV2Constant.VuTruong,
                        Name = "Vụ trưởng",
                        ShortLabel = "Vụ trưởng",
                        ScoreTitle = "Vụ trưởng đánh giá",
                        Color = "#0f766e",
                        BgColor = "#ccfbf1",
                        Order = 3,
                        IsEditable = isEditable
                    };

                default:
                    return new VaiTroDanhGiaColumnDto
                    {
                        Code = roleCode,
                        Name = roleCode,
                        ShortLabel = roleCode,
                        ScoreTitle = $"{roleCode} đánh giá",
                        Color = "#4b5563",
                        BgColor = "#f3f4f6",
                        Order = 99,
                        IsEditable = isEditable
                    };
            }
        }

        /// <summary>
        /// Lấy danh sách các cột vai trò cần hiển thị thực tế trên giao diện:
        /// - Luôn gồm Cá nhân (CaNhan)
        /// - Các vai trò đã có điểm chấm thực tế (evaluatedRoles)
        /// - Vai trò của người đang trực tiếp đánh giá (currentActionRole)
        /// </summary>
        public static List<VaiTroDanhGiaColumnDto> GetActiveRoleColumns(
            string? chucVu,
            IEnumerable<string>? evaluatedRoles = null,
            string? currentActionRole = null,
            bool canEditCurrentRole = false)
        {
            var validRoleCodes = GetValidRoleCodesByChucVu(chucVu);
            var activeCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { VaiTroDanhGiaV2Constant.CaNhan };

            // 1. Thêm các vai trò đã có dữ liệu chấm thực tế trong DB
            if (evaluatedRoles != null)
            {
                foreach (var role in evaluatedRoles)
                {
                    var normalized = NormalizeRoleKey(role);
                    if (validRoleCodes.Contains(normalized, StringComparer.OrdinalIgnoreCase))
                    {
                        activeCodes.Add(normalized);
                    }
                }
            }

            // 2. Thêm vai trò của người đang trực tiếp đánh giá
            if (!string.IsNullOrWhiteSpace(currentActionRole))
            {
                var normAction = NormalizeRoleKey(currentActionRole);
                if (validRoleCodes.Contains(normAction, StringComparer.OrdinalIgnoreCase))
                {
                    activeCodes.Add(normAction);
                }
            }

            // 3. Sắp xếp theo thứ tự quy chuẩn và chuyển sang DTO
            var normActionRole = !string.IsNullOrWhiteSpace(currentActionRole) ? NormalizeRoleKey(currentActionRole) : null;

            return activeCodes
                .Select(code =>
                {
                    var isEditable = canEditCurrentRole && normActionRole != null &&
                                     code.Equals(normActionRole, StringComparison.OrdinalIgnoreCase);
                    return GetRoleColumnInfo(code, isEditable);
                })
                .OrderBy(c => c.Order)
                .ToList();
        }

        /// <summary>
        /// Kiểm tra xem người dùng có phải từ cấp Phó Trưởng phòng trở lên (lãnh đạo/quản lý) hay không
        /// </summary>
        public static bool IsPhoPhongTroLen(
            string? chucVu,
            IEnumerable<string>? roles = null,
            bool isCT = false,
            bool isPCT = false,
            bool isTP = false,
            bool isPTP = false,
            bool isTP_PTP = false)
        {
            if (isCT || isPCT || isTP || isPTP || isTP_PTP) return true;

            if (roles != null && roles.Any(r =>
                !string.IsNullOrWhiteSpace(r) && (
                r.Contains("Admin", StringComparison.OrdinalIgnoreCase) ||
                r.Contains("CucTruong", StringComparison.OrdinalIgnoreCase) ||
                r.Contains("PhoCuc", StringComparison.OrdinalIgnoreCase) ||
                r.Contains("TruongPhong", StringComparison.OrdinalIgnoreCase) ||
                r.Contains("PhoTruongPhong", StringComparison.OrdinalIgnoreCase) ||
                r.Contains("PhoPhong", StringComparison.OrdinalIgnoreCase) ||
                r.Contains("VuTruong", StringComparison.OrdinalIgnoreCase) ||
                r.Contains("LanhDao", StringComparison.OrdinalIgnoreCase))))
            {
                return true;
            }

            var luongType = GetLuongTypeFromChucVu(chucVu);
            return luongType != LuongConstant.LuongType.LuongChuyenVien;
        }
    }
}
