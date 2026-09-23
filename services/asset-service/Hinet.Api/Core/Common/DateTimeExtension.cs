namespace Hinet.Api.Core.Common
{
    public static class DateTimeExtension
    {
        private static readonly TimeZoneInfo VietnamTimeZone =
          TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

        // Convert về giờ Việt Nam (UTC+7)
        public static DateTime ToVietnamTime(this DateTime dateTime)
        {
            if (dateTime.Kind == DateTimeKind.Unspecified)
            {
                // Giả sử giá trị FE gửi là UTC nhưng không có Kind rõ ràng
                dateTime = DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
            }

            return TimeZoneInfo.ConvertTime(dateTime, VietnamTimeZone);
        }
        // DateTime?
        public static DateTime? ToVietnamTime(this DateTime? dateTime)
        {
            if (!dateTime.HasValue)
                return null;

            return dateTime.Value.ToVietnamTime();
        }
    }
}
