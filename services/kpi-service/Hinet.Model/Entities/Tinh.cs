using Hinet.Model.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VKS.Domain.Entites
{
    [Table("Tinh")]
    public class Tinh : AuditableEntity
    {
        [DisplayName("Tên Tỉnh")]
        public string TenTinh { get; set; }

        [DisplayName("Số thứ tự")]
        public int? STT { get; set; }

        [DisplayName("Mã Tỉnh")]
        public string? MaTinh { get; set; }
    }
}
