using Hinet.Service.DM_DuLieuDanhMucService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.DM_NhomDanhMucService.Dto
{
    public class DanhMucDto
    {
        public Guid Id { get; set; }
        public string? GroupName { get; set; }
        public string? GroupCode { get; set; }
        public long? Priority { get; set; }
        public List<DuLieuDanhMucDto>? ListDuLieuDanhMuc { get; set; }
    }
}
