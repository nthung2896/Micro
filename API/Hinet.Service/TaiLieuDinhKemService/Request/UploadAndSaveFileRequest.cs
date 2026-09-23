using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.TaiLieuDinhKemService.Request
{
    public class UploadAndSaveFileRequest
    {
        public IFormFile File { get; set; } = null!;

        public string? TenTaiLieuText { get; set; }

        public string FolderType { get; set; } = "TaiLieuDaoTao";

        public Guid? ItemId { get; set; }

        public List<Guid>? TagIds { get; set; }
    }
}
