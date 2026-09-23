using System;
using System.Data;
using System.IO;
using Dapper;
using Hinet.Migration.OldModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hinet.Migration.Migrators;

// Migrate dbo.AppInfoFileAttach (SQL Server) → public."TaiLieuDinhKem" (Postgres)
public class AppFileMigrator : IMigrator
{
    private readonly string _oldConnStr;
    private readonly string _newConnStr;
    private readonly int _batchSize;
    private readonly bool _dryRun;
    private readonly ILogger<AppFileMigrator> _log;

    public string Name => "AppFile";

    public AppFileMigrator(IConfiguration cfg, ILogger<AppFileMigrator> log)
    {
        _oldConnStr = cfg.GetConnectionString("OldSqlServer")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:OldSqlServer");
        _newConnStr = cfg.GetConnectionString("NewPostgres")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:NewPostgres");
        _batchSize = cfg.GetValue<int?>("Migration:BatchSize") ?? 500;
        _dryRun = cfg.GetValue<bool?>("Migration:DryRun") ?? false;
        _log = log;
    }

    public async Task RunAsync(IProgress<MigrationProgress>? progress = null, CancellationToken ct = default)
    {
        _log.LogInformation("=== Bắt đầu migrate AppFile (DryRun={DryRun}, Batch={Batch}) ===",
            _dryRun, _batchSize);

        await using var oldDb = new SqlConnection(_oldConnStr);
        await oldDb.OpenAsync(ct);

        await using var newDb = new NpgsqlConnection(_newConnStr);
        await newDb.OpenAsync(ct);

        // Đảm bảo bảng map AppInfo đã có dữ liệu
        var appMapCount = await newDb.ExecuteScalarAsync<long>(
            "SELECT COUNT(*) FROM _migration.app_id_map");
        if (appMapCount == 0)
        {
            _log.LogError("app_id_map rỗng. Cần chạy đồng bộ AppInfo trước khi đồng bộ AppFile.");
            return;
        }

        var totalOld = await oldDb.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM dbo.AppInfoFileAttach");
        _log.LogInformation("Tổng dòng tài liệu AppInfoFileAttach cũ: {Total}", totalOld);

        long lastId = 0;
        int processed = 0, inserted = 0, skipped = 0, missingApp = 0, errors = 0;

        while (true)
        {
            ct.ThrowIfCancellationRequested();

            var batch = (await oldDb.QueryAsync<OldAppInfoFileAttach>(@"
                SELECT TOP (@Take)
                    Id, Name, FileName, Note, flag, Type, TaiLieuNhayCam, NoiDungTuKhoa, WebsiteId, FileIndex,
                    CreatedDate, CreatedBy, CreatedID,
                    UpdatedDate, UpdatedBy, UpdatedID
                FROM dbo.AppInfoFileAttach
                WHERE Id > @LastId
                ORDER BY Id",
                new { Take = _batchSize, LastId = lastId })).ToList();

            if (batch.Count == 0) break;

            foreach (var old in batch)
            {
                processed++;
                lastId = old.Id;

                try
                {
                    // === Idempotent check ===
                    var existingNewId = await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.app_file_id_map WHERE old_id=@id",
                        new { id = old.Id });
                    if (existingNewId.HasValue)
                    {
                        skipped++;
                        continue;
                    }

                    // === Lookup ItemId (tương ứng PlatformManage.Id) ===
                    var platformManageId = await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.app_id_map WHERE old_id=@id",
                        new { id = old.WebsiteId }); // Cột trong SQL Server vẫn tên là WebsiteId

                    if (!platformManageId.HasValue)
                    {
                        missingApp++;
                        await LogErrorAsync(newDb, old.Id, $"Không tìm thấy App mapping cho WebsiteId (AppId)={old.WebsiteId}");
                        continue;
                    }

                    var newId = Guid.NewGuid();

                    // === Lookup User ===
                    var createdId = await LookupUserAsync(newDb, old.CreatedID);
                    var updatedId = await LookupUserAsync(newDb, old.UpdatedID);

                    if (_dryRun)
                    {
                        inserted++;
                        continue;
                    }

                    // === INSERT vào TaiLieuDinhKem ===
                    await using var tx = await newDb.BeginTransactionAsync(ct);
                    await newDb.ExecuteAsync(@"
                        INSERT INTO public.""TaiLieuDinhKem"" (
                            ""Id"", ""KichThuoc"", ""TenTaiLieu"", ""LoaiTaiLieu"", ""ItemId"",
                            ""DuongDanFile"", ""DuongDanFilePDF"", ""Extension"", ""UserId"", ""TenTaiLieuText"",
                            ""CreatedDate"", ""CreatedBy"", ""CreatedId"",
                            ""UpdatedDate"", ""UpdatedBy"", ""UpdatedId"",
                            ""IsDeleted"", ""DeletedDate"", ""DeletedId""
                        ) VALUES (
                            @Id, @KichThuoc, @TenTaiLieu, @LoaiTaiLieu, @ItemId,
                            @DuongDanFile, @DuongDanFilePDF, @Extension, @UserId, @TenTaiLieuText,
                            @CreatedDate, @CreatedBy, @CreatedId,
                            @UpdatedDate, @UpdatedBy, @UpdatedId,
                            FALSE, NULL, NULL
                        )",
                        new
                        {
                            Id = newId,
                            KichThuoc = (long?)null,
                            TenTaiLieu = Truncate(old.Name ?? (string.IsNullOrEmpty(old.FileName) ? "" : Path.GetFileName(old.FileName)), 500),
                            LoaiTaiLieu = Truncate(old.Note, 250),
                            ItemId = platformManageId.Value,
                            DuongDanFile = old.FileName ?? "",
                            DuongDanFilePDF = "",
                            Extension = Truncate(string.IsNullOrEmpty(old.FileName) ? "" : Path.GetExtension(old.FileName), 250),
                            UserId = createdId,
                            TenTaiLieuText = Truncate(old.Name ?? "", 500),
                            CreatedDate = NormalizeDate(old.CreatedDate),
                            old.CreatedBy,
                            CreatedId = createdId,
                            UpdatedDate = NormalizeDate(old.UpdatedDate == default ? old.CreatedDate : old.UpdatedDate),
                            old.UpdatedBy,
                            UpdatedId = updatedId
                        }, transaction: tx);

                    await newDb.ExecuteAsync(@"
                        INSERT INTO _migration.app_file_id_map (old_id, new_id)
                        VALUES (@OldId, @NewId)",
                        new { OldId = old.Id, NewId = newId }, transaction: tx);

                    await tx.CommitAsync(ct);
                    inserted++;
                }
                catch (Exception ex)
                {
                    errors++;
                    _log.LogError(ex, "Lỗi migrate AppFile Id={OldId}", old.Id);
                    if (!_dryRun)
                    {
                        await LogErrorAsync(newDb, old.Id, ex.Message);
                    }
                }
            }

