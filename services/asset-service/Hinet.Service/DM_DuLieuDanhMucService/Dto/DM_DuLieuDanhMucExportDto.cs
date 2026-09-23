using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.DM_DuLieuDanhMucService.Dto
{
    public class DM_DuLieuDanhMucExportDto
    {
        public string Name { get; set; }
        public string Code { get; set; }
        public string? Note { get; set; }
        public int? Priority { get; set; }
    }
}
