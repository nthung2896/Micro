namespace Hinet.Service.AppUserService.Dto
{
    public class SyncRoleResultDto
    {
        public int TotalProcessed { get; set; }
        public int TotalAssigned { get; set; }
        public int TotalSkipped { get; set; }
        public int TotalFailed { get; set; }
        public List<string> Details { get; set; } = new();
    }
}