            _log.LogInformation(
                "Tiến độ: processed={Processed}/{Total} inserted={Inserted} skipped={Skipped} missingApp={Missing} errors={Errors} lastId={LastId}",
                processed, totalOld, inserted, skipped, missingApp, errors, lastId);

            progress?.Report(new MigrationProgress("AppFile", totalOld, processed, inserted, skipped, errors,
                $"missingApp={missingApp} lastId={lastId}"));
        }

        progress?.Report(new MigrationProgress("AppFile", totalOld, totalOld, inserted, skipped, errors, "✅ Done"));
        _log.LogInformation(
            "=== Hoàn tất AppFile: processed={Processed} inserted={Inserted} skipped={Skipped} missingApp={Missing} errors={Errors} ===",
            processed, inserted, skipped, missingApp, errors);
    }

    private static string? Truncate(string? value, int maxLength)
    {
        if (string.IsNullOrEmpty(value)) return value;
        return value.Length > maxLength ? value.Substring(0, maxLength) : value;
    }

    private static DateTime NormalizeDate(DateTime d) =>
        d < new DateTime(1900, 1, 1) ? DateTime.UtcNow : d;

    private static async Task<Guid?> LookupUserAsync(IDbConnection newDb, long? oldUserId)
    {
        if (!oldUserId.HasValue) return null;
        return await newDb.ExecuteScalarAsync<Guid?>(
            @"SELECT new_id FROM _migration.user_id_map WHERE old_id=@id",
            new { id = oldUserId.Value });
    }

    private static async Task LogErrorAsync(IDbConnection newDb, long oldId, string reason)
    {
        try
        {
            await newDb.ExecuteAsync(@"
                INSERT INTO _migration.error_log (table_name, old_id, reason)
                VALUES (@T, @Id, @Reason)",
                new { T = "AppFile", Id = oldId, Reason = reason });
        }
        catch { }
    }
}
