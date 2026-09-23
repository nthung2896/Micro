using Hinet.Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.HuyenService.Dto
{
    public class HuyenImportDto
    {
        [Required]
        [DisplayName("Loại huyện")]
        public int LoaiHuyen { get; set; }
        [Required]
        [DisplayName("Tên huyện")]
        public string TenHuyen { get; set; }
        [Required]
        [DisplayName("Mã")]
        public string Ma { get; set; }
        [Required]
        [DisplayName("Mã tỉnh")]
        public string MaTinh { get; set; }
        [DisplayName("Mã tỉnh mới")]
        public string? MaTinhMoi { get; set; }

    }
}