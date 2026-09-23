-- =====================================================================
-- Tạo bảng DvcSyncFileMap — Lưu IdGiayTo + HashTepTin sau upload file
-- =====================================================================

CREATE TABLE IF NOT EXISTS "DvcSyncFileMap" (
    "Id"                UUID            DEFAULT gen_random_uuid() PRIMARY KEY,

    "PlatformManageId"  UUID            NOT NULL,
    "IdGiayTo"          VARCHAR(100),
    "HashTepTin"        VARCHAR(200),
    "TenFile"           VARCHAR(500),
    "TrangThai"         INTEGER         NOT NULL DEFAULT 0,

    -- Audit fields
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

CREATE INDEX IF NOT EXISTS idx_dvcsyncfilemap_platformmanageid ON "DvcSyncFileMap" ("PlatformManageId");
CREATE INDEX IF NOT EXISTS idx_dvcsyncfilemap_idgiayto       ON "DvcSyncFileMap" ("IdGiayTo");

COMMENT ON TABLE "DvcSyncFileMap" IS 'Map file đã upload lên DVC — lưu IdGiayTo để dùng cho tạo hồ sơ';
COMMENT ON COLUMN "DvcSyncFileMap"."PlatformManageId" IS 'ID platform (PlatformManage)';
COMMENT ON COLUMN "DvcSyncFileMap"."IdGiayTo" IS 'IdGiayTo từ DVC sau upload file';
COMMENT ON COLUMN "DvcSyncFileMap"."HashTepTin" IS 'HashTepTin từ DVC sau upload file';
COMMENT ON COLUMN "DvcSyncFileMap"."TrangThai" IS '0=Chưa dùng, 1=Đã gắn vào hồ sơ, 2=Lỗi';
