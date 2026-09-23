namespace Hinet.Migration.Migrators;

/// <summary>
/// Báo cáo tiến độ trong quá trình migrate.
/// </summary>
public record MigrationProgress(
    string TableName,
    int Total,
    int Processed,
    int Inserted,
    int Skipped,
    int Errors,
    string? BatchInfo = null
);

public interface IMigrator
{
    string Name { get; }
    Task RunAsync(IProgress<MigrationProgress>? progress = null, CancellationToken ct = default);
}
