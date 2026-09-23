using System;

namespace Hinet.Service.TaiLieuDinhKemService.Dto
{
    public class FileInfoResponseDto
    {
        public Guid Id { get; set; }
        public string TenTaiLieuGoc { get; set; }
        public string TenTaiLieuText { get; set; }
        public long? KichThuoc { get; set; }
        public string Extension { get; set; }
    }
}
