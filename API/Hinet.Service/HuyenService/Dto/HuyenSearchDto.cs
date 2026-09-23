using Hinet.Service.Common;
using Hinet.Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.HuyenService.Dto
{
    public class HuyenSearchDto : SearchBase
    {
        public int LoaiHuyenFilter { get; set; }
        public string TenHuyenFilter { get; set; }
        public string MaFilter { get; set; }
        public string MaTinhFilter { get; set; }
        public string? MaTinhMoiFilter { get; set; }


    }
}