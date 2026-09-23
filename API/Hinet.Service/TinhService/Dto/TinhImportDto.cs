
using Hinet.Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.TinhService.Dto
{
    public class TinhImportDto
    {
        [Required]
        [DisplayName("Số Hiệu")]
        public int SoH { get; set; }
        [Required]
        [DisplayName("Cấp")]
        public int Cap { get; set; }
        [DisplayName("Số thứ tự")]
        public int? STT { get; set; }
        [DisplayName("Chức vụ")]
        public bool? IsCucVu { get; set; }
        [Required]
        [DisplayName("Tên Đơn vị")]
        public string TenDv { get; set; }
        [DisplayName("Mã Tỉnh Mới")]
        public string? MaTinhMoi { get; set; }
        [Required]
        [DisplayName("Mã Đơn vị")]
        public string MaDv { get; set; }

        [Required]
        [DisplayName("Mã Tỉnh")]
        public string MaTinh { get; set; }

    }
}