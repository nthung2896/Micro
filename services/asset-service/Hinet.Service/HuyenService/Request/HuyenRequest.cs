using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.HuyenService.Request
{
    public class HuyenRequest
    {
        public Guid? Id { get; set; }
        [Required]
        public int LoaiHuyen { get; set; }
        [Required]
        public string TenHuyen { get; set; }
        [Required]
        public string Ma { get; set; }
        [Required]
        public string MaTinh { get; set; }
        public string? MaTinhMoi { get; set; }
    }
}