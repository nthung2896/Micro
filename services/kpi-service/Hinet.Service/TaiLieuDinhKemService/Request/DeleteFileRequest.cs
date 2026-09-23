
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.TaiLieuDinhKemService.Request
{
    public class DeleteFileRequest
    {
        public List<Guid>? Ids { get; set; }

    }
}