using Microsoft.AspNetCore.Identity;

namespace IdentityService.Entities
{
    public class AppUser : IdentityUser<Guid>
    {
        public string? FullName { get; set; }
        public string? Avatar { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }

    public class AppRole : IdentityRole<Guid>
    {
        public string? Description { get; set; }
    }
}
