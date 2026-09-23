using Hinet.FileServer.Model.Entities;
using System.ComponentModel.DataAnnotations;

namespace Hinet.FileServer.Dto
{
    public class TaiLieuDinhKemDto : TaiLieuDinhKem
    {
        //public CertificateInfoDto? ValidSignerCertificate { get; set; }
        public string? SoToKhai { get; set; }
        public DateTime? NgayDangKy { get; set; }
    }

    public class TaiLieuDinhKemResponse
    {
        [StringLength(250)]
        public string? LoaiTaiLieu { get; set; } = "";
        public Guid Id { get; set; }
        public string DuongDanFile { get; set; } = "";

    }
}
