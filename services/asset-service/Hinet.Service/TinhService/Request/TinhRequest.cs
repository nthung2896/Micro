using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.TinhService.Request
{
    public class TinhRequest
    {
        public Guid? Id { get; set; }

        public int? STT { get; set; }
        [Required]
        public string TenTinh { get; set; }

        [Required]
        public string MaTinh { get; set; }
    }
}