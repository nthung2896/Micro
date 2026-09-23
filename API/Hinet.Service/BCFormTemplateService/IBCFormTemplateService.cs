using Hinet.Model.MongoEntities;
using Hinet.Service.BCFormTemplateService.Dto;
using Hinet.Service.BCFormTemplateService.Request;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.BCFormTemplateService
{
    public interface IBCFormTemplateService : IMongoService<BCFormTemplate>
    {
        Task<BCFormTemplate> CreateFormTemplate(BCFormTemplateRequest request);

        Task<MongoPagedList<BCFormTemplateDto>> GetData(BCFormTemplateSearch search);

        Task<BCFormTemplateDto> GetDto(string id);

        Task<BCFormTemplate> UpdateFormTemplate(BCFormTemplateRequest request);

        Task<bool> UpdateInputsAsync(UpdateFormInputsRequest request);

        Task UpdateDropdownInput(UpdateInputDropdownRequest request);
    }
}
