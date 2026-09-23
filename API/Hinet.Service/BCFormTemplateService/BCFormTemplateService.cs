using Hinet.Extensions;
using Hinet.Model.Entities;
using Hinet.Model.MongoEntities;
using Hinet.Repository.Common;
using Hinet.Service.BCFormTemplateService.Dto;
using Hinet.Service.BCFormTemplateService.Request;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Core.Mapper;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using System.Text.RegularExpressions;

namespace Hinet.Service.BCFormTemplateService
{
    public class BCFormTemplateService : MongoService<BCFormTemplate>, IBCFormTemplateService
    {
        private readonly IMapper _mapper;
        private readonly IMongoRepository<BCFormTemplate> _repository;
        public BCFormTemplateService(IMongoRepository<BCFormTemplate> repository, IMapper mapper) : base(repository)
        {
            _mapper = mapper;
            _repository = repository;
        }

        public async Task<BCFormTemplate> CreateFormTemplate(BCFormTemplateRequest request)
        {
            if (GetQueryable().Any(x => x.IdBaoCao == request.IdBaoCao))
            {
                throw new Exception("Mỗi báo cáo chỉ có 1 form");
            }
            var entity = _mapper.Map<BCFormTemplateRequest, BCFormTemplate>(request);
            entity.ThanhPhanForms ??= new List<BCThanhPhanForm>();


            if (!string.IsNullOrEmpty(entity.TemplateFilePath))
            {
                var htmlContent = DocumentContentExtractor.ExtractContent(entity.TemplateFilePath);
                // Kiểm tra xem việc đọc file có thành công không (không trả về lỗi)
                if (!string.IsNullOrEmpty(htmlContent) && !htmlContent.StartsWith("<p>Lỗi") && !htmlContent.StartsWith("<p>Không tìm thấy"))
                {
                    // Lấy thành phần form đầu tiên, nếu chưa có thì tạo mới
                    var mainThanhPhan = entity.ThanhPhanForms.FirstOrDefault();
                    if (mainThanhPhan == null)
                    {
                        mainThanhPhan = new BCThanhPhanForm
                        {
                            IdThanhPhan = 1,
                            Name = "Thành phần nội dung chính",
                            OrderNumber = 1,
                            Inputs = new List<BCInputConfig>()
                        };
                        entity.ThanhPhanForms.Add(mainThanhPhan);
                    }

                    // Gán HTML Content vào đúng class chứa nó
                    mainThanhPhan.HtmlContent = htmlContent;

                    // 3. Tự động bóc tách các biến [[key]] để khởi tạo InputConfig
                    var extractedKeys = DocumentContentExtractor.ExtractFieldKeys(htmlContent);
                    if (extractedKeys != null && extractedKeys.Any())
                    {
                        mainThanhPhan.Inputs ??= new List<BCInputConfig>();

                        foreach (var key in extractedKeys)
                        {
                            // Tránh ghi đè nếu client đã gửi cấu hình cho key này rồi
                            if (!mainThanhPhan.Inputs.Any(x => x.InputKey == key))
                            {
                                mainThanhPhan.Inputs.Add(new BCInputConfig
                                {
                                    InputKey = key,
                                    DisplayName = key, // Lấy key làm tên hiển thị tạm thời
                                    DataType = "TEXT", // Mặc định là chuỗi text
                                    Required = false,   
                                    IsCombobox = false
                                });
                            }
                        }
                    }
                }
            }



            await CreateAsync(entity);
            return entity;
        }

