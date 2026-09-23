using Hinet.Service.Core.Mapper;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Hinet.Model.Entities;

using Hinet.Service.OperationService;

using Hinet.Service.OperationService.Dto;

using Hinet.Service.OperationService.Request;

using Hinet.Service.Common;

using Hinet.Service.Dto;

using Microsoft.EntityFrameworkCore;

using Hinet.Api.Dto;



namespace Hinet.Controllers

{

    [Route("api/[controller]")]

    [Authorize]
    public class OperationController : HinetController

    {

        private readonly IOperationService _operationService;

        private readonly IMapper _mapper;

        private readonly ILogger<OperationController> _logger;



        public OperationController(

            IOperationService operationService,

            IMapper mapper,

            ILogger<OperationController> logger

            )

        {

            this._operationService = operationService;

            this._mapper = mapper;

            _logger = logger;

        }



        [HttpPost("Create")]

        public async Task<DataResponse<Operation>> Create([FromBody] OperationRequest model)

        {

            if (ModelState.IsValid)

            {

                try

                {

                    var entity = _mapper.Map<OperationRequest, Operation>(model);

                    await _operationService.CreateAsync(entity);

                    return new DataResponse<Operation>() { Data = entity, Status = true };

                }

                catch (Exception ex)

                {

                    return DataResponse<Operation>.False("Error", new string[] { ex.Message });

                }

            }

            return DataResponse<Operation>.False("Some properties are not valid", ModelStateError);

        }



        [HttpPut("Update")]

        public async Task<DataResponse<Operation>> Update([FromBody] OperationRequest model)

        {

            if (ModelState.IsValid)

            {

                try

                {

                    var entity = await _operationService.GetByIdAsync(model.Id);

                    if (entity == null)

                        return DataResponse<Operation>.False("Operation not found");



                    entity = _mapper.Map(model, entity);

                    await _operationService.UpdateAsync(entity);

                    return new DataResponse<Operation>() { Data = entity, Status = true };

                }

                catch (Exception ex)

                {

                    DataResponse<Operation>.False(ex.Message);

                }

            }

            return DataResponse<Operation>.False("Some properties are not valid", ModelStateError);

        }



        [HttpGet("Get/{id}")]

        public async Task<DataResponse<OperationDto>> Get(Guid id)

        {

            var result = await _operationService.GetDto(id);

            return new DataResponse<OperationDto>

            {

                Data = result,

                Message = "Get DataResponse<OperationDto> thành công",

                Status = true

            };

        }



        [HttpPost("GetData")]

        public async Task<DataResponse<PagedList<OperationDto>>> GetData([FromBody] OperationSearch search)

        {

            var result = await _operationService.GetData(search);

            return new DataResponse<PagedList<OperationDto>>

            {

                Data = result,

                Message = "GetData PagedList<OperationDto> thành công",

                Status = true

            };

        }



        [HttpDelete("Delete/{id}")]

        public async Task<DataResponse> Delete(Guid id)

        {

            try

            {

                var entity = await _operationService.GetByIdAsync(id);

                await _operationService.DeleteAsync(entity);

                return DataResponse.Success(null);

            }

            catch (Exception ex)

            {

                return DataResponse.False(ex.Message);

            }

        }



        [HttpPost("GetMenu")]

        public async Task<DataResponse<List<MenuDataDto>>> GetMenu()

        {

            var result = await _operationService.GetListOperationOfUser(UserId.GetValueOrDefault());

            return new DataResponse<List<MenuDataDto>>

            {

                Data = result,

                Message = "GetMenu List<MenuDataDto> thành công",

                Status = true

            };

        }



        [HttpPost("GetConfigOperation")]

        public async Task<DataResponse<List<ModuleMenuDTO>>> GetConfigOperation(Guid roleId)

        {

            var result = await _operationService.GetListOperationOfRole(roleId);

            return new DataResponse<List<ModuleMenuDTO>>

            {

                Data = result,

                Message = "GetConfigOperation List<ModuleMenuDTO> thành công",

                Status = true

            };

        }



        [HttpGet("GetBreadcrumb")]

        public async Task<DataResponse<dynamic>> GetBreadcrumb()

        {

            var operationList = await _operationService.GetQueryable().Select(x => new

            {

                x.Name,

                x.Url

            }).ToListAsync();

            return DataResponse<dynamic>.Success(operationList);

        }

    }

}
