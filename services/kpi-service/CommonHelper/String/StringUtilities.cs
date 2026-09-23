using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace CommonHelper.String
{
    public static class StringUtilities
    {
        public static string ConvertToDMY(this DateTime? d)
        {
            if (d.HasValue)
            {
                return d.Value.ToString("dd/MM/yyyy");
            }
            return "";
        }
        public static string ConvertToDMY(this DateTime d)
        {

            return d.ToString("dd/MM/yyyy");

        }
        public static string ReplaceLastChar(this string str, char newChar)
        {
            if (string.IsNullOrEmpty(str))
                throw new ArgumentException("The input string cannot be null or empty.", nameof(str));

            char[] charArray = str.ToCharArray();
            charArray[charArray.Length - 1] = newChar;
            return new string(charArray);
        }
        public static string AntiXSS(this string value)
        {
            if (value != null)
            {
                return value.Replace("<script>", "&lt;script&gt;").Replace("</script>", "&lt;/script&gt;");
            }
            return value;
        }
        public static string FixDecimalNumber(this string val)
        {
            val = val.Replace(",", "#");
            val = val.Replace(".", ",");
            val = val.Replace("#", ".");
            return val;
        }
        public static string FixDecimalNumberClient(this decimal val)
        {
            var str = val.ToString();
            str = str.Replace(".", ",");
            return str;
        }
        public static decimal? ToDecimalOrNullV2(this string input, IFormatProvider provider)
        {
            if (decimal.TryParse(input, NumberStyles.Number, provider, out decimal result))
            {
                return result;
            }
            return null;
        }
        public static string ConvertDecimalToString(this decimal? input)
        {
            if (input == null)
            {
                return "";
            }
            // Thiết lập culture settings cho việc chuyển đổi
            CultureInfo culture = CultureInfo.InvariantCulture; // Sử dụng culture settings mặc định

            // Chuyển đổi số decimal thành chuỗi với dấu "." làm ngăn cách
            string result = input.Value.ToString(culture);
            return result;
        }
        public static string ToRoman(this int number)
        {
            if ((number < 0) || (number > 3999))
                if (number < 1) return string.Empty;
            if (number >= 1000) return "M" + ToRoman(number - 1000);
            if (number >= 900) return "CM" + ToRoman(number - 900);
            if (number >= 500) return "D" + ToRoman(number - 500);
            if (number >= 400) return "CD" + ToRoman(number - 400);
            if (number >= 100) return "C" + ToRoman(number - 100);
            if (number >= 90) return "XC" + ToRoman(number - 90);
            if (number >= 50) return "L" + ToRoman(number - 50);
            if (number >= 40) return "XL" + ToRoman(number - 40);
            if (number >= 10) return "X" + ToRoman(number - 10);
            if (number >= 9) return "IX" + ToRoman(number - 9);
            if (number >= 5) return "V" + ToRoman(number - 5);
            if (number >= 4) return "IV" + ToRoman(number - 4);
            if (number >= 1) return "I" + ToRoman(number - 1);
            return string.Empty;
        }

        public static int? ValueOrDefault<T>(this int? value, int valueDefault)
        {
            return value.HasValue ? value.Value : valueDefault;
        }
        public static int ValueOrDefault<T>(this int value, int valueDefault)
        {
            return value > 0 ? value : valueDefault;
        }
        public static float? ValueOrDefault<T>(this float? value, float valueDefault)
        {
            return value.HasValue ? value.Value : valueDefault;
        }

        public static string ValueOrDefault(this string value, string valueDefault)
        {
            return !string.IsNullOrEmpty(value) ? value : valueDefault;
        }
        public static string ValueX100OrDefault(this string value, string valueDefault)
        {
            if (!string.IsNullOrEmpty(value) && double.TryParse(value.Replace(".", ","), out var dbValue))
            {
                return (dbValue * 100).ToString();
            }
            return valueDefault;
        }
        public static bool ValueOrDefault(this bool? value, bool valueDefault)
        {
            return value.HasValue ? value.Value : valueDefault;
        }
        public static string ValueOrDefault(this IEnumerable<string> values, string valueDefault)
        {
            if (values != null && values.Count() > 0)
            {
                return string.Join(", ", values);
            }
            return valueDefault;
        }
        public static string RoundCongThucTinhDiemParam(this string input, int limit = 2)
        {
            if (!string.IsNullOrEmpty(input) && double.TryParse(input, out double output))
            {
                var result = Math.Round(double.Parse(input), 2).ToString();
                return result;
            }
            return input;
        }

        public static double RoundDouble(this string input, int limit = 2)
        {
            if (!string.IsNullOrEmpty(input) && double.TryParse(input, out double output))
            {
                input = input.Replace(".", ",");
                var result = Math.Round(double.Parse(input), 2);
                return result;
            }
            return 0d;
        }
        public static bool IsNullOrEmpty(this string? value)
        {
            return string.IsNullOrEmpty(value);
        }

        public static List<string> ToListStringFromCommaSeperatedString(this string source)
        {
            if (source != null)
            {
                var result = source.Split(',').ToList();
                return result;
            }
            return new List<string>();
        }

        public static string GetEditMessage(string objectName, int type)
        {
            if (type == 1)
            {
                return $"Cập nhật đối tượng {objectName} vào hệ thống thành công";
            }
            else
            {
                return $"Cập nhật đối tượng {objectName} vào hệ thống thất bại";
            }
        }

        public static string GetDeleteMessage(string objectName, int type)
        {
            if (type == 1)
            {
                return $"Xóa đối tượng {objectName} khỏi hệ thống thành công";
            }
            else
            {
                return $"Xóa nhật đối tượng {objectName} khỏi hệ thống thất bại";
            }
        }

        public static string GetNullObjectMessage(string objectName)
        {
            return $"Đối tượng {objectName} không tồn tại trong hệ thống";
        }

        public static DateTime SetTime(this DateTime date, TimeSpan time)
        {
            date = date.AddHours(time.Hours);
            date = date.AddMinutes(time.Minutes);
            date = date.AddSeconds(time.Seconds);
            return date;
        }
        public static string GetParrentCode(this string path)
        {
            var rgx = new Regex(@"-[0-9a-zA-Z]*$");
            if (!string.IsNullOrEmpty(path))
            {
                return rgx.Replace(path, "");
            }
            else
            {
                return string.Empty;
            }
            return path;
        }
        public static string Base64Encode(this string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }
        /// <summary>
        /// Bỏ các slash ở đầu của link
        /// </summary>
        /// <param name="path"></param>
        /// <returns></returns>
        public static string StandardPath(this string path)
        {
            var rgx = new Regex(@"^\/+");
            if (!string.IsNullOrEmpty(path))
            {
                return rgx.Replace(path, "");
            }
            else
            {
                return string.Empty;
            }
            return path;
        }
        /// <summary>
        /// Hiển thị dung lượng file
        /// </summary>
        /// <param name="Size"></param>
        /// <returns></returns>
        public static string ConvertToStringMb(this decimal? Size)
        {
            if (Size == null)
            {
                return "0";
            }
            var MbData = Math.Round(Size.GetValueOrDefault() / 1048576, 2);
            return MbData.ToString("#,#");
        }
        public static string ConvertToStringMb(this int Size)
        {

            if (Size < 1048576)
            {
                return Math.Round((decimal)Size / 1024, 4).ToString("#,#") + " KB";
            }
            return Math.Round((decimal)Size / 1048576, 4).ToString("#,#") + " MB";
        }


        /// <summary>
        /// ddMMyyyy
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public static DateTime? GetDateFromtxt(this string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return null;
            }
            if (input.Length != 8)
            {
                return null;
            }

            var day = input.Substring(0, 2);
            var month = input.Substring(2, 2);
            var year = input.Substring(4, 4);
            return DateTime.ParseExact(string.Format("{0}/{1}/{2}", day, month, year), "dd/MM/yyyy", null);
        }


        public static string ToStringDate(this DateTime? input, string format = "dd/MM/yyyy")
        {
            if (!input.HasValue)
            {
                return string.Empty;
            }
            return input.Value.ToString(format);
        }

        public static string ToStringDate(this DateTime input, string format = "dd/MM/yyyy")
        {
            return input.ToString(format);
        }

        public static DateTime? ToDateTime(this string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return null;
            }
            var date = input.Split('/');
            if (string.IsNullOrEmpty(date[0]) || string.IsNullOrEmpty(date[1]) || string.IsNullOrEmpty(date[2]))
            {
                return null;
            }
            var day = int.Parse(date[0]).ToString("00");
            var month = int.Parse(date[1]).ToString("00");
            var year = int.Parse(date[2]).ToString("0000");
            return DateTime.ParseExact(string.Format("{0}/{1}/{2}", day, month, year), "dd/MM/yyyy", null);
        }

        public static IEnumerable<T> ToListNumber<T>(this string input, char splitKey = ',') where T : struct, IComparable, IComparable<T>, IConvertible, IEquatable<T>, IFormattable
        {
            if (!string.IsNullOrEmpty(input))
            {
                var list = input.Split(splitKey);
                foreach (var item in list)
                {
                    if (!string.IsNullOrEmpty(item))
                    {
                        yield return (T)Convert.ChangeType(item, typeof(T));
                    }
                }
            }
        }

        public static Nullable<T> ToNullableNumber<T>(this string input) where T : struct, IComparable, IComparable<T>, IConvertible, IEquatable<T>, IFormattable
        {
            if (string.IsNullOrEmpty(input) || !input.All(char.IsDigit))
            {
                return null;
            }
            var result = (T)Convert.ChangeType(input, typeof(T));
            return result;
        }

        public static T ToNumber<T>(this string input) where T : struct, IComparable, IComparable<T>, IConvertible, IEquatable<T>, IFormattable
        {
            if (string.IsNullOrEmpty(input) || !input.All(char.IsDigit))
            {
                return default(T);
            }
            var result = (T)Convert.ChangeType(input, typeof(T));
            return result;
        }



        public static DateTime? ToEndDay(this string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return null;
            }
            var parts = input.Split('/');
            if (string.IsNullOrEmpty(parts[0]) || string.IsNullOrEmpty(parts[1]) || string.IsNullOrEmpty(parts[2]))
            {
                return null;
            }
            int day, month, year;
            day = month = year = 0;

            if (!int.TryParse(parts[0], out day) || !int.TryParse(parts[1], out month) || !int.TryParse(parts[2], out year))
            {
                return null;
            }
            return DateTime.ParseExact(string.Format("{0}/{1}/{2} 23:59:59", day.ToString("00"), month.ToString("00"), year.ToString("0000")), "dd/MM/yyyy HH:mm:ss", null);
        }
        public static string ConvertToUnsign(this string str)
        {
            if (string.IsNullOrEmpty(str))
                return string.Empty;
            string[] signs = new string[] {
                "aAeEoOuUiIdDyY",
                "áàạảãâấầậẩẫăắằặẳẵ",
                "ÁÀẠẢÃÂẤẦẬẨẪĂẮẰẶẲẴ",
                "éèẹẻẽêếềệểễ",
                "ÉÈẸẺẼÊẾỀỆỂỄ",
                "óòọỏõôốồộổỗơớờợởỡ",
                "ÓÒỌỎÕÔỐỒỘỔỖƠỚỜỢỞỠ",
                "úùụủũưứừựửữ",
                "ÚÙỤỦŨƯỨỪỰỬỮ",
                "íìịỉĩ",
                "ÍÌỊỈĨ",
                "đ",
                "Đ",
                "ýỳỵỷỹ",
                "ÝỲỴỶỸ",
                "!@#$%^&*(),.[]{}"
           };
            for (int i = 1; i < signs.Length - 1; i++)
            {
                for (int j = 0; j < signs[i].Length; j++)
                {
                    str = str.Replace(signs[i][j], signs[0][i - 1]);
                }
            }
            for (int i = 0; i < signs[signs.Length - 1].Length; i++)
            {
                str = str.Replace(signs[signs.Length - 1][i], ' ');
            }
            return str;
        }

        //hàm xóa dấu tiếng việt
        public static string RemoveUnicode(this string text)
        {
            string[] arr1 = new string[] { "á", "à", "ả", "ã", "ạ", "â", "ấ", "ầ", "ẩ", "ẫ", "ậ", "ă", "ắ", "ằ", "ẳ", "ẵ", "ặ",
                "đ",
                "é","è","ẻ","ẽ","ẹ","ê","ế","ề","ể","ễ","ệ",
                "í","ì","ỉ","ĩ","ị",
                "ó","ò","ỏ","õ","ọ","ô","ố","ồ","ổ","ỗ","ộ","ơ","ớ","ờ","ở","ỡ","ợ",
                "ú","ù","ủ","ũ","ụ","ư","ứ","ừ","ử","ữ","ự",
                "ý","ỳ","ỷ","ỹ","ỵ",};
            string[] arr2 = new string[] { "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a",
            "d",
            "e","e","e","e","e","e","e","e","e","e","e",
            "i","i","i","i","i",
            "o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o","o",
            "u","u","u","u","u","u","u","u","u","u","u",
            "y","y","y","y","y",};
            for (int i = 0; i < arr1.Length; i++)
            {
                text = text.Replace(arr1[i], arr2[i]);
                text = text.Replace(arr1[i].ToUpper(), arr2[i].ToUpper());
            }
            string otherChars = "!@#$%^&*(),.[]{}";
            for (int i = 0; i < otherChars.Length; i++)
            {
                text = text.Replace(otherChars[i], ' ');
            }
            text = text.Replace("\t", "");
            return text;
        }

        public static DateTime? ToStartDay(this string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return null;
            }
            var parts = input.Split('/');
            if (string.IsNullOrEmpty(parts[0]) || string.IsNullOrEmpty(parts[1]) || string.IsNullOrEmpty(parts[2]))
            {
                return null;
            }
            int day, month, year;
            day = month = year = 0;

            if (!int.TryParse(parts[0], out day) || !int.TryParse(parts[1], out month) || !int.TryParse(parts[2], out year))
            {
                return null;
            }
            return DateTime.ParseExact(string.Format("{0}/{1}/{2} 00:00:00", day.ToString("00"), month.ToString("00"), year.ToString("0000")), "dd/MM/yyyy HH:mm:ss", null);
        }
        /// <summary>
        /// Kiểm tra thao tác có nằm trong danh sách thao tác mà user có quyền không
        /// </summary>
        /// <param name="list_thaotac">Danh sách thao tác của user đang đăng nhập</param>
        /// <param name="ma_thaotac">Thao tác muốn kiểm tra quyền</param>
        /// <returns></returns>

        private static readonly string[] VietnameseSigns = new string[]

        {

            "aAeEoOuUiIdDyY",

            "áàạảãâấầậẩẫăắằặẳẵ",

            "ÁÀẠẢÃÂẤẦẬẨẪĂẮẰẶẲẴ",

            "éèẹẻẽêếềệểễ",

            "ÉÈẸẺẼÊẾỀỆỂỄ",

            "óòọỏõôốồộổỗơớờợởỡ",

            "ÓÒỌỎÕÔỐỒỘỔỖƠỚỜỢỞỠ",

            "úùụủũưứừựửữ",

            "ÚÙỤỦŨƯỨỪỰỬỮ",

            "íìịỉĩ",

            "ÍÌỊỈĨ",

            "đ",

            "Đ",

            "ýỳỵỷỹ",

            "ÝỲỴỶỸ"

        };
        public static string RemoveSign4VietnameseString(string str)
        {

            //Tiến hành thay thế , lọc bỏ dấu cho chuỗi

            for (int i = 1; i < VietnameseSigns.Length; i++)
            {

                for (int j = 0; j < VietnameseSigns[i].Length; j++)

                    str = str.Replace(VietnameseSigns[i][j], VietnameseSigns[0][i - 1]);

            }

            return str;

        }

        public static string GetFileNameFormart(this string str)
        {
            var result = RemoveSign4VietnameseString(str);
            result = result.Trim();
            result = result.Replace(' ', '_');
            return result;
        }
        public static bool ToBoolByOnOff(this string obj)
        {
            if (!string.IsNullOrEmpty(obj) && obj.ToLower().Equals("On".ToLower()))
            {
                return true;
            }
            return false;

        }
        public static bool? ToBoolByOnOffNULL(this string obj)
        {
            if (string.IsNullOrEmpty(obj))
            {
                return null;
            }
            if (!string.IsNullOrEmpty(obj) && obj.ToLower().Equals("On".ToLower()))
            {
                return true;
            }
            return false;

        }
        public static DateTime? ToDateTimeFromMonth(this string obj)
        {
            //try
            //{
            if (!string.IsNullOrEmpty(obj))
            {
                var date = obj.Split('/');
                if (date != null)
                {
                    if (!string.IsNullOrEmpty(date[0]) && !string.IsNullOrEmpty(date[1]))
                    {

                        var month = int.Parse(date[0]).ToString("00");
                        var year = int.Parse(date[1]).ToString("0000");
                        return DateTime.ParseExact(string.Format("{0}/{1}/{2}", "01", month, year), "dd/MM/yyyy", null);
                    }
                }
                return null;
            }
            else
            {
                return null;
            }

        }


        public static DateTime? ToDateTimeFromYear(this string obj)
        {
            //try
            //{
            if (!string.IsNullOrEmpty(obj))
            {
                return DateTime.ParseExact(string.Format("{0}/{1}/{2}", "01", "01", obj), "dd/MM/yyyy", null);

            }
            else
            {
                return null;
            }
            //}catch(Exception ex){
            //    return null;
            // }
        }

        public static DateTime? ToEndYear(this DateTime? obj)
        {
            if (obj.HasValue)
            {
                var day = DateTime.DaysInMonth(obj.Value.Year, 12).ToString("00");

                return DateTime.ParseExact(string.Format("{0}/{1}/{2} 23:59:59", day, "12", obj.Value.Year.ToString("0000")), "dd/MM/yyyy HH:mm:ss", null);

            }
            else
            {
                return null;
            }
        }

        public static DateTime? ToEndMonth(this DateTime? obj)
        {
            if (obj.HasValue)
            {
                var day = DateTime.DaysInMonth(obj.Value.Year, obj.Value.Month).ToString("00");

                return DateTime.ParseExact(string.Format("{0}/{1}/{2} 23:59:59", day, obj.Value.Month.ToString("00"), obj.Value.Year.ToString("0000")), "dd/MM/yyyy HH:mm:ss", null);

            }
            else
            {
                return null;
            }
        }
        public static DateTime ToEndMonth(this DateTime obj)
        {

            var day = DateTime.DaysInMonth(obj.Year, obj.Month).ToString("00");

            return DateTime.ParseExact(string.Format("{0}/{1}/{2} 23:59:59", day, obj.Month.ToString("00"), obj.Year.ToString("0000")), "dd/MM/yyyy HH:mm:ss", null);


        }
        public static DateTime? ToEndDay(this DateTime? obj)
        {
            if (obj.HasValue)
            {


                return DateTime.ParseExact(string.Format("{0}/{1}/{2} 23:59:59", obj.Value.Day.ToString("00"), obj.Value.Month.ToString("00"), obj.Value.Year.ToString("0000")), "dd/MM/yyyy HH:mm:ss", null);

            }
            else
            {
                return null;
            }
        }
        public static DateTime ToEndDay(this DateTime obj)
        {


            return DateTime.ParseExact(string.Format("{0}/{1}/{2} 23:59:59", obj.Day.ToString("00"), obj.Month.ToString("00"), obj.Year.ToString("0000")), "dd/MM/yyyy HH:mm:ss", null);

        }
        public static DateTime? ToStartDay(this DateTime? obj)
        {
            if (obj.HasValue)
            {


                return DateTime.ParseExact(string.Format("{0}/{1}/{2} 00:00:00", obj.Value.Day.ToString("00"), obj.Value.Month.ToString("00"), obj.Value.Year.ToString("0000")), "dd/MM/yyyy HH:mm:ss", null);

            }
            else
            {
                return null;
            }
        }
        public static DateTime ToStartDay(this DateTime obj)
        {

            return DateTime.ParseExact(string.Format("{0}/{1}/{2} 00:00:00", obj.Day.ToString("00"), obj.Month.ToString("00"), obj.Year.ToString("0000")), "dd/MM/yyyy HH:mm:ss", null);

        }
        public static DateTime? ToStartMonth(this DateTime? obj)
        {
            if (obj.HasValue)
            {
                return DateTime.ParseExact(string.Format("{0}/{1}/{2} 00:00:00", "01", obj.Value.Month.ToString("00"), obj.Value.Year.ToString("0000")), "dd/MM/yyyy HH:mm:ss", null);
            }
            else
            {
                return null;
            }
        }
        public static DateTime ToStartMonth(this DateTime obj)
        {


            return DateTime.ParseExact(string.Format("{0}/{1}/{2} 00:00:00", "01", obj.Month.ToString("00"), obj.Year.ToString("0000")), "dd/MM/yyyy HH:mm:ss", null);

        }

        public static DateTime? ToStartQuater(this DateTime? datetime)
        {
            if (!datetime.HasValue)
                return null;
            return datetime.Value.ToStartQuater();
        }

        public static DateTime ToStartQuater(this DateTime datetime)
        {

            int currQuarter = (datetime.Month - 1) / 3 + 1;
            DateTime dtFirstDay = new DateTime(datetime.Year, 3 * currQuarter - 2, 1);
            return new DateTime(datetime.Year, 3 * currQuarter - 2, 1);
        }
        public static DateTime ToEndQuarter(this DateTime datetime)
        {
            return new DateTime(datetime.Year, datetime.Month / 3 * 3 + 3, 1).AddDays(-1);
        }

        public static DateTime ToEndYear(this DateTime obj)
        {

            var day = DateTime.DaysInMonth(obj.Year, 12).ToString("00");

            return DateTime.ParseExact(string.Format("{0}/{1}/{2} 23:59:59", day, "12", obj.Year.ToString("0000")), "dd/MM/yyyy HH:mm:ss", null);


        }
        public static DateTime? ToStartYear(this DateTime? obj)
        {
            if (obj.HasValue)
            {

                return DateTime.ParseExact(string.Format("{0}/{1}/{2} 00:00:00", "01", "01", obj.Value.Year.ToString("0000")), "dd/MM/yyyy HH:mm:ss", null);

            }
            else
            {
                return null;
            }
        }
        public static DateTime ToStartYear(this DateTime obj)
        {

            return DateTime.ParseExact(string.Format("{0}/{1}/{2} 00:00:00", "01", "01", obj.Year.ToString("0000")), "dd/MM/yyyy HH:mm:ss", null);


        }

        public static bool IsNotEmpty(this string obj)
        {
            var isNotNull = !string.IsNullOrEmpty(obj);
            return isNotNull;
        }

        public static Guid? ToGuid(this string obj)
        {
            if (string.IsNullOrEmpty(obj))
            {
                return null;
            }
            if (Guid.TryParse(obj, out var guid))
            {
                return guid;
            }
            return null;
        }
        public static Guid ToGuidOrEmpty(this string obj)
        {
            if (string.IsNullOrEmpty(obj))
            {
                return Guid.Empty;
            }
            if (Guid.TryParse(obj, out var guid))
            {
                return guid;
            }
            return Guid.Empty;
        }

        public static List<Guid> ToListGuid(this string obj, char splitKey = ',')
        {
            if (string.IsNullOrEmpty(obj))
                return Enumerable.Empty<Guid>().ToList();
            return obj.Split(splitKey).Select(x => x.ToGuidOrEmpty()).ToList();
        }


        public static short? ToShortOrNULL(this string obj)
        {
            short outResult;
            if (!short.TryParse(obj, out outResult))
            {
                return null;
            }

            if (!string.IsNullOrEmpty(obj))
            {
                return short.Parse(obj);
            }
            else
            {
                return null;
            }
        }

        public static int? ToIntOrNULL(this string obj)
        {
            int outResult;
            if (!int.TryParse(obj, out outResult))
            {
                return null;
            }
            if (!string.IsNullOrEmpty(obj))
            {
                return int.Parse(obj);
            }
            else
            {
                return null;
            }
        }
        public static long? ToLongOrNULL(this string obj)
        {
            long outResult;
            if (!long.TryParse(obj, out outResult))
            {
                return null;
            }
            if (!string.IsNullOrEmpty(obj))
            {
                return long.Parse(obj);
            }
            else
            {
                return null;
            }
        }
        public static short ToShortOrZero(this string obj)
        {
            short outResult;
            if (!short.TryParse(obj, out outResult))
            {
                return 0;
            }

            if (!string.IsNullOrEmpty(obj))
            {
                return short.Parse(obj);
            }
            else
            {
                return 0;
            }
        }

        public static int ToIntOrZero(this string obj)
        {
            int outResult;
            if (!int.TryParse(obj, out outResult))
            {
                return 0;
            }

            if (!string.IsNullOrEmpty(obj))
            {
                return int.Parse(obj);
            }
            else
            {
                return 0;
            }
        }
        public static bool ToBoolOrFalse(this string obj)
        {
            if (!string.IsNullOrEmpty(obj))
            {
                return bool.Parse(obj);
            }
            else
            {
                return false;
            }
        }
        public static long ToLongOrZero(this string obj)
        {
            long outResult;
            if (!long.TryParse(obj, out outResult))
            {
                return 0;
            }

            if (!string.IsNullOrEmpty(obj))
            {
                return long.Parse(obj);
            }
            else
            {
                return 0;
            }
        }

        public static float ToFloatOrZero(this string obj)
        {
            try
            {
                if (!string.IsNullOrEmpty(obj))
                {
                    return float.Parse(obj);
                }
                else
                {
                    return 0;
                }
            }
            catch
            {

                return 0;
            }

        }

        public static float ToFloatOrZeroReplace(this string obj)
        {
            try
            {
                if (!string.IsNullOrEmpty(obj))
                {
                    return float.Parse(obj.Replace(".", ","));
                }
                else
                {
                    return 0;
                }
            }
            catch
            {

                return 0;
            }

        }
        public static float? ToFloatOrNull(this string obj)
        {
            try
            {
                if (!string.IsNullOrEmpty(obj))
                {
                    return float.Parse(obj);
                }
                else
                {
                    return null;
                }
            }
            catch
            {

                return null;
            }

        }
        public static decimal ToDecimalOrZero(this string obj)
        {
            try
            {
                if (!string.IsNullOrEmpty(obj))
                {
                    return decimal.Parse(obj);
                }
                else
                {
                    return 0;
                }
            }
            catch
            {

                return 0;
            }
        }
        public static decimal? ToDecimalOrNull(this string obj)
        {
            try
            {
                if (!string.IsNullOrEmpty(obj))
                {
                    return decimal.Parse(obj);
                }
                else
                {
                    return null;
                }
            }
            catch
            {

                return null;
            }
        }
        public static List<long> ToListLong(this string obj, char split_key = ',')
        {
            List<long> listLong = new List<long>();
            if (!string.IsNullOrEmpty(obj))
            {
                var list = obj.Split(split_key);
                if (list != null)
                {
                    foreach (var item in list)
                    {
                        if (long.TryParse(item, out long temp))
                        {
                            listLong.Add(temp);
                        }
                    }
                }
            }
            return listLong;
        }
        public static List<int> ToListInt(this string obj, char split_key)
        {
            List<int> listInt = new List<int>();
            if (!string.IsNullOrEmpty(obj))
            {
                var list = obj.Split(split_key);
                if (list != null)
                {
                    foreach (var item in list)
                    {
                        if (!string.IsNullOrEmpty(item))
                        {
                            listInt.Add(int.Parse(item));
                        }
                    }
                }
            }
            return listInt;
        }
        public static List<string> ToListStringLower(this string obj, char split_key)
        {
            List<string> listInt = new List<string>();
            if (!string.IsNullOrEmpty(obj))
            {
                var list = obj.Split(split_key);
                if (list != null)
                {
                    foreach (var item in list)
                    {
                        if (!string.IsNullOrEmpty(item))
                        {
                            listInt.Add(item);
                        }
                    }
                }
            }
            return listInt;
        }


        public static List<short> ToListShort(this string obj, char split_key)
        {
            List<short> listInt = new List<short>();
            if (!string.IsNullOrEmpty(obj))
            {
                var list = obj.Split(split_key);
                if (list != null)
                {
                    foreach (var item in list)
                    {
                        if (!string.IsNullOrEmpty(item))
                        {
                            listInt.Add(short.Parse(item));
                        }
                    }
                }
            }
            return listInt;
        }
        public static DateTime GetMonday(this DateTime date)
        {
            switch (date.DayOfWeek)
            {
                case DayOfWeek.Monday:
                    return date;
                case DayOfWeek.Tuesday:
                    return date.AddDays(-1);
                case DayOfWeek.Wednesday:
                    return date.AddDays(-2);
                case DayOfWeek.Thursday:
                    return date.AddDays(-3);
                case DayOfWeek.Friday:
                    return date.AddDays(-4);
                case DayOfWeek.Saturday:
                    return date.AddDays(-5);
                case DayOfWeek.Sunday:
                    return date.AddDays(-6);
                default:
                    return date;
            }
        }

        public static DateTime FirstDateOfWeek(int year, int weekOfYear, System.Globalization.CultureInfo ci)
        {
            DateTime jan1 = new DateTime(year, 1, 1);
            int daysOffset = (int)ci.DateTimeFormat.FirstDayOfWeek - (int)jan1.DayOfWeek;
            DateTime firstWeekDay = jan1.AddDays(daysOffset);
            int firstWeek = ci.Calendar.GetWeekOfYear(jan1, ci.DateTimeFormat.CalendarWeekRule, ci.DateTimeFormat.FirstDayOfWeek);
            if (firstWeek <= 1 || firstWeek > 50)
            {
                weekOfYear -= 1;
            }
            return firstWeekDay.AddDays(weekOfYear * 7);
        }
        public static int GetIso8601WeekOfYear(DateTime time)
        {
            DayOfWeek day = CultureInfo.InvariantCulture.Calendar.GetDayOfWeek(time);
            if (day >= DayOfWeek.Monday && day <= DayOfWeek.Wednesday)
            {
                time = time.AddDays(3);
            }

            return CultureInfo.InvariantCulture.Calendar.GetWeekOfYear(time, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
        }
        public static DateTime GetStartOfWeek(int year, int month, int weekofmonth)
        {
            //lấy ngày bắt đầu của tuần trong tháng
            var day = weekofmonth * 7 - 6;
            var StartDate = new DateTime(year, month, day);
            var weekOfYear = GetIso8601WeekOfYear(StartDate);
            return FirstDateOfWeek(year, weekOfYear, CultureInfo.CurrentCulture);
        }

        public static DateTime GetEndOfWeek(DateTime startOfWeek)
        {
            return startOfWeek.AddDays(6);
        }
        public static string Truncate(string input = "", int length = 0)
        {
            if (!string.IsNullOrEmpty(input))
            {
                if (input.Length <= length)
                {
                    return input;
                }
                else
                {
                    return input.Substring(0, length) + "...";
                }
            }
            return string.Empty;
        }

        public static string GetSummary(this string input, int length = 0)
        {
            if (!string.IsNullOrEmpty(input))
            {
                if (input.Length <= length)
                {
                    return input;
                }
                else
                {
                    return input.Substring(0, length) + "...";
                }
            }
            return string.Empty;
        }
        /// <summary>
        /// Chuyển số tiền sang dạng chữ
        /// </summary>
        /// <param name="number"></param>
        /// <returns></returns>
        public static string ChuyenSo(this string number)
        {
            string[] dv = { "", "mươi", "trăm", "nghìn, ", "triệu, ", "tỉ, " };
            string[] cs = { "không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín" };

            var length = number.Length;
            number += "ss";
            var doc = new StringBuilder();
            var rd = 0;

            var i = 0;
            while (i < length)
            {
                //So chu so o hang dang duyet
                var n = (length - i + 2) % 3 + 1;

                //Kiem tra so 0
                var found = 0;
                int j;
                for (j = 0; j < n; j++)
                {
                    if (number[i + j] == '0') continue;
                    found = 1;
                    break;
                }

                //Duyet n chu so
                int k;
                if (found == 1)
                {
                    rd = 1;
                    for (j = 0; j < n; j++)
                    {
                        var ddv = 1;
                        switch (number[i + j])
                        {
                            case '0':
                                if (n - j == 3)
                                    doc.Append(cs[0]);
                                if (n - j == 2)
                                {
                                    if (number[i + j + 1] != '0')
                                        doc.Append("lẻ");
                                    ddv = 0;
                                }
                                break;
                            case '1':
                                switch (n - j)
                                {
                                    case 3:
                                        doc.Append(cs[1]);
                                        break;
                                    case 2:
                                        doc.Append("mười");
                                        ddv = 0;
                                        break;
                                    case 1:
                                        k = (i + j == 0) ? 0 : i + j - 1;
                                        doc.Append((number[k] != '1' && number[k] != '0') ? "mốt" : cs[1]);
                                        break;
                                }
                                break;
                            case '5':
                                doc.Append((i + j == length - 1) ? "lăm" : cs[5]);
                                break;
                            default:
                                doc.Append(cs[number[i + j] - 48]);
                                break;
                        }

                        doc.Append(" ");

                        //Doc don vi nho
                        if (ddv == 1)
                            doc.Append(dv[n - j - 1] + " ");
                    }
                }


                //Doc don vi lon
                if (length - i - n > 0)
                {
                    if ((length - i - n) % 9 == 0)
                    {
                        if (rd == 1)
                            for (k = 0; k < (length - i - n) / 9; k++)
                                doc.Append("tỉ, ");
                        rd = 0;
                    }
                    else
                        if (found != 0) doc.Append(dv[((length - i - n + 1) % 9) / 3 + 2] + " ");
                }

                i += n;
            }
            var result = (length == 1) && (number[0] == '0' || number[0] == '5') ? cs[number[0] - 48] : doc.ToString();
            result = result.Trim().Trimtxt();
            if (result[result.Length - 1] == ',')
            {
                result = result.Substring(0, result.Length - 1);
            }
            return result;
        }
        public static string Trimtxt(this string str)
        {
            if (!string.IsNullOrEmpty(str))
            {

                str = str.TrimStart();
                str = str.TrimEnd();
                str = str.Trim();
                while (str.Contains("  "))
                {
                    str = str.Replace("  ", " ");
                }
            }
            else
            {
                str = string.Empty;
            }


            return str;
        }
        public static string ToDateTimeTextZero(this string obj)
        {
            if (!string.IsNullOrEmpty(obj))
            {
                var date = obj.Split('/');
                if (date != null)
                {
                    if (date.Length == 3)
                    {
                        return obj;
                    }

                    if (date.Length == 2)
                    {
                        return "00/" + obj;
                    }

                    if (date.Length == 1)
                    {
                        return "00/00/" + obj;
                    }
                }
                return string.Empty;
            }
            else
            {
                return string.Empty;
            }

        }
        public static string ToSafeFileName(this string s)
        {
            return s
                .Replace("\\", "")
                .Replace("/", "")
                .Replace("\"", "")
                .Replace("*", "")
                .Replace(":", "")
                .Replace("?", "")
                .Replace("<", "")
                .Replace(">", "")
                .Replace("|", "");
        }
        public static double ToDoubleOrZero(this string obj)
        {
            try
            {

                if (!string.IsNullOrEmpty(obj))
                {
                    obj = obj.Replace(".", ",");
                    return double.Parse(obj);
                }
                else
                {
                    return 0;
                }
            }
            catch
            {
                return 0;
            }
        }
        public static double? ToDoublelOrNull(this string obj)
        {
            try
            {
                if (!string.IsNullOrEmpty(obj))
                {
                    return double.Parse(obj);
                }
                else
                {
                    return null;
                }
            }
            catch
            {
                return null;
            }
        }
        /// <summary>
        /// Hiển thị ngày tháng
        /// </summary>
        /// <param name="dt"></param>
        /// <returns></returns>
        public static string GetTextDisplay(this DateTime dt)
        {
            var nameArr = new string[] { "Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy" };
            return nameArr[(int)dt.DayOfWeek] + ", ngày " + dt.ToString("dd/MM/yyyy");
        }
        public static string GetTextDayDisplay(this DateTime dt)
        {
            var nameArr = new string[] { "Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy" };
            return nameArr[(int)dt.DayOfWeek];
        }
        public static string ConvertToVN(this string chucodau)
        {
            const string FindText = "áàảãạâấầẩẫậăắằẳẵặđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ";
            const string ReplText = "aaaaaaaaaaaaaaaaadeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyAAAAAAAAAAAAAAAAADEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYY";
            int index = -1;
            char[] arrChar = FindText.ToCharArray();
            while ((index = chucodau.IndexOfAny(arrChar)) != -1)
            {
                int index2 = FindText.IndexOf(chucodau[index]);
                chucodau = chucodau.Replace(chucodau[index], ReplText[index2]);
            }
            return chucodau;
        }
        public static string GetChuCaiDauTrongHoTen(this string obj)
        {
            obj = obj.Trim().Trimtxt();
            obj = obj.ConvertToVN();
            var tmpStr = obj.Split(' ');
            string result = string.Empty;
            if (!string.IsNullOrEmpty(obj))
            {

                if (tmpStr.Length == 1)
                {

                    if (tmpStr[0].Length == 1)
                    {
                        result += tmpStr[0][0];
                        result += tmpStr[0][0];
                        result += tmpStr[0][0];
                    }
                    else
                    {
                        result += tmpStr[0][0];
                        result += tmpStr[0][1];
                        result += tmpStr[0][tmpStr[0].Length - 1];
                    }

                }
                else if (tmpStr.Length == 2)
                {
                    result += tmpStr[0][0];
                    result += tmpStr[1][0];
                    result += tmpStr[1][tmpStr[1].Length - 1];
                }
                else
                {
                    result += tmpStr[0][0];
                    result += tmpStr[tmpStr.Length - 2][0];
                    result += tmpStr[tmpStr.Length - 1][0];
                }
            }
            return result.ToUpper();
        }
        public static string GenerateCoupon(int length)
        {
            Random random = new Random();
            string characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            StringBuilder result = new StringBuilder(length);
            for (int i = 0; i < length; i++)
            {
                result.Append(characters[random.Next(characters.Length)]);
            }
            return result.ToString();
        }
        public static string DanhMucVietTat(this string obj)
        {
            //Công ty viết tắt
            obj = obj.Replace("Tổ Chức", "TC");
            obj = obj.Replace("tổ chức", "TC");
            obj = obj.Replace("Công Ty", "CT");
            obj = obj.Replace("công ty", "CT");
            obj = obj.Replace("Trách Nhiệm Hữu Hạn", ".TNHH");
            obj = obj.Replace("trách nhiệm hữu hạn", ".TNHH");
            obj = obj.Replace("Một Thành Viên", " 1 TV");
            obj = obj.Replace("một thành viên", " 1 TV");
            obj = obj.Replace("Cổ Phần", "CP");
            obj = obj.Replace("cổ phần", "CP");
            obj = obj.Replace("Hợp Danh", "HD");
            obj = obj.Replace("hợp danh", "HD");
            obj = obj.Replace("Phi Lợi Nhuận", "PLN");
            obj = obj.Replace("phi lợi nhuận", "PLN");
            obj = obj.Replace("Tập Đoàn", "TĐ");
            obj = obj.Replace("tập đoàn", "TĐ");
            obj = obj.Replace("Tổng Công Ty", "TCT");
            obj = obj.Replace("tổng công ty", "TCT");

            return obj;
        }
        /// <summary>
        /// Tạo tên đường dẫn cho url
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static string SlugTitleName(this string obj)
        {
            obj = obj.Trim();
            obj = RemoveSign4VietnameseString(obj);
            obj = obj.Replace("\"", "");
            obj = obj.Replace("\'", "");
            obj = Regex.Replace(obj, @"[!@#$%^&*()<>,.:\/|?]+", "");
            obj = Regex.Replace(obj, @"[\s\t\n]+", " ");

            var result = obj.Replace(" ", "-");
            result = result + '-' + GenerateCoupon(10);
            return result;
        }

        /// <summary>
        /// @author:duynn
        /// @since: 30/07/2020
        /// @description: bỏ các ký tự đặc biệt trên tên file
        /// </summary>
        /// <param name="phrase"></param>
        /// <returns></returns>
        public static string Slugify(this string phrase)
        {
            if (string.IsNullOrEmpty(phrase))
            {
                return string.Empty;
            }

            string str = phrase.RemoveAccent().ToLower();
            str = System.Text.RegularExpressions.Regex.Replace(str, @"[^a-z0-9\s-]", ""); // Remove all non valid chars
            str = System.Text.RegularExpressions.Regex.Replace(str, @"\s+", " ").Trim(); // convert multiple spaces into one space
            str = System.Text.RegularExpressions.Regex.Replace(str, @"\s", "-"); // //Replace spaces by dashes
            return str;
        }

        public static string RemoveAccent(this string txt)
        {
            byte[] bytes = System.Text.Encoding.GetEncoding("Cyrillic").GetBytes(txt);
            return System.Text.Encoding.ASCII.GetString(bytes);
        }

        public static string ToVnDateTimeString(this DateTime date)
        {
            if (date == null)
            {
                return "";
            }
            var result = string.Format("{0: dd/MM/yyy}", date);
            return result;
        }

        /// <summary>
        /// @author:duynn
        /// @since: 10/08/2021
        /// </summary>
        /// <param name="date"></param>
        /// <returns></returns>
        public static string ToVnDateTimeString(this DateTime? date)
        {
            if (date == null)
            {
                return "";
            }
            var result = string.Format("{0: dd/MM/yyy}", date);
            return result;
        }
        /// <summary>
        /// Đổi từ Byte sang KB
        /// </summary>
        /// <param name="kichThuocByte"></param>
        /// <returns></returns>
        public static string GetShowKichThuocFile(decimal? kichThuocByte)
        {
            if (kichThuocByte == null)
            {
                return "0 KB";
            }

            var dataDB = kichThuocByte.Value / 1024;
            return dataDB.ToString("n0") + " KB";
        }

        public static bool Or<T>(this T source, params T[] val)
        {
            return val.Any(x => x.Equals(source));
        }

        public static bool IsEmpty(this string source)
        {
            if (source == null || string.IsNullOrEmpty(source))
            {
                return true;
            }
            return false;
        }


        public static bool IsValidString(this string str, bool IsHaveUnderScore = true)
        {
            string pattern;
            if (IsHaveUnderScore)
            {
                pattern = @"[!@#$%^&*()={}\[\]:;'<>,.?/\\|~`""+-_]";
            }
            else
            {
                pattern = @"[!@#$%^&*()={}\[\]:;'<>,.?/\\|~`""+-]";
            }
            Regex regex = new Regex(pattern);
            return !regex.IsMatch(str);
        }

        public static bool IsValidPassword(this string password)
        {
            if (string.IsNullOrEmpty(password)) return false;
            // Kiểm tra độ dài
            if (password.Length < 8)
            {
                return false;
            }

            // Kiểm tra chữ hoa, chữ thường và ký tự đặc biệt
            bool hasUpperCase = Regex.IsMatch(password, "[A-Z]");
            bool hasLowerCase = Regex.IsMatch(password, "[a-z]");
            bool hasSpecialChar = Regex.IsMatch(password, "[!@#$%^&*()_+\\-=[\\]{};':\"\\\\|,.<>/?]");

            // Trả về true nếu đáp ứng tất cả các yêu cầu
            return hasUpperCase && hasLowerCase && hasSpecialChar;
        }

        public static string ReplaceDashesExceptFirst(this string input)
        {
            // Tìm chỉ số của dấu gạch nối đầu tiên
            int firstDashIndex = input.IndexOf('-');

            // Nếu không có dấu gạch nối, trả về chuỗi gốc
            if (firstDashIndex == -1)
            {
                return input;
            }

            // Lấy phần trước dấu gạch nối đầu tiên (bao gồm dấu gạch nối đầu tiên)
            string firstPart = input.Substring(0, firstDashIndex + 1);

            // Lấy phần sau dấu gạch nối đầu tiên và thay thế tất cả dấu gạch nối còn lại thành ""
            string secondPart = input.Substring(firstDashIndex + 1).Replace("-", "");

            // Kết hợp lại phần đầu và phần sau
            return firstPart + secondPart;
        }

        //hàm xoá dấu tiếng việt cải tiến
        public static string RemoveDiacritics(this string input)
        {
            string normalizedString = input.Normalize(NormalizationForm.FormD);
            StringBuilder stringBuilder = new StringBuilder();

            foreach (char c in normalizedString)
            {
                UnicodeCategory unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }

        // Tạo code từ tên tiếng Việt
        public static string GenerateCode(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return string.Empty;

            // 1. Chuẩn hóa: loại bỏ dấu tiếng Việt
            string normalized = input.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();

            foreach (char c in normalized)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                    sb.Append(c);
            }

            string withoutDiacritics = sb.ToString().Normalize(NormalizationForm.FormC);

            // ✅ 1.5. Xử lý riêng chữ Đ và đ
            withoutDiacritics = withoutDiacritics
                .Replace('Đ', 'D')
                .Replace('đ', 'd');

            // 2. Loại bỏ ký tự không phải chữ/câu số
            string cleaned = Regex.Replace(withoutDiacritics, @"[^a-zA-Z0-9 ]", " ");

            // 3. Viết hoa chữ cái đầu và ghép lại
            var words = cleaned.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            var result = string.Concat(words.Select(word =>
                char.ToUpperInvariant(word[0]) + word.Substring(1).ToLowerInvariant()));

            return result;
        }



    }
}
