using Hinet.Model.Entities;
using Hinet.Service.AppContractExtendService.Dto;
using Hinet.Service.AppContractExtendService.Request;
using Hinet.Service.Common.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.AppContractExtendService
{
    public interface IAppContractExtendService : IService<AppContractExtend>
    {
        Task<List<AppContractExtend>> UpsertAppContract(Guid contractId, List<AppContractExtendRequest> request);

        Task<List<AppContractExtendDto>> GetData(Guid contractId);
    }
}
