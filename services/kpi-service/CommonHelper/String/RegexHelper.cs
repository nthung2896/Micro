using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace CommonHelper.String
{
    public class RegexHelper
    {
        public static List<string> ExtractKey(string content)
        {
            var matches = Regex.Matches(content, @"\[(.*?)\]");
            List<string> result = new List<string>();
            foreach (Match match in matches)
            {
                result.Add(match.Groups[1].Value);
            }
            return result;
        }
    }
}
