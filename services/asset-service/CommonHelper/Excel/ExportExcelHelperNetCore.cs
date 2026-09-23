using CommonHelper.String;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Drawing;

//using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace CommonHelper.Excel
{
    public class ExportExcelHelperNetCore
    {
        public static async Task<string> Export<T>(IEnumerable<T> data)
        {
            if (data == null || !data.Any())
            {
                // Trả về file Excel rỗng nếu không có dữ liệu
                return CreateEmptyExcelFile();
            }
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Sheet1");

                // Lấy các thuộc tính của đối tượng dữ liệu đầu tiên
                var properties = typeof(T).GetProperties();

                // Đặt tiêu đề cột (header) động theo các thuộc tính của đối tượng
                for (int col = 0; col < properties.Length; col++)
                {
                    var cell = worksheet.Cells[1, col + 1];
                    var displayNameAttr = properties[col].GetCustomAttributes(typeof(System.ComponentModel.DisplayNameAttribute), false).FirstOrDefault() as System.ComponentModel.DisplayNameAttribute;
                    string columnTitle = displayNameAttr?.DisplayName ?? properties[col].Name;
                    cell.Value = columnTitle; // Đặt tên thuộc tính làm tiêu đề cột
                    cell.Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin); // Đóng khung tiêu đề cột
                    cell.Style.Font.Bold = true; // Làm cho tiêu đề cột in đậm

                    // Thêm màu nền cho tiêu đề cột
                    cell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    cell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray); // Màu nền sáng

                    // Cài đặt chiều rộng cột cố định và bật WrapText
                    worksheet.Column(col + 1).Width = 20; // Đặt chiều rộng cột là 20 (có thể điều chỉnh)
                    cell.Style.WrapText = true; // Bật tính năng WrapText cho các ô tiêu đề
                }

                // Duyệt qua dữ liệu và đổ vào Excel
                for (int row = 0; row < data.Count(); row++)
                {
                    var obj = data.ElementAt(row);
                    for (int col = 0; col < properties.Length; col++)
                    {
                        var value = properties[col].GetValue(obj); // Lấy giá trị của thuộc tính
                        var cell = worksheet.Cells[row + 2, col + 1];
                        cell.Value = value; // Đổ giá trị vào ô Excel
                        if (value is DateTime)
                        {
                            cell.Style.Numberformat.Format = "dd/MM/yyyy";
                        }

                        cell.Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin); // Đóng khung ô dữ liệu

                        // Bật tính năng WrapText cho dữ liệu trong các ô
                        cell.Style.WrapText = true;
                    }
                }

                var lastRow = data.Count() + 1;
                var lastCol = properties.Length;
                worksheet.Cells[1, 1, lastRow, lastCol].Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);

                // Lưu file vào MemoryStream
                var stream = new MemoryStream();
                package.SaveAs(stream);
                stream.Position = 0;

                // Chuyển đổi MemoryStream thành Base64
                return Convert.ToBase64String(stream.ToArray());
            }
        }

        private static string CreateEmptyExcelFile()
        {
            // Tạo và trả về file Excel rỗng
            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Sheet1");
                var stream = new MemoryStream();
                package.SaveAs(stream);
                stream.Position = 0;
                return Convert.ToBase64String(stream.ToArray());
            }
        }

        //sử dụng display name của các thuộc tính của class làm tên cột
        //public static string ExportExcel<T>(IEnumerable<T> data)
        //{
        //    if (data == null || !data.Any())
        //    {
        //        return CreateEmptyExcelFile();
        //    }

        //    ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        //    using (var package = new ExcelPackage())
        //    {
        //        var worksheet = package.Workbook.Worksheets.Add("Sheet1");

        //        // Lấy danh sách thuộc tính
        //        var properties = typeof(T).GetProperties();

        //        // Đặt tiêu đề cột (header)
        //        for (int col = 0; col < properties.Length; col++)
        //        {
        //            var property = properties[col];

        //            // Lấy DisplayName nếu có, nếu không thì lấy tên thuộc tính
        //            var displayName = property.GetCustomAttribute<System.ComponentModel.DisplayNameAttribute>()?.DisplayName ;
        //            if (string.IsNullOrEmpty(displayName)) continue;

        //            var cell = worksheet.Cells[1, col + 1];
        //            cell.Value = displayName; // Đặt tên tiêu đề theo DisplayName
        //            cell.Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);
        //            cell.Style.Font.Bold = true;

        //            // Định dạng màu nền tiêu đề
        //            cell.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
        //            cell.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue); // Nền xanh dương nhạt
        //            cell.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center; // Căn giữa nội dung

        //            // Cài đặt chiều rộng cột và WrapText
        //            worksheet.Column(col + 1).Width = 20;
        //            cell.Style.WrapText = true;
        //        }

        //        // Đổ dữ liệu vào Excel
        //        for (int row = 0; row < data.Count(); row++)
        //        {
        //            var obj = data.ElementAt(row);
        //            for (int col = 0; col < properties.Length; col++)
        //            {

        //                var property = properties[col];
        //                var displayName = property.GetCustomAttribute<System.ComponentModel.DisplayNameAttribute>()?.DisplayName;
        //                if (string.IsNullOrEmpty(displayName)) continue;


        //                var value = properties[col].GetValue(obj);
        //                var cell = worksheet.Cells[row + 2, col + 1];
        //                cell.Value = value;
        //                cell.Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);
        //                cell.Style.WrapText = true;
        //            }
        //        }

        //        var lastRow = data.Count() + 1;
        //        var lastCol = properties.Length;
        //        worksheet.Cells[1, 1, lastRow, lastCol].Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);

        //        // Lưu file vào MemoryStream
        //        var stream = new MemoryStream();
        //        package.SaveAs(stream);
        //        stream.Position = 0;

        //        // Trả về Base64 của file Excel
        //        return Convert.ToBase64String(stream.ToArray());
        //    }
        //}
        public static string ExportExcel<T>(IEnumerable<T> data)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Sheet1");

                var properties = typeof(T).GetProperties().Where(p =>
                    p.GetCustomAttribute<System.ComponentModel.DisplayNameAttribute>()?.DisplayName != null).ToList();

                int colIndex = 2; // Bắt đầu từ cột 2 vì cột 1 là STT

                // Thiết lập tiêu đề (Header)
                worksheet.Cells[1, 1].Value = "STT"; // Cột STT
                worksheet.Cells[1, 1].Style.Font.Bold = true;
                worksheet.Cells[1, 1].Style.Font.Size = 12;
                worksheet.Cells[1, 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                worksheet.Cells[1, 1].Style.Fill.BackgroundColor.SetColor(Color.LightSteelBlue);
                worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                worksheet.Cells[1, 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                foreach (var property in properties)
                {
                    var displayName = property.GetCustomAttribute<System.ComponentModel.DisplayNameAttribute>()?.DisplayName;
                    var cell = worksheet.Cells[1, colIndex];

                    cell.Value = displayName;
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.Size = 12;
                    cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    cell.Style.Fill.BackgroundColor.SetColor(Color.LightSteelBlue);
                    cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    colIndex++;
                }

                // Tăng chiều cao cho tiêu đề
                worksheet.Row(1).Height = 25;

                // Đổ dữ liệu
                int rowIndex = 2;
                foreach (var obj in data.Select((value, index) => new { Value = value, Index = index + 1 }))
                {
                    worksheet.Cells[rowIndex, 1].Value = obj.Index; // Cột STT
                    worksheet.Cells[rowIndex, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    colIndex = 2;
                    foreach (var property in properties)
                    {
                        var value = property.GetValue(obj.Value);
                        var cell = worksheet.Cells[rowIndex, colIndex];

                        if (value is DateTime dateTimeValue)
                        {
                            cell.Style.Numberformat.Format = "dd/MM/yyyy";
                            cell.Value = dateTimeValue.ToStringDate();
                        }
                        else if (value is decimal || value is double || value is float)
                        {
                            cell.Style.Numberformat.Format = "#,##0.00";
                            cell.Value = value;
                            cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                        }
                        else if (value is int || value is long)
                        {
                            cell.Style.Numberformat.Format = "#,##0";
                            cell.Value = value;
                            cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                        }
                        else
                        {
                            cell.Value = value?.ToString();
                            cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                        }

                        cell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        cell.Style.WrapText = true;

                        colIndex++;
                    }

                    rowIndex++;
                }

                // Tự động điều chỉnh độ rộng cột
                worksheet.Cells.AutoFitColumns();

                // Thêm border ngoài cho bảng
                var lastRow = data.Count() + 1;
                var lastCol = properties.Count + 1; // Thêm cột STT
                using (var border = worksheet.Cells[1, 1, lastRow, lastCol])
                {
                    border.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    border.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                    border.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                    border.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                }

                // Lưu vào MemoryStream
                var stream = new MemoryStream();
                package.SaveAs(stream);
                return Convert.ToBase64String(stream.ToArray());
            }
        }

    }
}