        public async Task<MongoPagedList<BCFormTemplateDto>> GetData(BCFormTemplateSearch search)
        {
            try
            {
                var query = from q in GetQueryable()
                            select new BCFormTemplateDto
                            {
                                Id = q.Id,
                                CreatedBy = q.CreatedBy,
                                CreatedDate = q.CreatedDate,
                                CreatedId = q.CreatedId,
                                DoiTuongTypes = q.DoiTuongTypes,
                                HuongTrang = q.HuongTrang,
                                Name = q.Name,
                                TemplateFilePath = q.TemplateFilePath,
                                IdBaoCao = q.IdBaoCao,
                                ItemId = q.ItemId
                            };
                if(search != null)
                {
                    if(search.IdBaoCao != null)
                    {
                        query = query.Where(e => e.IdBaoCao == search.IdBaoCao);
                    }
                    if (!string.IsNullOrEmpty(search.Name))
                    {
                        query = query.Where(x => Regex.IsMatch(x.Name, search.Name, RegexOptions.IgnoreCase));
                    }
                }
                query = query.OrderByDescending(e => e.CreatedDate);
                var data = await MongoPagedList<BCFormTemplateDto>.CreateAsync(query, search);
                return data;
            }
            catch (Exception e)
            {
                throw;
            }

        }

        public async Task<BCFormTemplateDto> GetDto(string id)
        {
            var query = await GetQueryable().Where(e => e.Id == id).Select(q => new BCFormTemplateDto
            {
                Id = q.Id,
                CreatedBy = q.CreatedBy,
                CreatedDate = q.CreatedDate,
                CreatedId = q.CreatedId,
                DoiTuongTypes = q.DoiTuongTypes,
                ItemId = q.ItemId,
                HuongTrang = q.HuongTrang,
                Name = q.Name,
                TemplateFilePath = q.TemplateFilePath,
                ThanhPhanForms = q.ThanhPhanForms,
                IdBaoCao = q.IdBaoCao,
                

            }).FirstOrDefaultAsync();
            return query;
        }

        public async Task UpdateDropdownInput(UpdateInputDropdownRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.InputKey))
            {
                throw new ArgumentException("Dữ liệu cấu hình Dropdown không hợp lệ.");
            }

            // 1. Bộ lọc tìm đúng Biểu mẫu và đúng Thành phần Form
            var filter = Builders<BCFormTemplate>.Filter.And(
                Builders<BCFormTemplate>.Filter.Eq(x => x.Id, request.Id),
                Builders<BCFormTemplate>.Filter.Eq("ThanhPhanForms.IdThanhPhan", request.IdThanhPhan)
            );

            // 2. Cấu hình các trường cơ bản cần set
            var update = Builders<BCFormTemplate>.Update
                .Set("ThanhPhanForms.$.Inputs.$[inp].DisplayName", request.DisplayName)
                .Set("ThanhPhanForms.$.Inputs.$[inp].DataType", request.DataType)
                .Set("ThanhPhanForms.$.Inputs.$[inp].Required", request.Required)
                .Set("ThanhPhanForms.$.Inputs.$[inp].PlaceHolder", request.PlaceHolder)
                .Set("ThanhPhanForms.$.Inputs.$[inp].IsCombobox", request.IsCombobox);

            // 3. Logic dọn dẹp dữ liệu thừa khi chọn chế độ hiển thị Dropdown
            if (!string.IsNullOrEmpty(request.GlobalCategoryCode))
            {
                // Chế độ A: Dùng danh mục dùng chung toàn hệ thống
                update = update
                    .Set("ThanhPhanForms.$.Inputs.$[inp].GlobalCategoryCode", request.GlobalCategoryCode)
                    // Ép kiểu null trực tiếp ở phần Value
                    .Set("ThanhPhanForms.$.Inputs.$[inp].LocalOptions", (List<BCCategoryItem>?)null);
            }
            else
            {
                // Chế độ B: Nhập thủ công cục bộ cho riêng Form này
                var entityOptions = (request.LocalOptions) ?? new List<BCCategoryItem>();

                update = update
                    .Set("ThanhPhanForms.$.Inputs.$[inp].LocalOptions", entityOptions)
                    // Ép kiểu null trực tiếp ở phần Value
                    .Set("ThanhPhanForms.$.Inputs.$[inp].GlobalCategoryCode", (string?)null);
            }

            // 4. Định nghĩa ArrayFilters trỏ trúng vào InputKey mục tiêu
            var options = new UpdateOptions
            {
                ArrayFilters = new List<ArrayFilterDefinition>{new BsonDocumentArrayFilterDefinition<BCFormTemplate>(new BsonDocument("inp.InputKey", request.InputKey))}
            };

