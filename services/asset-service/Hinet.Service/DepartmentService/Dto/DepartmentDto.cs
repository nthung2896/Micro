using Hinet.Model.Entities;
using System.ComponentModel;

namespace Hinet.Service.DepartmentService.Dto
{
    public class DepartmentDto : Department
    {
        public List<DepartmentUser> Users { get; set; } = new List<DepartmentUser>();

    }
    public class DepartmentTree : Department
    {
        public List<DepartmentTree>? Children { get; set; } = new List<DepartmentTree>();
    }

    public class DepartmentUser
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }

    public class DepartmentExport
    {

        public int STT { get; set; }
        [DisplayName("Tên")]
        public string Name { get; set; }
        [DisplayName("Mã")]
        public string Code { get; set; }
        [DisplayName("Trạng thái")]
        public string Status { get; set; }

        [DisplayName("Tổ chức/đơn vị cha")]
        public string Parent { get; set; }
        [DisplayName("Ngày tạo")]
        public string CreatedDate { get; set; }
    }
    public class TreeNode
    {
        public string Id { get; set; } = null!;

        public string Title { get; set; } = null!;

        public string Code { get; set; } = null!;

        public string? ShortName { get; set; }

        public string? DiaDanh { get; set; }

        public string? ParentId { get; set; }

        public int Priority { get; set; }

        public int Level { get; set; }

        public string Loai { get; set; } = null!;

        public bool IsActive { get; set; }

        public string? CapBac { get; set; }

        public string? MaTinh { get; set; }

        public List<TreeNode>? Children { get; set; }

        public int? SoNgayTiepTrenThang { get; set; }
    }

}
