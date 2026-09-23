using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Constant
{
    public class HolidayTypeConstant
    {
        [DisplayName("Ngày lễ định kỳ hằng năm")]
        public static string ANNUAL => "ANNUAL";

        [DisplayName("Ngày nghỉ phát sinh/đặc biệt")]
        public static string AD_HOC => "AD_HOC";

        public static string HolidayType => "HolidayType";
    }
}
