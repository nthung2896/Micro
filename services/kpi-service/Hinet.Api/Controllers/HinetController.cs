using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Hinet.Controllers
{
    [ApiController]
    [Authorize]
    public class HinetController : ControllerBase
    {
        public HinetController() { }

        protected Guid? UserId
        {
            get
            {
                var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(id, out var userId))
                {
                    return userId;
                }
                return null;
            }
        }
        protected string FullName
        {
            get
            {
                return User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;
            }
        }

        protected string? MaTinh
        {
            get
            {
                return User.FindFirst("MaTinh")?.Value;
            }
        }

        protected Guid? DonViId
        {
            get
            {
                var id = User.FindFirst(ClaimTypes.Locality)?.Value;
                if (Guid.TryParse(id, out var donViId))
                    return donViId;
                return null;
            }
        }


        protected List<string>? Roles
        {
            get
            {
                var roleClaims = User.FindAll(ClaimTypes.Role).Select(c => c.Value).Where(v => !string.IsNullOrWhiteSpace(v)).ToList();
                if (roleClaims.Count > 1)
                    return roleClaims;

                var single = roleClaims.FirstOrDefault();
                if (string.IsNullOrWhiteSpace(single))
                    return new List<string>();

                return single.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            }
        }

        protected List<string> Permissions
        {
            get
            {
                var claim = User.FindFirst(ClaimTypes.Authentication)?.Value 
                            ?? User.FindFirst("authentication")?.Value;
                if (string.IsNullOrEmpty(claim))
                    return new List<string>();
                return claim.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            }
        }

        protected bool HasRole(string role)
        {
            var lstRole = Roles;
            return lstRole != null && lstRole.Any() && lstRole.Contains(role);
        }

        protected string Uri
        {
            get
            {
                var uriBuilder = new UriBuilder(Request.Scheme, Request.Host.Host, Request.Host.Port ?? -1);
                if (uriBuilder.Uri.IsDefaultPort)
                {
                    uriBuilder.Port = -1;
                }
                return uriBuilder.Uri.AbsoluteUri;
            }

        }

        protected IEnumerable<string> ModelStateError
                => ModelState.Values.SelectMany(v => v.Errors.Select(x => x.ErrorMessage));

    }


}