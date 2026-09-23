using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Hinet.Model.Entities;

namespace Hinet.Domain.Entites
{
    [Table("Huyen")]
    public class Huyen : AuditableEntity
    {
        [DisplayName("Tên Huyện")]
        public string TenHuyen { get; set; }

        [DisplayName("Mã")]
        public string Ma { get; set; }

        [DisplayName("Mã Tỉnh")]
        public string MaTinh { get; set; }

        [DisplayName("Loại Huyện")]
        public int LoaiHuyen { get; set; }
    }
}
