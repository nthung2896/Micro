using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonHelper.Extenions
{
    public static class CollectionExtension
    {
        public static int GetQuyHienTai()
        {
            var currentDate = DateTime.Now;
            var result = 1;
            if (currentDate.Month >= 1 && currentDate.Month <= 3)
            {
                result = 1;
            }
            else if (currentDate.Month >= 4 && currentDate.Month <= 6)
            {
                result = 2;
            }
            else if (currentDate.Month >= 7 && currentDate.Month <= 9)
            {
                result = 3;
            }
            else
            {
                result = 4;
            }
            return result;
        }


        public static bool IsNullOrEmpty<T>(this IEnumerable<T>? collection)
        {
            return collection == null || !collection.Any();
        }

        public static TSource FirstOrEmpty<TSource>(this IEnumerable<TSource> source) where TSource : new()
        {
            if (source == null || source.Any() == false)
            {
                return new TSource();
            }
            else
            {
                return source.First();
            }
        }
        public static TSource FirstOrEmpty<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate) where TSource : new()
        {
            if (source == null || source.Any() == false)
            {
                return new TSource();
            }

            var item = source.FirstOrDefault(predicate);
            if (item == null)
            {
                return new TSource();
            }
            return item;

        }

        public static DateTime? ToDateTimeCustom(this string? dateStr)
        {
            if (string.IsNullOrWhiteSpace(dateStr)) return null;

            string[] formats = {
            "dd-MMM-yyyy",
            "dd/MM/yyyy HH:mm",
            "dd/MM/yyyy",
            "dd/MM/yy HH:mm",
            "dd/MM/yy"
        };

            if (DateTime.TryParseExact(dateStr.Trim(), formats,
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None,
                out DateTime result))
            {
                return result;
            }

            return null;
        }

        public static TValue MaxOrDefault<TSource, TValue>(this IEnumerable<TSource> source, Func<TSource, TValue> predicate)
        {
            if (source == null || source.Any() == false)
            {
                return default;
            }

            return source.Max(predicate);
        }


        public static string ToCommaSeperatedString<T>(this IEnumerable<T> source) where T : IComparable, IFormattable, IConvertible
        {
            if (source != null)
            {
                var result = string.Join(",", source.ToArray());
                return result;
            }
            return string.Empty;
        }

        public static List<T> ToSingleList<T>(this T item)
        {
            return new List<T>() { item };
        }





        public static List<List<T>> ChunkBy<T>(this List<T> source, int chunkSize)
        {
            return source
                .Select((x, i) => new { Index = i, Value = x })
                .GroupBy(x => x.Index / chunkSize)
                .Select(x => x.Select(v => v.Value).ToList())
                .ToList();
        }


        public static object GetDefaultValueObject(string type)
        {
            var typeLoww = type.ToLower();
            return typeLoww switch
            {
                "int" => 0,
                "number" => 1,
                "string" => string.Empty,
                "bool" => false,
                "double" => false,
                "DateTime" => DateTime.MinValue,
                _ => null
            };
        }

    }
}
