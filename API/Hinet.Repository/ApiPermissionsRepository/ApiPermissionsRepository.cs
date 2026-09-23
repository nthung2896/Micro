using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.ApiPermissionsRepository
{
    public class ApiPermissionsRepository : Repository<ApiPermissions>, IApiPermissionsRepository
    {
        public ApiPermissionsRepository(DbContext context) : base(context)
        {
        }
    }
}
