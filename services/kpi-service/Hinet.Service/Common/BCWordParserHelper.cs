using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Hinet.Model.MongoEntities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace Hinet.Service.Common
{
    public static class BCWordParserHelper
    {
        private static readonly Regex KeyRegex = new Regex(@"\{\{([a-zA-Z0-9_]+)\}\}", RegexOptions.Compiled);

        public static BCFormTemplate PhanTichFileBieuMauWord(Stream stream, string filename)
        {
            var template = new BCFormTemplate
            {
                Name = Path.GetFileNameWithoutExtension(filename) ?? "Mẫu cấu hình báo cáo",
                DoiTuongTypes = new List<string> { "DOANH_NGHIEP" },
                TemplateFilePath = "",
                HuongTrang = "PORTRAIT",
                ThanhPhanForms = new List<BCThanhPhanForm>()
            };

            var flatInputs = new List<BCInputConfig>();
            var componentId = 1;

            using (var doc = WordprocessingDocument.Open(stream, false))
            {
                var body = doc.MainDocumentPart?.Document.Body;
                if (body == null) return template;

                var components = new List<BCThanhPhanForm>();
                BCThanhPhanForm? currentFlatComponent = null;
                var lastHeadingText = "";
                var compCounter = 1;

                foreach (var element in body.ChildElements)
                {
                    if (element is Paragraph para)
                    {
                        var text = para.InnerText.Trim();
                        if (string.IsNullOrEmpty(text)) continue;

                        var matches = KeyRegex.Matches(para.InnerText);
                        if (matches.Any())
                        {
                            if (currentFlatComponent == null)
                            {
                                currentFlatComponent = new BCThanhPhanForm
                                {
                                    IdThanhPhan = compCounter,
                                    Name = !string.IsNullOrEmpty(lastHeadingText) ? lastHeadingText : "Thông tin chung",
                                    ComponentType = "FLAT",
                                    OrderNumber = compCounter,
                                    Inputs = new List<BCInputConfig>(),
                                    HtmlContent = ""
                                };
                                compCounter++;
                                components.Add(currentFlatComponent);
                            }

                            var formattedHtmlText = para.InnerText;
                            foreach (Match match in matches)
                            {
                                var key = match.Groups[1].Value;
                                formattedHtmlText = formattedHtmlText.Replace(match.Value, $"[[{key}]]");

                                if (!currentFlatComponent.Inputs.Any(x => x.InputKey == key))
                                {
                                    currentFlatComponent.Inputs.Add(new BCInputConfig
                                    {
                                        InputKey = key,
                                        DisplayName = MakeFriendlyName(key),
                                        DataType = "String",
                                        Required = true,
                                        PlaceHolder = $"Nhập {MakeFriendlyName(key)}...",
                                        IsCombobox = false
                                    });
                                }
                            }

                            currentFlatComponent.HtmlContent += $"<p>{formattedHtmlText}</p>\n";
                        }
                        else
                        {
                            if (text.Length < 120 && (
                                text.StartsWith("I") || text.StartsWith("V") || text.StartsWith("X") || 
                                char.IsDigit(text[0]) || 
                                text.Contains("PHẦN") || text.Contains("Phần") || text.Contains("Mục") || text.Contains("MỤC") || 
                                char.IsUpper(text[0])
                            ))
                            {
                                lastHeadingText = text;
                            }
                            
                            if (currentFlatComponent != null)
                            {
                                currentFlatComponent.HtmlContent += $"<p>{text}</p>\n";
                            }
                        }
                    }
                    else if (element is Table table)
                    {
                        var rows = table.Descendants<TableRow>().ToList();
                        if (rows.Count < 2) continue;

                        var gridInputs = new List<BCInputConfig>();
                        var gridRows = new List<BCCategoryItem>();
                        var isGrid = false;
                        var gridCategory = "DYNAMIC_MATRIX";

                        for (int i = 0; i < rows.Count; i++)
                        {
                            var rowCells = rows[i].Descendants<TableCell>().ToList();
                            for (int j = 0; j < rowCells.Count; j++)
                            {
                                var cellText = rowCells[j].InnerText;
                                var matches = KeyRegex.Matches(cellText);
                                if (matches.Any())
                                {
                                    isGrid = true;
                                    foreach (Match match in matches)
                                    {
                                        var key = match.Groups[1].Value;
                                        if (!gridInputs.Any(x => x.InputKey == key))
                                        {
                                            var colTitle = Regex.Replace(cellText, @"\{\{.*?\}\}", "").Trim();
                                            if (string.IsNullOrEmpty(colTitle))
                                            {
                                                colTitle = MakeFriendlyName(key);
                                            }

                                            gridInputs.Add(new BCInputConfig
                                            {
                                                InputKey = key,
                                                DisplayName = colTitle,
                                                DataType = "Number",
                                                Required = true,
                                                PlaceHolder = "0",
                                                IsCombobox = false
                                            });
                                        }
                                    }
                                }
                            }
                        }

                        if (isGrid && gridInputs.Any())
                        {
                            currentFlatComponent = null;

                            for (int i = 1; i < rows.Count; i++)
                            {
                                var rowCells = rows[i].Descendants<TableCell>().ToList();
                                if (!rowCells.Any()) continue;

                                var rowHasPlaceholder = rowCells.Any(c => c.InnerText.Contains("{{"));
                                if (!rowHasPlaceholder)
                                {
                                    var stt = rowCells[0].InnerText.Trim();
                                    var title = rowCells.Count > 1 ? rowCells[1].InnerText.Trim() : "";
                                    var rowTitle = !string.IsNullOrEmpty(stt) && !string.IsNullOrEmpty(title) ? $"{stt} {title}" : (!string.IsNullOrEmpty(title) ? title : stt);

                                    if (!string.IsNullOrEmpty(rowTitle) && !int.TryParse(rowTitle, out _) && rowTitle.Length > 1)
                                    {
                                        if (!gridRows.Any(x => x.Text == rowTitle))
                                        {
                                            gridRows.Add(new BCCategoryItem
                                            {
                                                Text = rowTitle,
                                                Value = rowTitle
                                            });
                                        }
                                    }
                                }
                            }

                            var firstRowCells = rows[0].Descendants<TableCell>().ToList();
                            var firstCellText = firstRowCells.FirstOrDefault()?.InnerText ?? "";
                            if (firstCellText.Contains("Tỉnh") || firstCellText.Contains("Thành phố") || firstCellText.Contains("Địa bàn") || firstCellText.Contains("Địa phương"))
                            {
                                gridCategory = "DM_TINH";
                            }
                            else if (firstCellText.Contains("Ngành") || firstCellText.Contains("hàng") || firstCellText.Contains("Hàng"))
                            {
                                gridCategory = "DM_NGANH_HANG";
                            }

                            var tableName = "Bảng số liệu tổng hợp";
                            if (!string.IsNullOrEmpty(lastHeadingText))
                            {
                                tableName = lastHeadingText;
                            }
                            else if (!string.IsNullOrEmpty(firstCellText) && firstCellText.Length < 50)
                            {
                                tableName += $" ({firstCellText.Trim()})";
                            }

                            components.Add(new BCThanhPhanForm
                            {
                                IdThanhPhan = compCounter,
                                Name = tableName,
                                HtmlContent = $"<p>Điền số liệu chi tiết phân bổ theo {(!string.IsNullOrEmpty(firstCellText) ? firstCellText.Trim() : "danh mục")}</p>",
                                OrderNumber = compCounter,
                                ComponentType = "GRID",
                                GridDataSourceCategory = gridCategory,
                                Inputs = gridInputs,
                                GridRows = gridRows
                            });
                            compCounter++;
                        }
                    }
                }

                for (int i = 0; i < components.Count; i++)
                {
                    components[i].IdThanhPhan = i + 1;
                    components[i].OrderNumber = i + 1;
                }

                template.ThanhPhanForms = components;
            }

            return template;
        }

        private static string MakeFriendlyName(string key)
        {
            if (string.IsNullOrEmpty(key)) return "";

            // Trả về tên hiển thị tiếng Việt quen thuộc cho một số Key phổ biến
            switch (key.ToLower())
            {
                case "nguoidien": return "Họ và tên người điền";
                case "chucvu": return "Chức vụ người lập";
                case "sodienthoai": return "Số điện thoại liên hệ";
                case "nguoiban": return "Số lượng người bán";
                case "nguoimua": return "Số lượng người mua";
                case "tongdonhangdaban": return "Tổng số đơn hàng đã bán";
                case "tonggiatridonhang": return "Tổng giá trị đơn hàng (Tr.đ)";
                case "tongdonthanhcong": return "Số lượng đơn thành công";
                case "tonggiatrigiaodich": return "Tổng giá trị giao dịch (Tr.đ)";
                case "tongchiphi": return "Tổng chi phí vận hành (Tr.đ)";
                case "khokhan": return "Khó khăn vướng mắc gặp phải";
                case "nguyennhan": return "Nguyên nhân chính";
                case "dexuat": return "Đề xuất kiến nghị";
                case "dm_tinh": return "63 Tỉnh / Thành phố";
                case "dm_nganh_hang": return "Danh mục ngành hàng TMĐT";
                default:
                    // Convert camelCase / snake_case to Space Separated Title Case
                    var result = Regex.Replace(key, "([A-Z])", " $1");
                    result = result.Replace("_", " ");
                    return char.ToUpper(result[0]) + result.Substring(1).Trim();
            }
        }
    }
}
