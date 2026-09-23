using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.AppConfigurationService.ViewModels
{
    public class AppConfigurationEditVM : AppConfigurationCreateVM
    {
        public Guid? Id { get; set; }
    }
}