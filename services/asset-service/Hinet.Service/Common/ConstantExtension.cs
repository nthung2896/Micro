using Hinet.Service.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Common
{
    public static class ConstantExtension
    {
        public static List<DropdownOption> GetDropdownOptions<TConst>(string? selectedItem = null)
        {
            var type = typeof(TConst);
            var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Static)
                                 .Where(p => p.PropertyType == typeof(string) || p.PropertyType == typeof(int))
                                 .ToArray();

            var options = new List<DropdownOption>(properties.Length);

            foreach (var property in properties)
            {
                var displayNameAttribute = property.GetCustomAttribute<DisplayNameAttribute>();
                var displayName = displayNameAttribute?.DisplayName ?? property.Name;
                var value = property.GetValue(null)?.ToString();

                options.Add(new DropdownOption
                {
                    Value = value,
                    Label = displayName,
                    Selected = !string.IsNullOrEmpty(selectedItem) && value == selectedItem
                });
            }

            return options;
        }

        //STRING
        public static string GetName<TConst>(string value)
        {
            // Lấy tất cả các thuộc tính của kiểu TConst
            var properties = typeof(TConst).GetProperties();
            if (properties == null || properties.Length == 0)
            {
                return string.Empty;
            }

            foreach (var property in properties)
            {
                // Kiểm tra nếu phương thức `get` là static
                if (property.GetGetMethod()?.IsStatic == true)
                {
                    // Lấy giá trị của thuộc tính
                    var propertyValue = property.GetValue(null)?.ToString();

                    // Lấy thuộc tính DisplayNameAttribute (nếu có)
                    var displayNameAttr = property.GetCustomAttribute<DisplayNameAttribute>(true);
                    if (displayNameAttr != null && propertyValue == value)
                    {
                        return displayNameAttr.DisplayName;
                    }
                }
            }

            return string.Empty; // Trả về chuỗi rỗng nếu không tìm thấy
        }

        public static List<(string Value, string DisplayName)> GetListDataDisplayAndValue<TConst>()
        {
            var result = new List<(string, string)>();
            var listProperty = typeof(TConst).GetProperties(BindingFlags.Public | BindingFlags.Static);

            if (listProperty != null)
            {
                foreach (var item in listProperty)
                {
                    if (item.GetGetMethod()?.IsStatic == true)
                    {
                        var val = item.GetValue(null)?.ToString();
                        var name = item.GetCustomAttribute<DisplayNameAttribute>(true)?.DisplayName ?? item.Name;
                        result.Add((val, name));
                    }
                }
            }
            return result;
        }
    }
}
