using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Hinet.Service.TaiLieuDinhKemService.Dto
{
    public class UploadFileDto
    {
        [Required] public IFormFileCollection? Files { get; set; }

        public string? FileType { get; set; } = "";
        public Guid? ItemId { get; set; }
        public bool? IsTemp { get; set; } = false;
        public string? MoTa { get; set; } = "";
        public Guid? IdBieuMau { get; set; }
    }
}