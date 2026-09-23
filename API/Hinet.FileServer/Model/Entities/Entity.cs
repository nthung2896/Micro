
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.FileServer.Model.Entities
{

    public class BaseEntity
    {
        public static bool operator ~(BaseEntity baseEntity) => baseEntity is not null;
    }


    public interface IEntity
    {
        public Guid Id { get; set; }
    }


    public class Entity : BaseEntity, IEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public Guid Id { get; set; }
    }
}
