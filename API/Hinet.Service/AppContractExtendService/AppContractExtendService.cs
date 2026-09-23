using Hinet.Model.Entities;
using Hinet.Repository;
using Hinet.Service.AppContractExtendService.Dto;
using Hinet.Service.AppContractExtendService.Request;
using Hinet.Service.Common.Service;
using Hinet.Service.Core.Mapper;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Hinet.Service.AppContractExtendService
{
    public class AppContractExtendService : Service<AppContractExtend>, IAppContractExtendService
    {
        private readonly IMapper _mapper;
        public AppContractExtendService(IRepository<AppContractExtend> repository, IMapper mapper) : base(repository)
        {
            _mapper = mapper;
        }

        public async Task<List<AppContractExtendDto>> GetData(Guid contractId)
        {
            var query = GetQueryable().Where(e => e.ContractId == contractId)
                .Select(e => new AppContractExtendDto
                {
                    ContractId = e.ContractId,
                    AppLink = e.AppLink,
                    AppName = e.AppName,
                    Id = e.Id,
                    Logo = e.Logo,
                    OsCode = e.OsCode,
                });
            return await query.ToListAsync();
        }

        public async Task<List<AppContractExtend>> UpsertAppContract(Guid contractId,List<AppContractExtendRequest> requests)
        {
            if(requests.Count <= 0)
            {
                return new List<AppContractExtend>();
            }
            var requestIds = requests
                .Where(x => x.Id.HasValue && x.Id.Value != Guid.Empty)
                .Select(x => x.Id!.Value)
                .Distinct()
                .ToHashSet();

            var currentEntities = await GetQueryable()
                .Where(x => x.ContractId == contractId)
                .ToListAsync();

            var existedEntities = currentEntities
                .ToDictionary(x => x.Id);

            // delete entities not exists in request
            var entitiesToDelete = currentEntities
                .Where(x => !requestIds.Contains(x.Id))
                .ToList();

            if (entitiesToDelete.Any())
            {
                await DeleteAsync(entitiesToDelete);
            }

            var results = new List<AppContractExtend>();

            foreach (var item in requests)
            {
                AppContractExtend entity;

                // update
                if (item.Id.HasValue &&
                    existedEntities.TryGetValue(item.Id.Value, out var existedEntity))
                {
                    entity = existedEntity;

                    _mapper.Map(item, entity);

                    entity.ContractId = contractId;

                    await UpdateAsync(entity);
                }
                // create
                else
                {
                    entity = new AppContractExtend
                    {
                        Id = item.Id.HasValue ? item.Id.Value : new Guid(),
                    };

                    _mapper.Map(item, entity);

                    entity.ContractId = contractId;

                    await CreateAsync(entity);
                }

                results.Add(entity);
            }

            return results;

        }
    }
}
