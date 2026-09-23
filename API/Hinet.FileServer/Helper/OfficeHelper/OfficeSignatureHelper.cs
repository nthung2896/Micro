using System.IO.Compression;

namespace Hinet.FileServer.Helper.OfficeHelper
{
    public class OfficeSignatureHelper
    {
        public static bool HasDigitalSignature(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath)) return false;
            if (!File.Exists(filePath)) return false;

            var ext = Path.GetExtension(filePath).ToLowerInvariant();
            if (ext != ".docx" && ext != ".xlsx" && ext != ".xlsm") return false;

            try
            {
                using var archive = ZipFile.OpenRead(filePath);

                foreach (var entry in archive.Entries)
                {
                    var name = entry.FullName.ToLowerInvariant();

                    // 1️⃣ Office XML Signature (legacy)
                    if (name.StartsWith("_xmlsignatures/"))
                        return true;

                    // 2️⃣ OPC Digital Signature (Office mới)
                    if (name.StartsWith("package/services/digital-signature/"))
                        return true;

                    // 3️⃣ OPC signature parts
                    if (name.EndsWith(".psdsxs") || name.EndsWith(".psdsor"))
                        return true;

                    // 4️⃣ VBA signature
                    if (name == "vbaprojectsignature.bin")
                        return true;

                    // 5️⃣ Có macro (thường đã hoặc sẽ được ký)
                    if (name == "vbaproject.bin")
                        return true;

                    // 6️⃣ Relationship trỏ tới digital-signature
                    if (name.EndsWith(".rels") && EntryContainsDigitalSignature(entry))
                        return true;
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        private static bool EntryContainsDigitalSignature(ZipArchiveEntry entry)
        {
            try
            {
                using var stream = entry.Open();
                using var reader = new StreamReader(stream);
                var content = reader.ReadToEnd();

                return content.Contains("digital-signature", StringComparison.OrdinalIgnoreCase)
                    || content.Contains("xml-signature", StringComparison.OrdinalIgnoreCase);
            }
            catch
            {
                return false;
            }
        }

    }
}
