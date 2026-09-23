-- =====================================================================
-- Thêm các cột đồng bộ DVC vào bảng PlatformManage
-- =====================================================================
-- Cách chạy:
--   dotnet run --project API/Hinet.Migration -- --table AddPlatformManageDvcFields
-- Hoặc chạy trực tiếp bằng psql:
--   psql -h 113.20.123.20 -p 4133 -U postgres -d OnlineGovVn -f "API/Hinet.Migration/Sql/003_add_dvc_fields_to_platformmanage.sql"
-- =====================================================================

ALTER TABLE "PlatformManage"
  ADD COLUMN IF NOT EXISTS "DvcMaHoSo"       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "DvcIdHoSo"       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "DvcSyncStatus"   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "DvcSyncDate"     TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "DvcRetryCount"   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "DvcErrorMessage" TEXT;

-- Index cho tra cứu theo mã hồ sơ DVC
CREATE INDEX IF NOT EXISTS idx_platformmanage_dvc_mahoso ON "PlatformManage" ("DvcMaHoSo");

COMMENT ON COLUMN "PlatformManage"."DvcMaHoSo" IS 'Mã hồ sơ trên Cổng DVC Bộ';
COMMENT ON COLUMN "PlatformManage"."DvcIdHoSo" IS 'ID hồ sơ trên Cổng DVC Bộ';
COMMENT ON COLUMN "PlatformManage"."DvcSyncStatus" IS 'Trạng thái đồng bộ DVC: 0=Chưa đồng bộ, 1=Đang đồng bộ, 2=Đã đồng bộ, 3=Lỗi';
COMMENT ON COLUMN "PlatformManage"."DvcSyncDate" IS 'Thời điểm đồng bộ DVC thành công';
COMMENT ON COLUMN "PlatformManage"."DvcRetryCount" IS 'Số lần retry đồng bộ DVC';
COMMENT ON COLUMN "PlatformManage"."DvcErrorMessage" IS 'Lỗi đồng bộ DVC lần cuối';
