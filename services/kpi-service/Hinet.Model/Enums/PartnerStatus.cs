using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Enums
{
    public enum PartnerStatus
    {
        Active = 1,
        Inactive = 2,
        Expired = 3
    }
    public enum MouApprovalStatus
    {
        Draft = 0,                 // Nháp
        AwaitingBVApproval = 1,    // Chờ duyệt BV
        BVApproved = 2,            // BV đã duyệt
        AwaitingBYTApproval = 3,   // Chờ duyệt BYT
        BYTResponded = 4,          // BYT đã phản hồi
        AwaitingCeremony = 5,      // Chờ tổ chức lễ ký
        Signed = 6,                // Đã ký
        Completed = 7,             // Hoàn thành
        Rejected = 8,              // Từ chối
        Cancelled = 9              // Hủy
    }

    public enum FileCategory
    {
        PartnerLogo = 1,
        OfficialDispatch = 2,           // Công văn
        SignerPassportOrCv = 3,         // CV / Passport người ký MOU
        LegalDocument = 4,              // Giấy tờ pháp lý / giấy phép
        SignedMouScan = 5,              // File scan MOU đã ký
        MinistrySubmissionForm = 6,     // BM04 xin phép
        MinistryOpinionAttachment = 7,  // File ý kiến BYT
        OrganizationPlan = 8,           // Kế hoạch tổ chức
        DiplomaticBudget = 9,           // Dự toán công tác ngoại giao
        SponsorshipContract = 10,       // Hợp đồng tài trợ
        Presentation = 11,              // Bài trình bày
        IntroductionVideo = 12,         // Video giới thiệu
        Speech = 13,                    // Bài phát biểu
        InterpretationDocument = 14,    // Phiên dịch
        Other = 99
    }
}
