using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using Hinet.Service.Dto;

namespace Hinet.Api.Core.Permission
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = true, AllowMultiple = true)]
    public class RequiredPermissionAttribute : AuthorizeAttribute, IAuthorizationFilter
    {
        private readonly string[] permissions;

        public RequiredPermissionAttribute(params string[] permissions)
        {
            this.permissions = permissions;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var name = context.HttpContext?.User?.FindFirst(ClaimTypes.Authentication)?.Value;
            if (name != null)
            {
                var namePermissions = name.Split(',');

                if (!permissions.All(p => namePermissions.Contains(p)))
                {
                    context.Result = new ForbidResult();
                }
            }
            else
            {
                context.Result = new ForbidResult();
            }
        }
    }
}
