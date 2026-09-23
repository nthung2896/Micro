using Hinet.Model.MongoEntities.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Hinet.Model.MongoEntities
{
    public class BCSubmissionData : MAuditableEntity<ObjectId>
    {
        public string BaoCaoDoiTuongId { get; set; } // Khóa ngoại trỏ ngược về Postgres (string GUID)

        public string? FormTemplateId { get; set; }
        public int ThangBaoCao { get; set; }
        public int NamBaoCao { get; set; }
        public string? Status { get; set; } // DRAFT, SUBMITTED, APPROVED...

        public List<BCSubmissionValueItem> DataValues { get; set; } = new List<BCSubmissionValueItem>();

        public List<SubmissionHistoryLog> History { get; set; } = new List<SubmissionHistoryLog>();
    }

    public class BCSubmissionValueItem
    {
        public string Type { get; set; } // "FLAT" hoặc "GRID"
        public int? ComponentId { get; set; }
        public string? RowKey { get; set; }
        public string ColKey { get; set; }

        [JsonConverter(typeof(AnyToStringConverter))]
        public string? Value { get; set; } // Chấp nhận số/string/null từ JSON, lưu dạng string
    }

    public class SubmissionHistoryLog
    {
        public DateTime ChangedAt { get; set; } = DateTime.Now;
        public string ChangedBy { get; set; }
        public string ChangedID { get; set; }
        public List<BCSubmissionValueItem> OldValues { get; set; }
    }

    /// <summary>
    /// Cho phép Value nhận bất kỳ kiểu JSON nào (số, string, bool, null) và chuyển về string
    /// </summary>
    public class AnyToStringConverter : JsonConverter<string?>
    {
        public override string? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return reader.TokenType switch
            {
                JsonTokenType.Null => null,
                JsonTokenType.String => reader.GetString(),
                JsonTokenType.Number => reader.TryGetInt64(out var l) ? l.ToString() : reader.GetDouble().ToString(),
                JsonTokenType.True => "true",
                JsonTokenType.False => "false",
                _ => reader.GetString()
            };
        }

        public override void Write(Utf8JsonWriter writer, string? value, JsonSerializerOptions options)
        {
            if (value == null) writer.WriteNullValue();
            else writer.WriteStringValue(value);
        }
    }
}
