using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.MongoEntities.Common
{
    public interface IMAuditableEntity
    {
        DateTime CreatedDate { get; set; }

        string? CreatedBy { get; set; }
        string? CreatedId { get; set; }

        DateTime UpdatedDate { get; set; }
        string? UpdatedId { get; set; }
        string? UpdatedBy { get; set; }

        bool? IsDelete { get; set; }
        DateTime? DeleteTime { get; set; }
        string? DeletedId { get; set; }
    }
}
