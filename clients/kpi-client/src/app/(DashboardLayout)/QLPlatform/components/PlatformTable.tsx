"use client";

import React from "react";
import { Table, TableProps, Tag, Button, Space, Dropdown, MenuProps, Pagination } from "antd";
import {
  EyeOutlined,
  DownOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  SolutionOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { PlatformManageType } from "@/types/platformManage/dto";
import { PagedList } from "@/types/general";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import PlatformManageTypeConstant from "@/constants/PlatformManageTypeConstant";
import { useRouter } from "next/navigation";

interface PlatformTableProps {
  data?: PagedList<PlatformManageType>;
  loading: boolean;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onDetailClick: (record: PlatformManageType) => void;
  onTransitionClick: (config: {
    recordId: string;
    targetStatus: number;
    title: string;
    buttonColor: "primary" | "danger" | "warning";
  }) => void;
  roles: {
    isCV: boolean;
    isTP: boolean;
    isLD: boolean;
    isDN: boolean;
  };
}

const PlatformTable: React.FC<PlatformTableProps> = ({
  data,
  loading,
  pageIndex,
  pageSize,
  onPageChange,
  onDetailClick,
  onTransitionClick,
  roles,
}) => {
  const router = useRouter();
  const { isCV, isTP, isLD, isDN } = roles;

  const columns: TableProps<PlatformManageType>["columns"] = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_: any, __: any, index: number) =>
        (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: "Thông tin nền tảng số",
      width: 320,
      render: (_: any, record: PlatformManageType) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span
            style={{ fontWeight: 600, color: "#1e3a8a", cursor: "pointer", fontSize: "14px" }}
            onClick={() => onDetailClick(record)}
          >
            {record.name || "Chưa đặt tên"}
          </span>
          {record.domain && (
            <a
              href={`https://${record.domain}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline", color: "#2563eb", fontSize: "12px" }}
            >
              🌐 {record.domain}
            </a>
          )}
          {record.platformManageTypeId && (
            <div style={{ marginTop: "2px" }}>
              <Tag color={PlatformManageTypeConstant.getColor(record.platformManageTypeId)}>
                {PlatformManageTypeConstant.getDisplayName(record.platformManageTypeId)}
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Chủ sở hữu & Mã số thuế",
      width: 300,
      render: (_: any, record: PlatformManageType) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontWeight: 600, color: "#334155", fontSize: "13px" }}>
            🏢 {record.companyName || "Chưa có tên doanh nghiệp"}
          </span>
          {record.companyTaxCode && (
            <span style={{ color: "#64748b", fontSize: "12px" }}>
              Mã số thuế: <strong style={{ color: "#0f172a" }}>{record.companyTaxCode}</strong>
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 160,
      render: (status: number) => (
        <Tag color={PlatformStatusConstant.getColor(status)}>
          {PlatformStatusConstant.getDisplayName(status)}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      width: 120,
      align: "center",
      render: (_: any, record: PlatformManageType) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết & Phê duyệt",
            key: "detail",
            icon: <EyeOutlined />,
            onClick: () => onDetailClick(record),
          },
        ];

        // LOGIC THAO TÁC NHANH TRÊN INDEX (LUỒNG 2)
        // 0. Doanh nghiệp xử lý từ Tạm lưu (0), Đề nghị chỉnh sửa (2), Cần bổ sung thông tin (6)
        if (
          isDN &&
          (record.status === PlatformStatusConstant.TamLuu ||
            record.status === PlatformStatusConstant.DeNghiChinhSua ||
            record.status === PlatformStatusConstant.CanBoSungThongTin)
        ) {
          items.push(
            { type: "divider" },
            {
              label: "Chỉnh sửa hồ sơ",
              key: "edit_dn",
              icon: <EditOutlined style={{ color: "#2563eb" }} />,
              onClick: () =>
                router.push(
                  record.platformManageTypeId === "NTThongBaoKD"
                    ? `/QLPlatform/NenTangTrucTuyen/createOrUpdate?id=${record.id}`
                    : `/QLPlatform/create?id=${record.id}&type=${record.platformManageTypeId}`
                ),
            },
            {
              label: "Gửi duyệt hồ sơ",
              key: "submit_dn",
              icon: <SendOutlined style={{ color: "#16a34a" }} />,
              onClick: () =>
                onTransitionClick({
                  recordId: record.id,
                  targetStatus: PlatformStatusConstant.ChoDuyet,
                  title: "Gửi hồ sơ đăng ký lên hệ thống",
                  buttonColor: "primary",
                }),
            }
          );
        }
        // 1. Chuyên viên xử lý từ Chờ duyệt (1) hoặc Đang xin ý kiến (25)
        if (
          isCV &&
          (record.status === PlatformStatusConstant.ChoDuyet ||
            record.status === PlatformStatusConstant.DangXinYKien)
        ) {
          items.push(
            { type: "divider" },
            {
              label: "Duyệt điện tử",
              key: "duyet_cv",
              icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
              onClick: () =>
                onTransitionClick({
                  recordId: record.id,
                  targetStatus: PlatformStatusConstant.DaDuyetDienTu,
                  title: "Duyệt điện tử hồ sơ",
                  buttonColor: "primary",
                }),
            },
            {
              label: "Xin ý kiến phối hợp",
              key: "ykien_cv",
              icon: <InfoCircleOutlined />,
              onClick: () =>
                onTransitionClick({
                  recordId: record.id,
                  targetStatus: PlatformStatusConstant.DangXinYKien,
                  title: "Xin ý kiến phối hợp liên ngành",
                  buttonColor: "warning",
                }),
            },
          );
        }

        // 2. Trưởng phòng xử lý từ Đã duyệt điện tử (4) hoặc Cần bản giấy (28)
        if (
          isTP &&
          (record.status === PlatformStatusConstant.DaDuyetDienTu ||
            record.status === PlatformStatusConstant.CanBanGiay)
        ) {
          items.push(
            { type: "divider" },
            {
              label:
                record.status === PlatformStatusConstant.CanBanGiay
                  ? "Đã nhận bản giấy"
                  : "Review thông qua",
              key: "review_tp",
              icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
              onClick: () =>
                onTransitionClick({
                  recordId: record.id,
                  targetStatus: PlatformStatusConstant.DaReview,
                  title:
                    record.status === PlatformStatusConstant.CanBanGiay
                      ? "Xác nhận đã nhận bản giấy & Trình Lãnh đạo"
                      : "Xác nhận Review (Trình Lãnh đạo)",
                  buttonColor: "primary",
                }),
            },
            {
              label: "Yêu cầu bản giấy",
              key: "giay_tp",
              icon: <SolutionOutlined />,
              onClick: () =>
                onTransitionClick({
                  recordId: record.id,
                  targetStatus: PlatformStatusConstant.CanBanGiay,
                  title: "Yêu cầu nộp bản giấy đối chiếu",
                  buttonColor: "warning",
                }),
            },
          );
        }

        // 3. Lãnh đạo xử lý từ Đã review (26)
        if (isLD && record.status === PlatformStatusConstant.DaReview) {
          items.push(
            { type: "divider" },
            {
              label: "Phê duyệt chính thức",
              key: "pheduyet_ld",
              icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
              onClick: () =>
                onTransitionClick({
                  recordId: record.id,
                  targetStatus: PlatformStatusConstant.DaXacNhan,
                  title: "PHÊ DUYỆT CHÍNH THỨC & CẤP MÃ NỀN TẢNG TMĐT",
                  buttonColor: "primary",
                }),
            },
          );
        }

        // Các nút chung (Yêu cầu bổ sung, Từ chối)
        if (
          (isCV &&
            (record.status === PlatformStatusConstant.ChoDuyet ||
              record.status === PlatformStatusConstant.DangXinYKien)) ||
          (isTP &&
            (record.status === PlatformStatusConstant.DaDuyetDienTu ||
              record.status === PlatformStatusConstant.CanBanGiay)) ||
          (isLD && record.status === PlatformStatusConstant.DaReview)
        ) {
          items.push(
            {
              label: "Yêu cầu bổ sung",
              key: "bosung_chung",
              icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
              onClick: () =>
                onTransitionClick({
                  recordId: record.id,
                  targetStatus: PlatformStatusConstant.CanBoSungThongTin,
                  title: "Yêu cầu bổ sung thông tin",
                  buttonColor: "warning",
                }),
            },
            {
              label: "Từ chối",
              key: "tuchoi_chung",
              danger: true,
              icon: <CloseCircleOutlined />,
              onClick: () =>
                onTransitionClick({
                  recordId: record.id,
                  targetStatus: PlatformStatusConstant.BiTuChoi,
                  title: "Từ chối hồ sơ đăng ký",
                  buttonColor: "danger",
                }),
            },
          );
        }

        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button
              onClick={(e) => e.preventDefault()}
              color="primary"
              icon={<DownOutlined />}
            >
              <Space>Thao tác</Space>
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: "8px", overflow: "hidden" }}>
      <div className="table-responsive">
        <Table
          columns={columns}
          bordered
          dataSource={data?.items}
          rowKey="id"
          scroll={{ x: "max-content" }}
          pagination={false}
          loading={loading}
        />
      </div>

      <div
        style={{
          marginTop: 16,
          marginRight: 16,
          display: "flex",
          justifyContent: "flex-end",
          paddingBottom: 16,
        }}
      >
        <Pagination
          total={data?.totalCount}
          current={pageIndex}
          pageSize={pageSize}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trong ${total} hồ sơ`
          }
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
          align="end"
        />
      </div>
    </div>
  );
};

export default PlatformTable;
