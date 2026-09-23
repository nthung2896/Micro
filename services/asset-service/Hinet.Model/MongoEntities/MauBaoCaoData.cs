using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Hinet.Model.MongoEntities.Common;
using System;
using System.Collections.Generic;

namespace Hinet.Model.MongoEntities
{
    public class MauBaoCaoData : MEntity
    {
        [BsonRepresentation(BsonType.String)]
        public Guid MauBaoCaoId { get; set; }

        // ID của doanh nghiệp khai báo (CompanyInfo.Id)
        [BsonRepresentation(BsonType.String)]
        public Guid? CompanyId { get; set; }

        // ID của nền tảng thương mại điện tử cụ thể (PlatformManage.Id)
        [BsonRepresentation(BsonType.String)]
        public Guid? PlatformId { get; set; }

        // ID của hợp đồng chứng thực HĐĐT (AuthenticationContract.Id)
        [BsonRepresentation(BsonType.String)]
        public Guid? ContractId { get; set; }

        public int ThangBaoCao { get; set; }
        public int NamBaoCao { get; set; }
        public string? KyBaoCao { get; set; } // HANG_THANG, HANG_QUY, HANG_NAM

        // Trạng thái báo cáo: "DRAFT" (Lưu nháp), "SUBMITTED" (Đã nộp)
        public string Status { get; set; } = "DRAFT";

        // Đánh dấu chuyên viên/lãnh đạo đã xem báo cáo chưa (Nếu đã xem thì khóa không cho doanh nghiệp sửa)
        public bool IsViewed { get; set; } = false;
        public DateTime? ViewedDate { get; set; }

        // Lưu trữ các giá trị của form dưới dạng Key-Value (ví dụ: "{{TenDN}}": "Công ty A")
        public Dictionary<string, string> Values { get; set; } = new Dictionary<string, string>();

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public string? CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedBy { get; set; }
    }
}
