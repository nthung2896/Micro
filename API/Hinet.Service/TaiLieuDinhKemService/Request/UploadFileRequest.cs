using Hinet.Model.Entities;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.TaiLieuDinhKemService.Dto
{
    public class UploadFileRequest
    {
        [Required]
        public IFormFileCollection? Files { get; set; }
        public string? FileType { get; set; } = "";
        public Guid? ItemId { get; set; }
        public bool? IsTemp { get; set; } = false;
    }
}