    // 5. Ghi trực tiếp xuống MongoDB gốc thông qua Repository đã mở rộng
    var result = await _repository.Collection().UpdateOneAsync(filter, update, options);

            if (result.MatchedCount == 0)
            {
                throw new Exception("Không tìm thấy cấu hình trường thông tin hoặc biểu mẫu tương ứng.");
            }
        }

        public async Task<BCFormTemplate> UpdateFormTemplate(BCFormTemplateRequest request)
        {
            var entity = await GetByIdAsync(request.Id) ?? throw new Exception("Không tồn tại");
            bool isUpdateFile = entity.TemplateFilePath != request.TemplateFilePath;
            _mapper.Map(request,entity);
            entity.ThanhPhanForms ??= new List<BCThanhPhanForm>();


            if(isUpdateFile)
            {
                if (!string.IsNullOrEmpty(entity.TemplateFilePath))
                {
                    var htmlContent = DocumentContentExtractor.ExtractContent(entity.TemplateFilePath);
                    // Kiểm tra xem việc đọc file có thành công không (không trả về lỗi)
                    if (!string.IsNullOrEmpty(htmlContent) && !htmlContent.StartsWith("<p>Lỗi") && !htmlContent.StartsWith("<p>Không tìm thấy"))
                    {
                        // Lấy thành phần form đầu tiên, nếu chưa có thì tạo mới
                        var mainThanhPhan = entity.ThanhPhanForms.FirstOrDefault();
                        if (mainThanhPhan == null)
                        {
                            mainThanhPhan = new BCThanhPhanForm
                            {
                                IdThanhPhan = 1,
                                Name = "Thành phần nội dung chính",
                                OrderNumber = 1,
                                Inputs = new List<BCInputConfig>()
                            };
                            entity.ThanhPhanForms.Add(mainThanhPhan);
                        }

                        // Gán HTML Content vào đúng class chứa nó
                        mainThanhPhan.HtmlContent = htmlContent;

                        // 3. Tự động bóc tách các biến [[key]] để khởi tạo InputConfig
                        var extractedKeys = DocumentContentExtractor.ExtractFieldKeys(htmlContent);
                        if (extractedKeys != null && extractedKeys.Any())
                        {
                            mainThanhPhan.Inputs ??= new List<BCInputConfig>();

                            foreach (var key in extractedKeys)
                            {
                                // Tránh ghi đè nếu client đã gửi cấu hình cho key này rồi
                                if (!mainThanhPhan.Inputs.Any(x => x.InputKey == key))
                                {
                                    mainThanhPhan.Inputs.Add(new BCInputConfig
                                    {
                                        InputKey = key,
                                        DisplayName = key, // Lấy key làm tên hiển thị tạm thời
                                        DataType = "TEXT", // Mặc định là chuỗi text
                                        Required = false,
                                        IsCombobox = false
                                    });
                                }
                            }
                        }
                    }
                }

            }
            await UpdateAsync(entity);
            return entity;
        }

        public async Task<bool> UpdateInputsAsync(UpdateFormInputsRequest request)
        {
            // Định vị chính xác bản ghi và mảng con cần sửa
            var filter = Builders<BCFormTemplate>.Filter.And(
                Builders<BCFormTemplate>.Filter.Eq(x => x.Id, request.Id),
                Builders<BCFormTemplate>.Filter.Eq("ThanhPhanForms.IdThanhPhan", request.IdThanhPhan)
            );

            // Dùng toán tử $ để chỉ thay thế duy nhất trường Inputs, giữ nguyên htmlContent và các trường khác
            var update = Builders<BCFormTemplate>.Update.Set("ThanhPhanForms.$.Inputs", request.Inputs);

            // Chạy lệnh update trực tiếp xuống database thông qua Collection gốc của Repository
            var result = await _repository.Collection().UpdateOneAsync(filter, update);

            return result.MatchedCount > 0;

        }
    }
}
