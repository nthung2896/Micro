
using Hinet.Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Hinet.Domain.Entites;

namespace Hinet.Service.HuyenService.Dto
{
    public class HuyenDto : Huyen
    {
        public string TenTinh { get; set; }
    }
}