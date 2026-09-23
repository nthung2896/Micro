-- =====================================================================
-- Tạo bảng DvcSyncLog — Lịch sử đồng bộ DVC
-- =====================================================================
-- Cách chạy:
--   psql -h 113.20.123.20 -p 4133 -U postgres -d OnlineGovVn -f "API/Hinet.Migration/Sql/002_create_dvcsync_log_table.sql"
-- Hoặc dùng pgAdmin → Query Tool → paste nội dung này → Execute.
-- =====================================================================

CREATE TABLE IF NOT EXISTS "DvcSyncLog" (
    "Id"                UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
    "ActionType"        VARCHAR(50)     NOT NULL,
    "RequestUrl"        VARCHAR(1000)   NOT NULL,
    "RequestBody"       TEXT,
    "ResponseBody"      TEXT,
    "StatusCode"        INTEGER         NOT NULL,
    "IsSuccess"         BOOLEAN         NOT NULL,
    "ErrorMessage"      TEXT,
    "DurationMs"        BIGINT          NOT NULL DEFAULT 0,
    "RetryCount"        INTEGER         NOT NULL DEFAULT 0,
    "MaxRetry"          INTEGER         NOT NULL DEFAULT 3,
    "MaHoSo"            VARCHAR(100),
    "IdHoSo"            VARCHAR(100),

    -- Audit fields (kế thừa từ AuditableEntity)
    "CreatedDate"       TIMESTAMP       NOT NULL DEFAULT NOW(),
    "CreatedBy"         VARCHAR(256),
    "CreatedId"         UUID,
    "UpdatedDate"       TIMESTAMP       NOT NULL DEFAULT NOW(),
    "UpdatedBy"         VARCHAR(256),
    "UpdatedId"         UUID,
    "IsDeleted"         BOOLEAN         NOT NULL DEFAULT FALSE,
    "DeletedDate"       TIMESTAMP,
    "DeletedId"         UUID
);

-- Index cho filter & search
CREATE INDEX IF NOT EXISTS idx_dvcsynclog_actiontype   ON "DvcSyncLog" ("ActionType");
CREATE INDEX IF NOT EXISTS idx_dvcsynclog_issuccess     ON "DvcSyncLog" ("IsSuccess");
CREATE INDEX IF NOT EXISTS idx_dvcsynclog_mahoso        ON "DvcSyncLog" ("MaHoSo");
CREATE INDEX IF NOT EXISTS idx_dvcsynclog_createddate   ON "DvcSyncLog" ("CreatedDate" DESC);
CREATE INDEX IF NOT EXISTS idx_dvcsynclog_isdeleted     ON "DvcSyncLog" ("IsDeleted");

COMMENT ON TABLE "DvcSyncLog" IS 'Lịch sử đồng bộ hồ sơ DVC Bộ Chuyên Ngành';
COMMENT ON COLUMN "DvcSyncLog"."ActionType" IS 'Loại hành động: GetToken, GetNextValue, UploadFile, CreateDossier, CapNhatTienTrinh, CapNhatTrangThai';
COMMENT ON COLUMN "DvcSyncLog"."MaHoSo" IS 'Mã hồ sơ trên Cổng DVC';
COMMENT ON COLUMN "DvcSyncLog"."IdHoSo" IS 'ID hồ sơ trên Cổng DVC';
