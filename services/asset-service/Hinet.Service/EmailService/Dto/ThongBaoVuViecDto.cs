using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.EmailService.Dto
{
    public class ThongBaoVuViecDto
    {
        public string CaseCode { get; set; }

        public DateTime TimeOfOccurrence { get; set; }

        public string Address { get; set; }

        public string RelatedPerson { get; set; }

        public string Content { get; set; }

        public string Solutions { get; set; }

        public string PersonInChagrge { get; set; }

        public string Email { get; set; }

        public string Phone { get; set; }

        public DateTime ResponseTime { get; set; }
    }
}
