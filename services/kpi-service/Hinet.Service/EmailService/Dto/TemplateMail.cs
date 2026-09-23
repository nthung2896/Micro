using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.EmailService.Dto
{
    public static class TemplateMail
    {
        public static string ThongBaoVuViecTemplate(ThongBaoVuViecDto dto)
        {
            return $@"<!DOCTYPE html>
                        <html lang=""vi"">
                          <head>
                            <meta charset=""UTF-8"" />
                            <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
                            <title>Thông báo vụ việc</title>
                          </head>
                          <body style=""margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, sans-serif;"">
                            <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" border=""0"" style=""background-color: #f4f6f8; padding: 30px 0;"">
                              <tr>
                                <td align=""center"">
                                  <table role=""presentation"" width=""700"" cellspacing=""0"" cellpadding=""0"" border=""0"" style=""background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);"">
                                    
                                    <!-- Header -->
                                    <tr>
                                      <td style=""background-color: #c62828; color: #ffffff; padding: 20px 30px; font-size: 24px; font-weight: bold;"">
                                        THÔNG BÁO VỤ VIỆC
                                      </td>
                                    </tr>
                        
                                    <!-- Nội dung -->
                                    <tr>
                                      <td style=""padding: 30px; color: #333333; font-size: 15px; line-height: 1.7;"">
                                        <p style=""margin: 0 0 16px 0;"">
                                          Kính gửi: <strong>${dto.PersonInChagrge}</strong>
                                        </p>
                        
                                        <p style=""margin: 0 0 16px 0;"">
                                          Chúng tôi xin thông báo về vụ việc như sau:
                                        </p>
                        
                                        <table role=""presentation"" width=""100%"" cellspacing=""0"" cellpadding=""0"" border=""0"" style=""border-collapse: collapse; margin-bottom: 20px;"">
                                          <tr>
                                            <td style=""width: 180px; padding: 10px; border: 1px solid #dddddd; background-color: #f9f9f9; font-weight: bold;"">
                                              Mã vụ việc
                                            </td>
                                            <td style=""padding: 10px; border: 1px solid #dddddd;"">
                                              [Mã vụ việc]
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style=""padding: 10px; border: 1px solid #dddddd; background-color: #f9f9f9; font-weight: bold;"">
                                              Thời gian xảy ra
                                            </td>
                                            <td style=""padding: 10px; border: 1px solid #dddddd;"">
                                              [Thời gian]
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style=""padding: 10px; border: 1px solid #dddddd; background-color: #f9f9f9; font-weight: bold;"">
                                              Địa điểm
                                            </td>
                                            <td style=""padding: 10px; border: 1px solid #dddddd;"">
                                              [Địa điểm]
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style=""padding: 10px; border: 1px solid #dddddd; background-color: #f9f9f9; font-weight: bold;"">
                                              Người liên quan
                                            </td>
                                            <td style=""padding: 10px; border: 1px solid #dddddd;"">
                                              [Danh sách người liên quan]
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style=""padding: 10px; border: 1px solid #dddddd; background-color: #f9f9f9; font-weight: bold;"">
                                              Nội dung vụ việc
                                            </td>
                                            <td style=""padding: 10px; border: 1px solid #dddddd;"">
                                              [Mô tả chi tiết vụ việc]
                                            </td>
                                          </tr>
                                          <tr>
                                            <td style=""padding: 10px; border: 1px solid #dddddd; background-color: #f9f9f9; font-weight: bold;"">
                                              Hướng xử lý
                                            </td>
                                            <td style=""padding: 10px; border: 1px solid #dddddd;"">
                                              [Phương án / đề xuất xử lý]
                                            </td>
                                          </tr>
                                        </table>
                        
                                        <p style=""margin: 0 0 16px 0;"">
                                          Đề nghị các bộ phận/cá nhân liên quan phối hợp xử lý và phản hồi trước thời hạn:
                                          <strong>[Thời hạn phản hồi]</strong>.
                                        </p>
                        
                                        <p style=""margin: 0 0 16px 0;"">
                                          Mọi thông tin bổ sung vui lòng liên hệ:
                                          <strong>[Tên người phụ trách]</strong> - <strong>[Số điện thoại / Email]</strong>.
                                        </p>
                        
                                        <p style=""margin: 24px 0 0 0;"">
                                          Trân trọng.
                                        </p>
                                      </td>
                                    </tr>
                        
                                    <!-- Footer -->
                                    <tr>
                                      <td style=""background-color: #f1f1f1; padding: 20px 30px; color: #666666; font-size: 13px; line-height: 1.6;"">
                                        <strong>[Tên cơ quan / đơn vị / công ty]</strong><br />
                                        Địa chỉ: [Địa chỉ]<br />
                                        Điện thoại: [Số điện thoại] | Email: [Email]
                                      </td>
                                    </tr>
                        
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </body>
                        </html>";
        }
    }
}
