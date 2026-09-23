using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Hinet.Model.MongoEntities;

namespace Hinet.Service.BCSubmissionDataService.Dto
{
    public class BCSubmissionDataDto : BCSubmissionData
    {
        public string? TenNenTang { get; set; }
        public string? TenDotBaoCao { get; set; }
        public string? LoaiNenTang { get; set; }
        public string? LoaiKyBaoCao { get; set; }
    }
}
