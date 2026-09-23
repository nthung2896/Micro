using System;
using System.Collections.Generic;
using System.Linq;

namespace Hinet.Service.Common
{
    public class AuditLogHelper
    {
        private readonly List<string> _diffs = new List<string>();

        public void CompareString(string fieldName, string? oldValue, string? newValue)
        {
            var oldVal = oldValue?.Trim() ?? "";
            var newVal = newValue?.Trim() ?? "";
            if (oldVal != newVal)
            {
                _diffs.Add($"- <b>{fieldName}</b> thay đổi từ \"{(string.IsNullOrEmpty(oldVal) ? "[Trống]" : oldVal)}\" thành \"{(string.IsNullOrEmpty(newVal) ? "[Trống]" : newVal)}\"");
            }
        }

        public void CompareDateTime(string fieldName, DateTime? oldValue, DateTime? newValue)
        {
            if (oldValue != newValue)
            {
                string oldStr = oldValue.HasValue ? oldValue.Value.ToString("dd/MM/yyyy") : "[Trống]";
                string newStr = newValue.HasValue ? newValue.Value.ToString("dd/MM/yyyy") : "[Trống]";
                _diffs.Add($"- <b>{fieldName}</b> thay đổi từ \"{oldStr}\" thành \"{newStr}\"");
            }
        }

        public void CompareMoney(string fieldName, string? oldValue, string? newValue)
        {
            var oldVal = oldValue?.Trim() ?? "";
            var newVal = newValue?.Trim() ?? "";
            if (oldVal != newVal)
            {
                string oldFormatted = FormatVND(oldVal);
                string newFormatted = FormatVND(newVal);
                _diffs.Add($"- <b>{fieldName}</b> thay đổi từ \"{oldFormatted}\" thành \"{newFormatted}\"");
            }
        }

        public void CompareInt(string fieldName, int? oldValue, int? newValue, Func<int, string>? displayNameFunc = null)
        {
            if (oldValue != newValue)
            {
                string oldStr = oldValue.HasValue ? (displayNameFunc != null ? displayNameFunc(oldValue.Value) : oldValue.Value.ToString()) : "[Trống]";
                string newStr = newValue.HasValue ? (displayNameFunc != null ? displayNameFunc(newValue.Value) : newValue.Value.ToString()) : "[Trống]";
                _diffs.Add($"- <b>{fieldName}</b> thay đổi từ \"{oldStr}\" thành \"{newStr}\"");
            }
        }

        public void CompareGuid(string fieldName, Guid? oldValue, Guid? newValue, Func<Guid, string>? displayNameFunc = null)
        {
            if (oldValue != newValue)
            {
                string oldStr = oldValue.HasValue ? (displayNameFunc != null ? displayNameFunc(oldValue.Value) : oldValue.Value.ToString()) : "[Trống]";
                string newStr = newValue.HasValue ? (displayNameFunc != null ? displayNameFunc(newValue.Value) : newValue.Value.ToString()) : "[Trống]";
                _diffs.Add($"- <b>{fieldName}</b> thay đổi từ \"{oldStr}\" thành \"{newStr}\"");
            }
        }

        private string FormatVND(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return "[Trống]";
            var cleanValue = new string(value.Where(char.IsDigit).ToArray());
            if (decimal.TryParse(cleanValue, out decimal amount))
            {
                return amount.ToString("#,##0", new System.Globalization.CultureInfo("vi-VN")) + " VND";
            }
            return value;
        }

        public string GetLogNote()
        {
            if (!_diffs.Any()) return string.Empty;
            return string.Join("<br/>", _diffs);
        }

        public bool HasChanges => _diffs.Any();
    }
}
