-- =====================================================================
-- Migration helper schema — chạy 1 LẦN trên Postgres mới trước khi
-- chạy bất kỳ migrator nào.
--
-- Mục đích: lưu mapping old_id (bigint) ↔ new_id (uuid) cho từng bảng
-- gốc, để các bảng có FK trỏ tới (CompanyInfo, AppUser, ...) có thể
-- lookup đúng id mới ở giai đoạn sau.
--
-- Sau khi migrate xong hết các bảng và xác nhận data OK, có thể:
--   DROP SCHEMA _migration CASCADE;
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS _migration;

-- Mapping cho bảng AppUser (sẽ làm sau)
CREATE TABLE IF NOT EXISTS _migration.user_id_map (
    old_id      bigint PRIMARY KEY,
    new_id      uuid   NOT NULL UNIQUE,
    migrated_at timestamp NOT NULL DEFAULT now()
);

-- Mapping cho bảng CompanyInfo
CREATE TABLE IF NOT EXISTS _migration.company_id_map (
    old_id      bigint PRIMARY KEY,
    new_id      uuid   NOT NULL UNIQUE,
    migrated_at timestamp NOT NULL DEFAULT now()
);

-- Mapping cho bảng Role (old PK là int)
CREATE TABLE IF NOT EXISTS _migration.role_id_map (
    old_id      bigint PRIMARY KEY,
    new_id      uuid   NOT NULL UNIQUE,
    migrated_at timestamp NOT NULL DEFAULT now()
);

-- Mapping cho bảng Operation
CREATE TABLE IF NOT EXISTS _migration.operation_id_map (
    old_id      bigint PRIMARY KEY,
    new_id      uuid   NOT NULL UNIQUE,
    migrated_at timestamp NOT NULL DEFAULT now()
);

-- Mapping cho bảng Module (Operation.ModuleId trỏ tới)
CREATE TABLE IF NOT EXISTS _migration.module_id_map (
    old_id      bigint PRIMARY KEY,
    new_id      uuid   NOT NULL UNIQUE,
    migrated_at timestamp NOT NULL DEFAULT now()
);

-- Mapping cho bảng WebsiteInfo
CREATE TABLE IF NOT EXISTS _migration.website_id_map (
    old_id      bigint PRIMARY KEY,
    new_id      uuid   NOT NULL UNIQUE,
    migrated_at timestamp NOT NULL DEFAULT now()
);

-- Mapping cho bảng AppInfo
CREATE TABLE IF NOT EXISTS _migration.app_id_map (
    old_id      bigint PRIMARY KEY,
    new_id      uuid   NOT NULL UNIQUE,
    migrated_at timestamp NOT NULL DEFAULT now()
);

-- Mapping cho bảng WebsiteInfoFileAttach
CREATE TABLE IF NOT EXISTS _migration.website_file_id_map (
    old_id      bigint PRIMARY KEY,
    new_id      uuid   NOT NULL UNIQUE,
    migrated_at timestamp NOT NULL DEFAULT now()
);

-- Mapping cho bảng AppInfoFileAttach
CREATE TABLE IF NOT EXISTS _migration.app_file_id_map (
    old_id      bigint PRIMARY KEY,
    new_id      uuid   NOT NULL UNIQUE,
    migrated_at timestamp NOT NULL DEFAULT now()
);

-- Mapping cho bảng AuthenticationContract
CREATE TABLE IF NOT EXISTS _migration.authcontract_id_map (
    old_id      bigint PRIMARY KEY,
    new_id      uuid   NOT NULL UNIQUE,
    migrated_at timestamp NOT NULL DEFAULT now()
);

-- Mapping cho bảng AuthConstactCategory
CREATE TABLE IF NOT EXISTS _migration.authcontractcategory_id_map (
    old_id      bigint PRIMARY KEY,
    new_id      uuid   NOT NULL UNIQUE,
    migrated_at timestamp NOT NULL DEFAULT now()
);

-- Mapping cho bảng ContractInfoFileAttach
CREATE TABLE IF NOT EXISTS _migration.contract_file_id_map (
    old_id      bigint PRIMARY KEY,
    new_id      uuid   NOT NULL UNIQUE,
    migrated_at timestamp NOT NULL DEFAULT now()
);

-- Log dòng skip/lỗi để re-check sau
CREATE TABLE IF NOT EXISTS _migration.error_log (
    id          bigserial PRIMARY KEY,
    table_name  text NOT NULL,
    old_id      bigint,
    reason      text NOT NULL,
    payload     jsonb,
    created_at  timestamp NOT NULL DEFAULT now()
);
