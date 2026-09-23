using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Constant
{
    public class ItemPermissionConstant
    {
        // Permission Types
        [DisplayName("Quyền xem")]
        public static string READ => "READ";

        [DisplayName("Quyền sửa")]
        public static string WRITE => "WRITE";

        [DisplayName("Quyền xóa")]
        public static string DELETE => "DELETE";

        [DisplayName("Quyền tải về")]
        public static string DOWNLOAD => "DOWNLOAD";

        [DisplayName("Thư mục")]
        public static string FOLDER => "FOLDER";

        [DisplayName("File")]
        public static string FILE => "FILE";

        public static string ICON_FOLDER => "FolderIcon";
        public static string ICON_FILE => "FileIcon";
        public static string ICON_PDF => "PdfIcon";
        public static string ICON_WORD => "WordIcon";
        public static string ICON_EXCEL => "ExcelIcon";
        public static string ICON_POWERPOINT => "PowerPointIcon";
        public static string ICON_IMAGE => "ImageIcon";
        public static string ICON_VIDEO => "VideoIcon";
        public static string ICON_AUDIO => "AudioIcon";
        public static string ICON_ARCHIVE => "ArchiveIcon";
        public static string ICON_TEXT => "TextIcon";
    }
}
