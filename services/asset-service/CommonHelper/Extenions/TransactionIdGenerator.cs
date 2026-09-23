using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace CommonHelper.Extenions
{
    public static class TransactionIdGenerator
    {
        private static readonly RandomNumberGenerator Rng = RandomNumberGenerator.Create();

        public static string GenerateEcoRef()
        {
            const string prefix = "ECO";

            string timePart = ToBase36(DateTime.UtcNow.Ticks);

            byte[] randomBytes = new byte[4];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }

            string randomPart = ToBase36(BitConverter.ToUInt32(randomBytes, 0)).PadLeft(6, '0');

            return $"{prefix}{timePart}{randomPart}".ToUpper();
        }

        private static string ToBase36(long value)
        {
            const string chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            string result = "";
            while (value > 0)
            {
                result = chars[(int)(value % 36)] + result;
                value /= 36;
            }
            return result;
        }
    }
}
