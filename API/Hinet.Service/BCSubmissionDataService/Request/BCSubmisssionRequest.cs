using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Hinet.Model.MongoEntities;

namespace Hinet.Service.BCSubmissionDataService.Request
{
    public class BCSubmisssionRequest : BCSubmissionData
    {
        public string? TenNenTang { get; set; }
        public string TenDotBaoCao { get; set; }
    }
}
