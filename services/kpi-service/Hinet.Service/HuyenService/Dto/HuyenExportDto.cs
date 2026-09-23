using Hinet.Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel;

namespace Hinet.Service.HuyenService.Dto
{
    public class HuyenExportDto
    {
        [DisplayName("Loại huyện")]
        public int LoaiHuyen { get; set; }
        [DisplayName("Tên huyện")]
        public string TenHuyen { get; set; }
        [DisplayName("Mã")]
        public string Ma { get; set; }
        [DisplayName("Mã tỉnh")]
        public string MaTinh { get; set; }
        [DisplayName("Mã tỉnh mới")]
        public string? MaTinhMoi { get; set; }

    }
}