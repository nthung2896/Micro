using Hinet.Model.Entities;

namespace Hinet.Service.KPI_DotTheoDoiDanhGiaService;

public enum CreateCurrentMonthStatus
{
    Created,
    AlreadyExists,
    MissingCriteria
}

public sealed class CreateCurrentMonthIfMissingResult
{
    private CreateCurrentMonthIfMissingResult(
        CreateCurrentMonthStatus status,
        bool missingCommonCriteria = false,
        bool missingUnitCriteria = false,
        KPI_DotTheoDoiDanhGia? evaluationBatch = null)
    {
        Status = status;
        MissingCommonCriteria = missingCommonCriteria;
        MissingUnitCriteria = missingUnitCriteria;
        EvaluationBatch = evaluationBatch;
    }

    public CreateCurrentMonthStatus Status { get; }

    public bool MissingCommonCriteria { get; }

    public bool MissingUnitCriteria { get; }

    public KPI_DotTheoDoiDanhGia? EvaluationBatch { get; }

    public static CreateCurrentMonthIfMissingResult Created(KPI_DotTheoDoiDanhGia evaluationBatch) =>
        new(CreateCurrentMonthStatus.Created, evaluationBatch: evaluationBatch);

    public static CreateCurrentMonthIfMissingResult AlreadyExists() =>
        new(CreateCurrentMonthStatus.AlreadyExists);

    public static CreateCurrentMonthIfMissingResult MissingCriteria(
        bool missingCommonCriteria,
        bool missingUnitCriteria) =>
        new(
            CreateCurrentMonthStatus.MissingCriteria,
            missingCommonCriteria,
            missingUnitCriteria);
}
