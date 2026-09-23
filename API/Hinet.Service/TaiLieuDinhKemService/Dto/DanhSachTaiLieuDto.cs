using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.TaiLieuDinhKemService.Dto
{
    public class DanhSachTaiLieuDto
    {
        public Guid Id { get; set; }
        public string TenTaiLieu { get; set; }
        public string LoaiTaiLieu { get; set; }
        public string DuongDanFile { get; set; }

    }
}
