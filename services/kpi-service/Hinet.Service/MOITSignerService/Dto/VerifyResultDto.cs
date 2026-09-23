using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.MOITSignerService.Dto
{
    public class VerifyResultDto
    {
        public bool Success { get; set; }
        public string? Error { get; set; }
    }
}
