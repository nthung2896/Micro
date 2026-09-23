using Hinet.Model;
using Hinet.Model.MongoEntities;
using Hinet.Repository.Common;
using OfficeOpenXml;
using Hinet.Service.BCFormTemplateService;
using Hinet.Service.BCSubmissionDataService.Request;
using Hinet.Service.Common.Service;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using MongoDbGenericRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Hinet.Service.BCSubmissionDataService.Dto;
using OfficeOpenXml.Style;
using System.Drawing;

namespace Hinet.Service.BCSubmissionDataService
{
    public class BCSubmissionDataService : MongoService<BCSubmissionData>,IBCSubmissionDataService
    {
        private readonly HinetMongoContext _mongoContext;
        private readonly IMongoCollection<BCSubmissionData> _collection;
        private readonly IBCFormTemplateMongoService _templateService;

        public BCSubmissionDataService(IMongoRepository<BCSubmissionData> repository,
            HinetMongoContext hinetMongoContext,
            IBCFormTemplateMongoService templateService) : base(repository)
        {
            _collection = hinetMongoContext.GetCollection<BCSubmissionData>();
            _mongoContext = hinetMongoContext;
            _templateService = templateService;
        }

        public async Task<BCSubmissionData?> GetByBaoCaoDoiTuongIdAsync(string baoCaoDoiTuongId)
        {
            var filter = Builders<BCSubmissionData>.Filter.Eq(x => x.BaoCaoDoiTuongId, baoCaoDoiTuongId);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<BCFormTemplate?> GetTemplateSchemaAsync(string mongoFormTemplateId)
        {
            return await _templateService.GetByIdAsync(mongoFormTemplateId);
        }

        public async Task<BCSubmissionData> LayGiaTriRongMacDinhAsync(string baoCaoDoiTuongId, string? mongoFormTemplateId = null, int? thang = null, int? nam = null)
        {
            // Kiểm tra xem đã nộp chưa
            BCSubmissionData? existing = null;
            if (thang.HasValue || nam.HasValue)
            {
                existing = await GetByBaoCaoDoiTuongAndFormTemplate(baoCaoDoiTuongId, mongoFormTemplateId, thang, nam);
            }
            else
            {
                existing = await GetByBaoCaoDoiTuongIdAsync(baoCaoDoiTuongId);
            }

            if (existing != null)
            {
                return existing;
            }

            var defaultValues = new List<BCSubmissionValueItem>();

            // Nếu có TemplateId, ta sinh dữ liệu mặc định từ Template
            if (!string.IsNullOrEmpty(mongoFormTemplateId))
            {
                var template = await _templateService.GetByIdAsync(mongoFormTemplateId);
                if (template != null)
                {
                    foreach (var component in template.ThanhPhanForms)
                    {
                        if (component.ComponentType == "GRID")
                        {
                            var rows = new List<BCCategoryItem>();
                            if (!string.IsNullOrEmpty(component.GridDataSourceCategory))
                            {
                                var categoryCollection = _mongoContext.GetCollection<BCCategory>();
                                var category = await categoryCollection.Find(x => x.CategoryCode == component.GridDataSourceCategory).FirstOrDefaultAsync();
                                if (category != null && category.Items != null && category.Items.Any())
                                {
                                    rows = category.Items;
                                }
                            }

                            if (!rows.Any())
                            {
                                rows = component.GridRows ?? new List<BCCategoryItem>();
                            }

                            if (!rows.Any())
                            {
                                if (component.GridDataSourceCategory == "DM_TINH")
                                {
                                    rows = GetDefaultProvincesCategory();
                                }
                                else if (component.GridDataSourceCategory == "DM_NGANH_HANG")
                                {
                                    rows = GetDefaultCategoriesCategory();
                                }
                            }

                            foreach (var row in rows)
                            {
                                foreach (var input in component.Inputs)
                                {
                                    defaultValues.Add(new BCSubmissionValueItem
                                    {
                                        Type = "GRID",
                                        ComponentId = component.IdThanhPhan,
                                        RowKey = row.Text, // Dùng Text (Tiếng Việt)
                                        ColKey = input.InputKey,
                                        Value = "0"
                                    });
                                }
                            }
                        }
                        else
                        {
                            foreach (var input in component.Inputs)
                            {
                                defaultValues.Add(new BCSubmissionValueItem
                                {
                                    Type = "FLAT",
                                    ComponentId = component.IdThanhPhan,
                                    RowKey = null,
                                    ColKey = input.InputKey,
                                    Value = ""
                                });
                            }
                        }
                    }

                    // Đảm bảo có thangBaoCao và namBaoCao trong dataValues của đối tượng rỗng
                    var thangItem = defaultValues.FirstOrDefault(x => x.ColKey.Equals("thangBaoCao", StringComparison.OrdinalIgnoreCase));
                    if (thangItem != null)
                    {
                        thangItem.Value = (thang ?? DateTime.Now.Month).ToString();
                    }
                    else
                    {
                        defaultValues.Add(new BCSubmissionValueItem { Type = "FLAT", ColKey = "thangBaoCao", Value = (thang ?? DateTime.Now.Month).ToString() });
                    }

                    var namItem = defaultValues.FirstOrDefault(x => x.ColKey.Equals("namBaoCao", StringComparison.OrdinalIgnoreCase));
                    if (namItem != null)
                    {
                        namItem.Value = (nam ?? DateTime.Now.Year).ToString();
                    }
                    else
                    {
                        defaultValues.Add(new BCSubmissionValueItem { Type = "FLAT", ColKey = "namBaoCao", Value = (nam ?? DateTime.Now.Year).ToString() });
                    }

                    return new BCSubmissionData
                    {
                        BaoCaoDoiTuongId = baoCaoDoiTuongId,
                        FormTemplateId = mongoFormTemplateId,
                        ThangBaoCao = thang ?? DateTime.Now.Month,
                        NamBaoCao = nam ?? DateTime.Now.Year,
                        DataValues = defaultValues,
                        History = new List<SubmissionHistoryLog>()
                    };
                }
            }

            // Fallback nếu không tìm thấy template
            var fallbackValues = GetLegacyDefaultValuesList();
            var fallbackThang = fallbackValues.FirstOrDefault(x => x.ColKey.Equals("thangBaoCao", StringComparison.OrdinalIgnoreCase));
            if (fallbackThang != null)
            {
                fallbackThang.Value = (thang ?? DateTime.Now.Month).ToString();
            }
            else
            {
                fallbackValues.Add(new BCSubmissionValueItem { Type = "FLAT", ColKey = "thangBaoCao", Value = (thang ?? DateTime.Now.Month).ToString() });
            }

            var fallbackNam = fallbackValues.FirstOrDefault(x => x.ColKey.Equals("namBaoCao", StringComparison.OrdinalIgnoreCase));
            if (fallbackNam != null)
            {
                fallbackNam.Value = (nam ?? DateTime.Now.Year).ToString();
            }
            else
            {
                fallbackValues.Add(new BCSubmissionValueItem { Type = "FLAT", ColKey = "namBaoCao", Value = (nam ?? DateTime.Now.Year).ToString() });
            }

            return new BCSubmissionData
            {
                BaoCaoDoiTuongId = baoCaoDoiTuongId,
                FormTemplateId = mongoFormTemplateId,
                ThangBaoCao = thang ?? DateTime.Now.Month,
                NamBaoCao = nam ?? DateTime.Now.Year,
                DataValues = fallbackValues,
                History = new List<SubmissionHistoryLog>()
            };
        }

        private List<BCCategoryItem> GetDefaultProvincesCategory()
        {
            return new List<BCCategoryItem>
            {
                new BCCategoryItem { Text = "TP. Hà Nội", Value = "HN" },
                new BCCategoryItem { Text = "TP. Hồ Chí Minh", Value = "HCM" },
                new BCCategoryItem { Text = "TP. Hải Phòng", Value = "HP" },
                new BCCategoryItem { Text = "TP. Đà Nẵng", Value = "DN" },
                new BCCategoryItem { Text = "TP. Cần Thơ", Value = "CT" }
            };
        }

        private List<BCCategoryItem> GetDefaultCategoriesCategory()
        {
            return new List<BCCategoryItem>
            {
                new BCCategoryItem { Text = "Đồ điện tử", Value = "1" },
                new BCCategoryItem { Text = "Làm đẹp & Sức khỏe", Value = "2" },
                new BCCategoryItem { Text = "Thời trang", Value = "3" }
            };
        }

        private List<BCSubmissionValueItem> GetLegacyDefaultValuesList()
        {
            var list = new List<BCSubmissionValueItem>();
            // FLAT fields
            list.Add(new BCSubmissionValueItem { Type = "FLAT", ColKey = "nguoiDien", Value = "" });
            list.Add(new BCSubmissionValueItem { Type = "FLAT", ColKey = "chucVu", Value = "" });
            list.Add(new BCSubmissionValueItem { Type = "FLAT", ColKey = "soDienThoai", Value = "" });
            list.Add(new BCSubmissionValueItem { Type = "FLAT", ColKey = "khoKhan", Value = "" });
            list.Add(new BCSubmissionValueItem { Type = "FLAT", ColKey = "nguyenNhan", Value = "" });
            list.Add(new BCSubmissionValueItem { Type = "FLAT", ColKey = "deXuat", Value = "" });

            // Province grid
            foreach (var prov in GetDefaultProvincesCategory())
            {
                list.Add(new BCSubmissionValueItem { Type = "GRID", RowKey = prov.Text, ColKey = "nguoiBan", Value = "0" });
                list.Add(new BCSubmissionValueItem { Type = "GRID", RowKey = prov.Text, ColKey = "nguoiMua", Value = "0" });
                list.Add(new BCSubmissionValueItem { Type = "GRID", RowKey = prov.Text, ColKey = "tongDonHangDaBan", Value = "0" });
                list.Add(new BCSubmissionValueItem { Type = "GRID", RowKey = prov.Text, ColKey = "tongGiaTriDonHang", Value = "0" });
                list.Add(new BCSubmissionValueItem { Type = "GRID", RowKey = prov.Text, ColKey = "tongChiPhi", Value = "0" });
            }

            // Category grid
            foreach (var cat in GetDefaultCategoriesCategory())
            {
                list.Add(new BCSubmissionValueItem { Type = "GRID", RowKey = cat.Text, ColKey = "tongDonThanhCong", Value = "0" });
                list.Add(new BCSubmissionValueItem { Type = "GRID", RowKey = cat.Text, ColKey = "tongGiaTriGiaoDich", Value = "0" });
            }

            return list;
        }

        public async Task LuuKhaiBaoAsync(string baoCaoDoiTuongId,string? formTemplateId,  List<BCSubmissionValueItem> submittedValues, string username, string userId, string? status = null)
        {
            var thangVal = submittedValues.FirstOrDefault(x => x.ColKey == "thangBaoCao" || x.ColKey == "ThangBaoCao")?.Value;
            var namVal = submittedValues.FirstOrDefault(x => x.ColKey == "namBaoCao" || x.ColKey == "NamBaoCao")?.Value;


            int thang = DateTime.Now.Month;
            int nam = DateTime.Now.Year;

            if (thangVal != null) int.TryParse(thangVal.ToString(), out thang);
            if (namVal != null) int.TryParse(namVal.ToString(), out nam);

            var filter = Builders<BCSubmissionData>.Filter.And(
                Builders<BCSubmissionData>.Filter.Eq(x => x.BaoCaoDoiTuongId, baoCaoDoiTuongId),
                Builders<BCSubmissionData>.Filter.Eq(x => x.FormTemplateId, formTemplateId),
                Builders<BCSubmissionData>.Filter.Eq(x => x.ThangBaoCao, thang),
                Builders<BCSubmissionData>.Filter.Eq(x => x.NamBaoCao, nam)
            );
            var existing = await _collection.Find(filter).FirstOrDefaultAsync();

            // Xử lý chuyển đổi kiểu dữ liệu số - giữ nguyên dạng string
            foreach (var item in submittedValues)
            {
                if (item.Value != null)
                {
                    // Value đã là string, không cần convert thêm
                }
            }

            if (existing == null)
            {
                var newSub = new BCSubmissionData
                {
                    BaoCaoDoiTuongId = baoCaoDoiTuongId,
                    FormTemplateId = formTemplateId,
                    ThangBaoCao = thang,
                    NamBaoCao = nam,
                    Status = status,
                    DataValues = submittedValues,
                    History = new List<SubmissionHistoryLog>()
                };

                newSub.CreatedDate = DateTime.Now;
                newSub.CreatedBy = username;
                newSub.CreatedId = userId;
                newSub.UpdatedDate = DateTime.Now;
                newSub.UpdatedBy = username;
                newSub.UpdatedId = userId;

                await _collection.InsertOneAsync(newSub);
            }
            else
            {
                existing.History.Add(new SubmissionHistoryLog
                {
                    ChangedAt = DateTime.Now,
                    ChangedBy = username,
                    ChangedID = userId,
                    OldValues = existing.DataValues
                });
                existing.FormTemplateId = formTemplateId;
                existing.ThangBaoCao = thang;
                existing.NamBaoCao = nam;
                existing.DataValues = submittedValues;
                existing.Status = status;
                existing.UpdatedDate = DateTime.Now;
                existing.UpdatedBy = username;
                existing.UpdatedId = userId;

                await _collection.ReplaceOneAsync(filter, existing);
            }
        }

        public async Task<List<TongHopTinhThanhDto>> ThongKeTheoTinhThanhAsync(int thang, int nam)
        {
            var pipeline = new BsonDocument[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "namBaoCao", nam },
                    { "thangBaoCao", thang }
                }),
                new BsonDocument("$unwind", "$dataValues"),
                new BsonDocument("$match", new BsonDocument
                {
                    { "dataValues.type", "GRID" }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$dataValues.rowKey" },
                    { "tongNguoiBan", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$dataValues.colKey", "nguoiBan" }),
                            "$dataValues.value",
                            0
                        }))
                    },
                    { "tongNguoiMua", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$dataValues.colKey", "nguoiMua" }),
                            "$dataValues.value",
                            0
                        }))
                    },
                    { "tongDonHang", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$dataValues.colKey", "tongDonHangDaBan" }),
                            "$dataValues.value",
                            0
                        }))
                    },
                    { "tongDoanhThu", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$dataValues.colKey", "tongGiaTriDonHang" }),
                            "$dataValues.value",
                            0
                        }))
                    },
                    { "tongChiPhi", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$dataValues.colKey", "tongChiPhi" }),
                            "$dataValues.value",
                            0
                        }))
                    }
                })
            };

            var aggregationResult = await _collection.Aggregate<BsonDocument>(pipeline).ToListAsync();

            return aggregationResult.Select(doc => {
                var tinhThanhName = doc["_id"].BsonType == BsonType.Null ? "" : doc["_id"].AsString;
                
                var code = "";
                if (tinhThanhName.Contains("Hà Nội")) code = "HN";
                else if (tinhThanhName.Contains("Hồ Chí Minh")) code = "HCM";
                else if (tinhThanhName.Contains("Hải Phòng")) code = "HP";
                else if (tinhThanhName.Contains("Đà Nẵng")) code = "DN";
                else if (tinhThanhName.Contains("Cần Thơ")) code = "CT";
                else code = tinhThanhName;

                return new TongHopTinhThanhDto
                {
                    TinhThanhCode = code,
                    TinhThanhName = tinhThanhName,
                    TongNguoiBan = doc["tongNguoiBan"].ToInt64(),
                    TongNguoiMua = doc["tongNguoiMua"].ToInt64(),
                    TongDonHang = doc["tongDonHang"].ToInt64(),
                    TongDoanhThu = Convert.ToDecimal(doc["tongDoanhThu"].ToDouble()),
                    TongChiPhi = Convert.ToDecimal(doc["tongChiPhi"].ToDouble())
                };
            }).ToList();
        }

        public async Task<List<TongHopNganhHangDto>> ThongKeTheoNganhHangAsync(int thang, int nam)
        {
            var pipeline = new BsonDocument[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "namBaoCao", nam },
                    { "thangBaoCao", thang }
                }),
                new BsonDocument("$unwind", "$dataValues"),
                new BsonDocument("$match", new BsonDocument
                {
                    { "dataValues.type", "GRID" }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$dataValues.rowKey" },
                    { "tongDonThanhCong", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$dataValues.colKey", "tongDonThanhCong" }),
                            "$dataValues.value",
                            0
                        }))
                    },
                    { "tongGiaTriGiaoDich", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$dataValues.colKey", "tongGiaTriGiaoDich" }),
                            "$dataValues.value",
                            0
                        }))
                    }
                })
            };

            var aggregationResult = await _collection.Aggregate<BsonDocument>(pipeline).ToListAsync();

            return aggregationResult.Select(doc => {
                var nganhHangName = doc["_id"].BsonType == BsonType.Null ? "" : doc["_id"].AsString;
                
                var id = 0;
                if (nganhHangName.Contains("điện tử")) id = 1;
                else if (nganhHangName.Contains("Làm đẹp")) id = 2;
                else if (nganhHangName.Contains("Thời trang")) id = 3;

                return new TongHopNganhHangDto
                {
                    NganhHangId = id,
                    NganhHangName = nganhHangName,
                    TongDonThanhCong = doc["tongDonThanhCong"].ToInt64(),
                    TongGiaTriGiaoDich = Convert.ToDecimal(doc["tongGiaTriGiaoDich"].ToDouble())
                };
            }).ToList();
        }

        public async Task<List<TongHopTinhThanhDto>> ThongKeTheoTinhThanhNamAsync(int nam)
        {
            var pipeline = new BsonDocument[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "namBaoCao", nam }
                }),
                new BsonDocument("$unwind", "$dataValues"),
                new BsonDocument("$match", new BsonDocument
                {
                    { "dataValues.type", "GRID" }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$dataValues.rowKey" },
                    { "tongNguoiBan", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$dataValues.colKey", "nguoiBan" }),
                            "$dataValues.value",
                            0
                        }))
                    },
                    { "tongNguoiMua", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$dataValues.colKey", "nguoiMua" }),
                            "$dataValues.value",
                            0
                        }))
                    },
                    { "tongDonHang", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$dataValues.colKey", "tongDonHangDaBan" }),
                            "$dataValues.value",
                            0
                        }))
                    },
                    { "tongDoanhThu", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$dataValues.colKey", "tongGiaTriDonHang" }),
                            "$dataValues.value",
                            0
                        }))
                    },
                    { "tongChiPhi", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$dataValues.colKey", "tongChiPhi" }),
                            "$dataValues.value",
                            0
                        }))
                    }
                })
            };

            var aggregationResult = await _collection.Aggregate<BsonDocument>(pipeline).ToListAsync();

            return aggregationResult.Select(doc => {
                var tinhThanhName = doc["_id"].BsonType == BsonType.Null ? "" : doc["_id"].AsString;
                
                var code = "";
                if (tinhThanhName.Contains("Hà Nội")) code = "HN";
                else if (tinhThanhName.Contains("Hồ Chí Minh")) code = "HCM";
                else if (tinhThanhName.Contains("Hải Phòng")) code = "HP";
                else if (tinhThanhName.Contains("Đà Nẵng")) code = "DN";
                else if (tinhThanhName.Contains("Cần Thơ")) code = "CT";
                else code = tinhThanhName;

                return new TongHopTinhThanhDto
                {
                    TinhThanhCode = code,
                    TinhThanhName = tinhThanhName,
                    TongNguoiBan = doc["tongNguoiBan"].ToInt64(),
                    TongNguoiMua = doc["tongNguoiMua"].ToInt64(),
                    TongDonHang = doc["tongDonHang"].ToInt64(),
                    TongDoanhThu = Convert.ToDecimal(doc["tongDoanhThu"].ToDouble()),
                    TongChiPhi = Convert.ToDecimal(doc["tongChiPhi"].ToDouble())
                };
            }).ToList();
        }

        public async Task<List<TongHopNganhHangDto>> ThongKeTheoNganhHangNamAsync(int nam)
        {
            var pipeline = new BsonDocument[]
            {
                new BsonDocument("$match", new BsonDocument
                {
                    { "namBaoCao", nam }
                }),
                new BsonDocument("$unwind", "$dataValues"),
                new BsonDocument("$match", new BsonDocument
                {
                    { "dataValues.type", "GRID" }
                }),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$dataValues.rowKey" },
                    { "tongDonThanhCong", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$dataValues.colKey", "tongDonThanhCong" }),
                            "$dataValues.value",
                            0
                        }))
                    },
                    { "tongGiaTriGiaoDich", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray
                        {
                            new BsonDocument("$eq", new BsonArray { "$dataValues.colKey", "tongGiaTriGiaoDich" }),
                            "$dataValues.value",
                            0
                        }))
                    }
                })
            };

            var aggregationResult = await _collection.Aggregate<BsonDocument>(pipeline).ToListAsync();

            return aggregationResult.Select(doc => {
                var nganhHangName = doc["_id"].BsonType == BsonType.Null ? "" : doc["_id"].AsString;
                
                var id = 0;
                if (nganhHangName.Contains("điện tử")) id = 1;
                else if (nganhHangName.Contains("Làm đẹp")) id = 2;
                else if (nganhHangName.Contains("Thời trang")) id = 3;

                return new TongHopNganhHangDto
                {
                    NganhHangId = id,
                    NganhHangName = nganhHangName,
                    TongDonThanhCong = doc["tongDonThanhCong"].ToInt64(),
                    TongGiaTriGiaoDich = Convert.ToDecimal(doc["tongGiaTriGiaoDich"].ToDouble())
                };
            }).ToList();
        }

        public async Task<BCSubmissionData> GetByBaoCaoDoiTuongAndFormTemplate(string baoCaoDoiTuongId, string? mongoFormTemplateId = null, int? thang = null, int? nam = null)
        {
            var queryable = GetQueryable().Where(e => e.BaoCaoDoiTuongId == baoCaoDoiTuongId
                    && e.FormTemplateId == mongoFormTemplateId);

            if (thang.HasValue) queryable = queryable.Where(x => x.ThangBaoCao == thang.Value);
            if (nam.HasValue) queryable = queryable.Where(x => x.NamBaoCao == nam.Value);

            var query = await queryable
                .OrderByDescending(e => e.NamBaoCao).ThenByDescending(e => e.ThangBaoCao) // Lấy bản mới nhất nếu không chỉ định tháng
                .Select(e => new BCSubmissionData
                {
                    FormTemplateId = mongoFormTemplateId,
                    BaoCaoDoiTuongId = e.BaoCaoDoiTuongId,
                    CreatedBy = e.CreatedBy,
                    CreatedDate = e.CreatedDate,
                    CreatedId = e.CreatedId,
                    DataValues = e.DataValues,
                    DeletedId = e.DeletedId,
                    DeleteTime = e.DeleteTime,
                    History = e.History,
                    NamBaoCao = e.NamBaoCao,
                    Id = e.Id,
                    ThangBaoCao = e.ThangBaoCao
                })
                .FirstOrDefaultAsync();
            return query;
        }

        public async Task<BCSubmissionData> GetFormTemplate(string id)
        {
            var query = await GetByIdAsync(id);     
            return query;
        }

        public async Task<List<BCSubmissionData>> GetListSubmissionByBaoCaoDoiTuong(Guid baoCaoDoiTuongId)
        {
            var filter = Builders<BCSubmissionData>.Filter.And(
                Builders<BCSubmissionData>.Filter.Eq(x => x.BaoCaoDoiTuongId, baoCaoDoiTuongId.ToString()),
                Builders<BCSubmissionData>.Filter.Ne(x => x.Status, "DRAFT")
            );
            return await _collection.Find(filter)
                .Project<BCSubmissionData>(Builders<BCSubmissionData>.Projection
                    .Include(x => x.ThangBaoCao)
                    .Include(x => x.NamBaoCao)
                    .Include(x => x.CreatedDate)
                    .Include(x => x.UpdatedDate)
                    .Include(x => x.FormTemplateId)
                    .Include(x => x.Status)
                    .Include(x => x.BaoCaoDoiTuongId)
                )
                .SortByDescending(x => x.NamBaoCao)
                .ThenByDescending(x => x.ThangBaoCao)
                .ToListAsync();
        }

        public async Task<List<BCSubmissionData>> GetListSubmissionsWithData(List<string>? listBaoCaoDoiTuongId, int? thang, int? nam)
        {
            var builder = Builders<BCSubmissionData>.Filter;
            var filter = builder.Nin(x => x.Status, new[] { "DRAFT", "TAM_LUU" });
            if (listBaoCaoDoiTuongId != null && listBaoCaoDoiTuongId.Any())
            {
                filter &= builder.In(x => x.BaoCaoDoiTuongId, listBaoCaoDoiTuongId);
            }

            if (nam.HasValue)
            {
                filter &= builder.Eq(x => x.NamBaoCao, nam.Value);
            }

            if (thang.HasValue)
            {
                filter &= builder.Eq(x => x.ThangBaoCao, thang.Value);
            }

            return await _collection.Find(filter)
                .SortBy(x => x.NamBaoCao)
                .ThenBy(x => x.ThangBaoCao)
                .ToListAsync();
        }

        private static readonly Dictionary<string, string> KeyFriendlyNames = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            // FLAT fields
            { "nguoiDien", "Người điền thông tin" },
            { "chucVu", "Chức vụ" },
            { "soDienThoai", "Số điện thoại" },
            { "khoKhan", "Khó khăn, vướng mắc" },
            { "nguyenNhan", "Nguyên nhân" },
            { "deXuat", "Kiến nghị, đề xuất" },
            { "namBaoCao", "Năm báo cáo" },

            // GRID / general fields
            { "nguoiBan", "Số lượng người bán" },
            { "nguoiMua", "Số lượng người mua" },
            { "tongDonHangDaBan", "Tổng số đơn hàng đã bán" },
            { "tongGiaTriDonHang", "Tổng giá trị đơn hàng (VND)" },
            { "tongChiPhi", "Tổng chi phí" },
            { "tongDonThanhCong", "Tổng số đơn thành công" },
            { "tongGiaTriGiaoDich", "Tổng giá trị giao dịch (VND)" }
        };

        private static string GetFriendlyName(string keyName)
        {
            if (string.IsNullOrEmpty(keyName)) return "";
            if (KeyFriendlyNames.TryGetValue(keyName, out var friendlyName))
            {
                return friendlyName;
            }

            var formatted = keyName.Replace("_", " ");
            if (formatted.Any(char.IsLower))
            {
                formatted = System.Text.RegularExpressions.Regex.Replace(formatted, "([A-Z])", " $1").Trim();
            }
            if (formatted.Length > 0)
            {
                formatted = char.ToUpper(formatted[0]) + formatted.Substring(1);
            }
            return formatted;
        }

        private static void SetCellValue(ExcelRange cell, string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                cell.Value = "";
                return;
            }

            if (double.TryParse(value, out double dVal))
            {
                cell.Value = dVal;
                if (value.Contains(".") || value.Contains(","))
                {
                    cell.Style.Numberformat.Format = "#,##0.00";
                }
                else
                {
                    cell.Style.Numberformat.Format = "#,##0";
                }
                cell.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;
            }
            else
            {
                cell.Value = value;
                cell.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Left;
            }
        }

        public byte[] ExportExcel(List<BCSubmissionDataDto> listData)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var package = new ExcelPackage();
            var ws = package.Workbook.Worksheets.Add("Report");

            // Chỉ lấy các field không thuộc Grid (RowKey rỗng)
            var uniqueColumns = listData
                .Where(x => x?.DataValues != null)
                .SelectMany(x => x.DataValues)
                .Where(x => string.IsNullOrWhiteSpace(x.RowKey))
                .GroupBy(x => x.ColKey)
                .Select(g => g.First())
                .ToList();
            bool isQuarterReport = listData.FirstOrDefault()?.LoaiKyBaoCao == "QUY";
            int col = 1;

            // Base columns
            ws.Cells[1, col++].Value = "Tên nền tảng";
            ws.Cells[1, col++].Value = "Loại nền tảng";

            // Header
            //foreach (var item in uniqueColumns)
            //{
            //    ws.Cells[1, col++].Value = GetFriendlyName(item.ColKey);
            //}
            foreach (var item in uniqueColumns)
            {
                var headerName = GetFriendlyName(item.ColKey);

                if (item.ColKey.Equals("ThangBaoCao", StringComparison.OrdinalIgnoreCase))
                {
                    headerName = isQuarterReport
                        ? "Quý báo cáo"
                        : "Tháng báo cáo";
                }

                ws.Cells[1, col++].Value = headerName;
            }
            using (var range = ws.Cells[1, 1, 1, col - 1])
            {
                range.Style.Font.Bold = true;
                range.Style.Font.Color.SetColor(Color.White);

                range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                range.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(31, 78, 121)); // Xanh đậm

                range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                range.Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
            }

            // Tăng chiều cao hàng header
            ws.Row(1).Height = 25;
            int row = 2;

            foreach (var data in listData)
            {
                col = 1;

                ws.Cells[row, col++].Value = data.TenNenTang ?? "";
                ws.Cells[row, col++].Value = data.LoaiNenTang ?? "";

                foreach (var header in uniqueColumns)
                {
                    var value = data.DataValues.FirstOrDefault(x =>
                        string.IsNullOrWhiteSpace(x.RowKey) &&
                        x.ColKey.Equals(header.ColKey, StringComparison.OrdinalIgnoreCase));

                    if (value != null)
                        SetCellValue(ws.Cells[row, col], value.Value?.ToString() ?? "");
                    col++;
                }

                row++;
            }
            using (var range = ws.Cells[1, 1, row - 1, col - 1])
            {
                range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
            }

            ws.Cells.AutoFitColumns();

            return package.GetAsByteArray();
        }
    }
}
