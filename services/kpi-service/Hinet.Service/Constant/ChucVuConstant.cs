
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Constant
{
    public class ChucVuConstant
    {
        public static string ChuyenVien = "CV";
        public static string CVCC = "CVCC";
        public static string CVC = "CVC";
        public static string KTV = "KTV";
        public static string LD = "LD";
        public static string HD = "HD";
        public static string KySu = "KySu";
        public static string TP = "TP";
        public static string PhoTP = "PhoTP";
        public static string PhoTruongPhong = "PhoTruongPhong";
        public static string TruongPhong = "TruongPhong";
        public static string PhoCucTruong = "PhoCucTruong";
        public static string CucTruong = "CucTruong";
        public static string VuTruong = "VuTruong";
        public static string PhoVuTruong = "PhoVuTruong";
        public static string PhoGDTT = "PhoGDTT";
        public static string PhoGD = "PV";
        public static string GiamDoc = "GiamDoc";
        public static string GD = "GD";
        public static string PhoChanhVanPhong = "PHOCHANHVANPHONG";
        public static string ChanhVanPhong = "ChanhVanPhong";
        public static string QUYENGIAMDOC = "QUYENGIAMDOC";

        public static List<string> ChucVuChuyenVien = new List<string>()
        {
            ChucVuConstant.ChuyenVien,
            ChucVuConstant.CVC,
            ChucVuConstant.CVCC,
            ChucVuConstant.KTV,
            ChucVuConstant.KySu,
            ChucVuConstant.LD,
            ChucVuConstant.HD,
        };

        public static List<string> ChucVuPhoTruongPhong = new List<string>()
        {
            ChucVuConstant.PhoTP,
            ChucVuConstant.PhoTruongPhong,
        };

        public static List<string> ChucVuTruongPhong = new List<string>()
        {
            ChucVuConstant.TP,
            ChucVuConstant.TruongPhong,
        };

        public static List<string> ChucVuPhoVuTruong = new List<string>()
        {
            ChucVuConstant.PhoVuTruong,
            PhoChanhVanPhong,

        };

        public static List<string> ChucVuVuTruong = new List<string>()
        {
            ChucVuConstant.VuTruong,
            ChanhVanPhong,
        };

        public static List<string> ChucVuPhoCucTruong = new List<string>()
        {
            ChucVuConstant.PhoCucTruong,
        };

        public static List<string> ChucVuCucTruong = new List<string>()
        {
            ChucVuConstant.CucTruong,
        };

        public static List<string> ChucVuPhoGiamDoc = new List<string>()
        {
            ChucVuConstant.PhoGDTT,
            ChucVuConstant.PhoGD,
        };

        public static List<string> ChucVuGiamDoc = new List<string>()
        {
            ChucVuConstant.GiamDoc,
            ChucVuConstant.GD,
            QUYENGIAMDOC
        };

        public static List<string> LanhDaoCap2 = new List<string>()
        {
            ChucVuConstant.PhoVuTruong,
            ChucVuConstant.PhoGDTT,
            ChucVuConstant.PhoGD,
            ChucVuConstant.GiamDoc,
            ChucVuConstant.GD,
            ChucVuConstant.CucTruong,
            ChucVuConstant.PhoCucTruong,
            QUYENGIAMDOC,
            PhoChanhVanPhong,
            ChanhVanPhong,
        };
    }
}
