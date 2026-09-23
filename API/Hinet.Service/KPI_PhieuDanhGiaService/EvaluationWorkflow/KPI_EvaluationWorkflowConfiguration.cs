using System;
using System.Collections.Generic;
using System.Linq;
using Hinet.Service.KPI_PhieuDanhGiaService.Constant;
using Hinet.Service.KPI_PhieuDanhGiaService.Dto;

namespace Hinet.Service.KPI_PhieuDanhGiaService.EvaluationWorkflow
{
    /// <summary>
    /// Cấu hình chỉ dùng cho màn hình theo dõi đánh giá. Cấu hình này không thay đổi
    /// các mảng chức vụ hay quy trình chuyển trạng thái phiếu hiện hữu.
    /// </summary>
    public static class KPI_EvaluationWorkflowConfiguration
    {
        private static readonly IReadOnlyList<EvaluationWorkflowDefinition> Workflows =
            new List<EvaluationWorkflowDefinition>
            {
                new(
                    "KhoiCoQuanChiNhanh",
                    new[]
                    {
                        Step("PhoTruongPhong", "Phó Trưởng phòng đánh giá", 1, "#0284c7", TrangThaiPhieuConstant.GuiPhoTruongPhong, "PhoTruongPhong"),
                        Step("TruongPhong", "Trưởng phòng đánh giá", 2, "#7c3aed", TrangThaiPhieuConstant.GuiTruongPhong, "TruongPhong"),
                        Step("PhoCucTruong", "Phó Cục trưởng đánh giá", 3, "#c026d3", TrangThaiPhieuConstant.GuiPhoCucTruong, "PhoCucTruong"),
                        Step("CucTruong", "Cục trưởng đánh giá", 4, "#d97706", TrangThaiPhieuConstant.GuiCucTruong, "CucTruong"),
                    }),
                new(
                    "VU",
                    new[]
                    {
                        Step("PHOVUTRUONG", "Phó Vụ trưởng đánh giá", 1, "#0284c7", TrangThaiPhieuConstant.GuiPhoVuTruong, "PhoVuTruong"),
                        Step("VUTRUONG", "Vụ trưởng đánh giá", 2, "#0f766e", TrangThaiPhieuConstant.GuiVuTruong, "VuTruong"),
                    }),
                new(
                    "TRUNG_TAM",
                    new[]
                    {
                        Step("PhoTruongPhong", "Phó Trưởng phòng đánh giá", 1, "#0284c7", TrangThaiPhieuConstant.GuiPhoTruongPhong, "PhoTruongPhong"),
                        Step("TruongPhong", "Trưởng phòng đánh giá", 2, "#7c3aed", TrangThaiPhieuConstant.GuiTruongPhong, "TruongPhong"),
                        Step("PV", "Phó Giám đốc đánh giá", 3, "#c026d3", TrangThaiPhieuConstant.GuiPhoGiamDocTT, "PhoGiamDocTT"),
                        Step("QUYENGIAMDOC", "Quyền Giám đốc đánh giá", 4, "#d97706", TrangThaiPhieuConstant.GuiGiamDocTT, "GiamDocTT"),
                    }),
                new(
                    "PHONG_BAN",
                    new[]
                    {
                        Step("PhoTruongPhong", "Phó Trưởng phòng đánh giá", 1, "#0284c7", TrangThaiPhieuConstant.GuiPhoTruongPhong, "PhoTruongPhong"),
                        Step("TruongPhong", "Trưởng phòng đánh giá", 2, "#7c3aed", TrangThaiPhieuConstant.GuiTruongPhong, "TruongPhong"),
                        Step("PHOCHANHVANPHONG", "Phó Chánh Văn phòng đánh giá", 3, "#c026d3", TrangThaiPhieuConstant.GuiPhoChanhVanPhong, "PhoChanhVanPhong"),
                        Step("ChanhVanPhong", "Chánh Văn phòng đánh giá", 4, "#d97706", TrangThaiPhieuConstant.GuiChanhVanPhong, "ChanhVanPhong"),
                    }),
            };

        public static IReadOnlyCollection<string> ScoreRoleCodes => Workflows
            .SelectMany(x => x.Steps)
            .Select(x => x.ScoreRoleCode)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        public static bool TryResolve(string? organizationType, string? callerRole, out EvaluationWorkflowResolution resolution)
        {
            resolution = null!;
            var workflow = Workflows.FirstOrDefault(x => EqualCode(x.OrganizationType, organizationType));
            if (workflow == null)
            {
                return false;
            }

            var callerStepIndex = workflow.Steps
                .Select((step, index) => new { step, index })
                .FirstOrDefault(x => EqualCode(x.step.RoleCode, callerRole))
                ?.index;

            if (!callerStepIndex.HasValue)
            {
                return false;
            }

            var lastVisibleIndex = Math.Min(callerStepIndex.Value + 1, workflow.Steps.Count - 1);
            resolution = new EvaluationWorkflowResolution(
                workflow.OrganizationType,
                workflow.Steps.Take(lastVisibleIndex + 1).ToArray());
            return true;
        }

        public static bool RoleMatchesScoreCode(string? storedRoleCode, string scoreRoleCode)
        {
            return Workflows.SelectMany(x => x.Steps)
                .Where(x => EqualCode(x.ScoreRoleCode, scoreRoleCode))
                .Any(x => EqualCode(x.RoleCode, storedRoleCode));
        }

        public static bool TryGetScoreRoleCode(string? roleCode, out string scoreRoleCode)
        {
            var step = Workflows.SelectMany(x => x.Steps)
                .FirstOrDefault(x => EqualCode(x.RoleCode, roleCode));
            if (step == null)
            {
                scoreRoleCode = string.Empty;
                return false;
            }

            scoreRoleCode = step.ScoreRoleCode;
            return true;
        }

        private static EvaluationWorkflowStep Step(
            string roleCode,
            string title,
            int order,
            string color,
            string targetStatus,
            string scoreRoleCode)
        {
            return new EvaluationWorkflowStep(roleCode, title, order, color, targetStatus, scoreRoleCode);
        }

        private static bool EqualCode(string? left, string? right)
        {
            return string.Equals(NormalizeCode(left), NormalizeCode(right), StringComparison.Ordinal);
        }

        private static string NormalizeCode(string? value)
        {
            return string.IsNullOrWhiteSpace(value)
                ? string.Empty
                : new string(value.Trim().Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();
        }
    }

    public sealed record EvaluationWorkflowDefinition(string OrganizationType, IReadOnlyList<EvaluationWorkflowStep> Steps);

    public sealed record EvaluationWorkflowStep(
        string RoleCode,
        string Title,
        int Order,
        string Color,
        string TargetStatus,
        string ScoreRoleCode)
    {
        public EvaluationColumnDto ToColumnDto() => new()
        {
            RoleCode = RoleCode,
            Title = Title,
            Order = Order,
            Color = Color,
            TargetStatus = TargetStatus,
            ViewRoleCode = ScoreRoleCode,
        };
    }

    public sealed record EvaluationWorkflowResolution(string OrganizationType, IReadOnlyList<EvaluationWorkflowStep> VisibleSteps)
    {
        public IReadOnlyList<EvaluationColumnDto> VisibleColumns => VisibleSteps.Select(x => x.ToColumnDto()).ToArray();
    }
}
