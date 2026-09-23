using CommonHelper.Excel;
using Hinet.Api.Request.Import;
using OfficeOpenXml;
using OfficeOpenXml.DataValidation;
using OfficeOpenXml.Style;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Formats.Tar;
using LicenseContext = OfficeOpenXml.LicenseContext;

namespace Hinet.Web.Common
{
    public class ExcelImportExtention
    {
        public static List<ConfigModule> GetConfigCol<T>(List<FieldAndSTT> collection)
        {
            var result = new List<ConfigModule>();
            var listProperty = typeof(T).GetProperties();

            foreach (var p in listProperty)
            {
                var cog = new ConfigModule
                {
                    columnName = p.Name,
                    TypeValue = Nullable.GetUnderlyingType(p.PropertyType)?.FullName ?? p.PropertyType.FullName,
                    require = p.GetCustomAttributes(typeof(RequiredAttribute), false).Any()
                };

                var displayNameAttr = p.GetCustomAttributes(typeof(DisplayNameAttribute), false).FirstOrDefault() as DisplayNameAttribute;
                cog.ColumnTitle = displayNameAttr != null ? displayNameAttr.DisplayName : p.Name;

                // Tìm kiếm cấu hình cột trong danh sách collection
                var config = collection.FirstOrDefault(c => c.ColumnName == p.Name);
                if (config != null)
                {
                    cog.NumberColumn = config.Order;
                }
                else
                {
                    cog.NumberColumn = 0;
                }
                result.Add(cog);
            }

            return result;
        }


        public static List<string> GetErrMess<T>(T obj, string mess)
        {
            var listStrErr = new List<string>();
            listStrErr.Add("0");
            var listProperty = typeof(T).GetProperties();
            for (int i = 0; i < listProperty.Count(); i++)
            {
                var p = listProperty[i];
                var vluePro = p.GetValue(obj);
                if (vluePro != null)
                {
                    listStrErr.Add(vluePro.ToString());
                }
                else
                {
                    listStrErr.Add(string.Empty);
                }
            }
            listStrErr.Add(mess);
            return listStrErr;
        }

        public static List<FieldAndSTT> GetColumnNamesWithOrder<T>()
        {
            var type = typeof(T);
            var properties = type.GetProperties()
                                 .Where(p => p.DeclaringType == type) // Chỉ lấy các thuộc tính được định nghĩa trong T
                                 .ToArray();
            var result = new List<FieldAndSTT>();
            for (int i = 0; i < properties.Length; i++)
            {
                var property = properties[i];
                var displayNameAttribute = property.GetCustomAttributes(typeof(DisplayNameAttribute), false)
                                                    .FirstOrDefault() as DisplayNameAttribute;
                result.Add(new FieldAndSTT
                {
                    Order = i + 1,
                    ColumnName = property.Name,
                    DisplayName = displayNameAttribute?.DisplayName ?? ""
                });
            }
            return result;
        }

        public static void CreateExcelWithDisplayNames<T>(string rootPath, string namFile)
        {
            // Đường dẫn thư mục
            string folderPath = Path.Combine(rootPath, "uploads", "ImportFile");

            // Kiểm tra và tạo thư mục nếu chưa tồn tại
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            // Đường dẫn file Excel
            string filePath = Path.Combine(folderPath, namFile + "Import.xlsx");

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            var columns = GetColumnNamesWithOrder<T>();
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Sheet1");

                // Thêm tiêu đề cột
                for (int i = 0; i < columns.Count; i++)
                {
                    var cell = worksheet.Cells[1, i + 1];
                    cell.Value = columns[i].DisplayName;
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    cell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.DarkSlateGray);
                    cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                }

                // Tự động điều chỉnh kích thước cột
                worksheet.Cells[1, 1, 1, columns.Count].AutoFitColumns();

                // Lưu tệp Excel
                FileInfo fileInfo = new FileInfo(filePath);
                package.SaveAs(fileInfo);
            }
        }
        public static void CreateExcelWithDisplayNamesByPath<T>(string path)
        {

            if (File.Exists(path))
            {
                File.Delete(path);
            }

            var columns = GetColumnNamesWithOrder<T>();
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Sheet1");

                // Thêm tiêu đề cột
                for (int i = 0; i < columns.Count; i++)
                {
                    var cell = worksheet.Cells[1, i + 1];
                    cell.Value = columns[i].DisplayName;
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.Color.SetColor(System.Drawing.Color.White);
                    cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    cell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.DarkSlateGray);
                    cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                }

                // Tự động điều chỉnh kích thước cột
                worksheet.Cells[1, 1, 1, columns.Count].AutoFitColumns();

                // Lưu tệp Excel
                FileInfo fileInfo = new FileInfo(path);
                package.SaveAs(fileInfo);
            }
        }


        public static string ConvertToBase64(string rootPath, string namFile)
        {
            string folderPath = Path.Combine(rootPath, "uploads", "ImportFile");

            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            string filePath = Path.Combine(folderPath, $"{namFile}Import.xlsx");

            if (File.Exists(filePath))
            {
                byte[] fileBytes = File.ReadAllBytes(filePath);

                string base64String = Convert.ToBase64String(fileBytes);

                return base64String;
            }
            else
            {
                return "";
            }

        }
    }
}