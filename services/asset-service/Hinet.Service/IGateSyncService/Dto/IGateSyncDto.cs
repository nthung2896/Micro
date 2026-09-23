using System.Text.Json.Serialization;

namespace Hinet.Service.IGateSyncService.Dto
{
    public class IGateTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; }
    }

    public class IGateDossierListResponse
    {
        public int Total { get; set; }
        public List<IGateDossierItem> Data { get; set; }
    }

    public class IGateDossierItem
    {
        public string MaHoSo { get; set; }
        public string TenChuHoSo { get; set; }
        public string SoGiayTo { get; set; }
        public string Email { get; set; }
        public string DienThoai { get; set; }
        public string NgayTiepNhan { get; set; }
        public string NgayHenTra { get; set; }
        public string TrangThaiHoSo { get; set; }
        public string MaTTHC { get; set; }
        public string EformId { get; set; }
    }

    public class DossierProgressDto
    {
        public string IDHoSo { get; set; }
        public string MaHoSo { get; set; }
        public string NguoiXuLy { get; set; }
        public DateTime ThoiDiemXuLy { get; set; }
        public string PhongBanXuLy { get; set; }
        public string NoiDungXuLy { get; set; }
        public int TrangThai { get; set; }
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThucTheoQuyDinh { get; set; }
    }
}
