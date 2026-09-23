namespace Hinet.Api.Dto
{
    /// <summary>
    /// Một lần điểm danh trong JSON AttendanceHistory (mảng { date, by }).
    /// </summary>
    public class AttendanceHistoryEntry
    {
        public string Date { get; set; } = "";
        public string By { get; set; } = "";
    }
}
