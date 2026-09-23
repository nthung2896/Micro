using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.AppUserService.Request
{
    public class ForgotPasswordViewModel
    {
        [Required]
        public string? UserName { get; set; }
        [Required]
        public string? Email { get; set; }
        public string? Url { get; set; }
    }
}
