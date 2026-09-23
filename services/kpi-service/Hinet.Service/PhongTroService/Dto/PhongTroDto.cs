using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;
using System.Collections.Generic;

namespace Hinet.Service.PhongTroService.Dto
{
    public class PhongTroDto : PhongTro
    {
        public List<TaiLieuDinhKem>? DanhSachTaiLieu { get; set; }
    }
}
