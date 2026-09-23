using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Common.Dtos
{
    public class TableDataContent
    {
        public List<TableHeaderColumn> tableHeaders { get; set; }
        public TableBodyRow BodyRow { get; set; }
        public string? HtmlTable { get; set; }
    }
    public class TableHeaderColumn
    {
        public string label { get; set; }
        public string valueCell { get; set; }

        public bool? IsDownload { get; set; }
    }

    public class TableBodyRow
    {
        public object DataBody { get; set; }
    }

}
