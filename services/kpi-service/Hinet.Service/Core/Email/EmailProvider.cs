using System.Net.Mail;
using System.Net;
using Hinet.Extensions;
using System.Web;
using System.Text.RegularExpressions;

namespace Hinet.Core.Email
{
    public class EmailProvider
    {
        //public static bool SendEmail(string body, string subject, string address)
        //{
        //    try
        //    {
        //        SmtpClient server = new SmtpClient();
        //        using (MailMessage mail = new MailMessage())
        //        {
        //            mail.From = new MailAddress(AppSettings.Mail.From, AppSettings.Mail.Alias);
        //            mail.To.Add(address);
        //            mail.Subject = subject;
        //            mail.Body = body;
        //            mail.IsBodyHtml = true;
        //            //ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls;
        //            using (SmtpClient smtp = new SmtpClient(AppSettings.Mail.Host, AppSettings.Mail.Port))
        //            {
        //                smtp.Credentials = new NetworkCredential(AppSettings.Mail.From, AppSettings.Mail.Password);
        //                smtp.EnableSsl = AppSettings.Mail.EnableSsl;
        //                smtp.Send(mail);
        //            }
        //        }
        //        return true;
        //    }
        //    catch (Exception)
        //    {
        //        return false;
        //    }
        //}

        //public static bool SendMailCofirmEmail(string address, string token, string baseUri)
        //{
        //    var body = GetMailBody("Register.html");
        //    var url = $"{baseUri}confirmEmail?email={HttpUtility.UrlEncode(address)}&token={HttpUtility.UrlEncode(token)}";
        //    body = body.Replace("[[url]]", url);
        //    return SendEmail(body, "Confirm email", address);
        //}


        //public static bool SendMailResetPassword(string address, string password, string baseUri)
        //{
        //    var body = GetMailBody("ResetPassword.html");
        //    body = body.Replace("[[password]]", password);
        //    return SendEmail(body, "Reset password", address);
        //}

        public static string GetMailBody(string fileName)
        {
            return File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), $"Core/Email/Templete/{fileName}"));
        }
        public static string BindingDataToMailContent<T>(object dataObj, string content) where T : class
        {
            if (!string.IsNullOrEmpty(content))
            {
                var listkey = Regex.Matches(content, @"\{\{[a-zA-Z0-9]{3,}\}\}");

                if (listkey != null && listkey.Count > 0)
                {
                    foreach (var item in listkey)
                    {
                        var propertyMath = Regex.Match(item.ToString(), @"^\{\{(?<pkey>[a-zA-Z0-9]{3,})\}\}$");
                        if (propertyMath.Success)
                        {
                            var propertyName = propertyMath.Groups["pkey"].ToString();

                            if (!string.IsNullOrEmpty(propertyName))
                            {
                                var valueProperty = string.Empty;
                                var data = dataObj as T;
                                var property = typeof(T).GetProperty(propertyName);
                                if (property != null)
                                {
                                    if (property.GetValue(data, null) != null)
                                    {
                                        valueProperty = property.GetValue(data, null).ToString();
                                    }
                                }
                                content = content.Replace(item.ToString(), valueProperty);
                            }
                        }
                        else
                        {
                            content = content.Replace(item.ToString(), string.Empty);
                        }
                    }
                }
            }
            return content;
        }
    }
}
