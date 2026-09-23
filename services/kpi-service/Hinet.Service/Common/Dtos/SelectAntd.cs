using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Common.Dtos
{
    public class SelectAntd
    {
        public object Value { get; set; }
        public bool Disabled { get; set; } = false;
        public bool Selected { get; set; } = false;

        public string Label { get; set; }


    }
}
