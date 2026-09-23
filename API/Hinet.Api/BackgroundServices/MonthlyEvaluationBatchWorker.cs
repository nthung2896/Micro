using Hinet.Service.KPI_DotTheoDoiDanhGiaService;

namespace Hinet.Api.BackgroundServices;

public sealed class MonthlyEvaluationBatchWorker : BackgroundService
{
    private static readonly TimeSpan VietnamUtcOffset = TimeSpan.FromHours(7);
    private static readonly TimeSpan DailyRunTime = TimeSpan.FromMinutes(5);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<MonthlyEvaluationBatchWorker> _logger;
    private readonly TimeProvider _timeProvider;

    public MonthlyEvaluationBatchWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<MonthlyEvaluationBatchWorker> logger,
        TimeProvider? timeProvider = null)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _timeProvider = timeProvider ?? TimeProvider.System;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await RunOnceSafelyAsync(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            var delay = GetDelayUntilNextRunUtc(_timeProvider.GetUtcNow());

            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }

            if (!stoppingToken.IsCancellationRequested)
            {
                await RunOnceSafelyAsync(stoppingToken);
            }
        }
    }

    public static TimeSpan GetDelayUntilNextRunUtc(DateTimeOffset utcNow)
    {
        var localNow = utcNow.ToOffset(VietnamUtcOffset);
        var nextLocalDate = localNow.Date;

        if (localNow.TimeOfDay >= DailyRunTime)
        {
            nextLocalDate = nextLocalDate.AddDays(1);
        }

        var nextLocalRun = new DateTimeOffset(nextLocalDate.Add(DailyRunTime), VietnamUtcOffset);
        var delay = nextLocalRun - utcNow;

        return delay > TimeSpan.Zero ? delay : TimeSpan.FromDays(1);
    }

    private async Task RunOnceSafelyAsync(CancellationToken stoppingToken)
    {
        try
        {
            stoppingToken.ThrowIfCancellationRequested();

            using var scope = _scopeFactory.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IKPI_DotTheoDoiDanhGiaService>();
            var currentVietnamTime = _timeProvider.GetUtcNow().ToOffset(VietnamUtcOffset).DateTime;
            var result = await service.CreateCurrentMonthIfMissingAsync(currentVietnamTime, stoppingToken);

            switch (result.Status)
            {
                case CreateCurrentMonthStatus.Created:
                    _logger.LogInformation(
                        "Đã tự động tạo đợt đánh giá tháng {Month} năm {Year} với bộ tiêu chí chung {CommonCriteriaId} và bộ tiêu chí đơn vị {UnitCriteriaId}.",
                        result.EvaluationBatch?.Thang,
                        result.EvaluationBatch?.Nam,
                        result.EvaluationBatch?.DefaultTieuChiChung,
                        result.EvaluationBatch?.DefaultTieuChiDonVi);
                    break;

                case CreateCurrentMonthStatus.AlreadyExists:
                    _logger.LogInformation(
                        "Đợt đánh giá tháng hiện tại đã tồn tại; bỏ qua việc tạo mới.");
                    break;

                case CreateCurrentMonthStatus.MissingCriteria:
                    if (result.MissingCommonCriteria)
                    {
                        _logger.LogWarning(
                            "Chưa tạo đợt đánh giá tháng hiện tại vì chưa có bộ tiêu chí chung đang hoạt động.");
                    }

                    if (result.MissingUnitCriteria)
                    {
                        _logger.LogWarning(
                            "Chưa tạo đợt đánh giá tháng hiện tại vì chưa có bộ tiêu chí đơn vị chưa khóa.");
                    }
                    break;
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Shutdown bình thường, không ghi lỗi.
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Lỗi ngoài dự kiến khi tự động tạo đợt đánh giá tháng hiện tại. Worker sẽ thử lại ở lượt kế tiếp.");
        }
    }
}
