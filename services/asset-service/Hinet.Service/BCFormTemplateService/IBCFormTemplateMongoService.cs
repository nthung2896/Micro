using Hinet.Model.MongoEntities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hinet.Service.BCFormTemplateService
{
    public interface IBCFormTemplateMongoService
    {
        Task<BCFormTemplate?> GetByIdAsync(string id);
        Task<BCFormTemplate?> GetByBaoCaoIdAsync(string baoCaoId);
        Task<BCFormTemplate> SaveTemplateAsync(BCFormTemplate template, string username, string userId);
        Task<List<BCFormTemplate>> GetAllTemplatesAsync();
    }
}
