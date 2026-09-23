"use client";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageInfo } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  MenuProps,
  Pagination,
  Popconfirm,
  Space,
  Table,
  TableColumnsType,
  Tag,
  message,
  Progress,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import emailConfigsService from "@/services/emailConfigs/emailConfigs.service";
import {
  EmailConfigsDto,
  EmailConfigsSearch,
} from "@/types/emailConfigs";
import Search from "./search";
import CreateUpdateForm from "./createOrUpdate";
import Detail from "./detail";

const DEFAULT_DAILY_LIMIT = 500;

const Page: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [dataList, setDataList] = useState<EmailConfigsDto[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<EmailConfigsSearch | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [currentItem, setCurrentItem] = useState<EmailConfigsDto | undefined>();
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);

  const getQuotaPercent = (record: EmailConfigsDto) => {
    const sent = record.sentToday ?? 0;
    const limit = record.dailyLimit ?? DEFAULT_DAILY_LIMIT;
    return limit > 0 ? Math.round((sent / limit) * 100) : 0;
  };

  const getStatusTag = (record: EmailConfigsDto) => {
    const failures = record.consecutiveFailures ?? 0;
    if (record.allowSendMail === false) {
      if (failures >= 3) return <Tag color="volcano">Tạm tắt do lỗi</Tag>;
      return <Tag color="default">Tạm tắt</Tag>;
    }
    const percent = getQuotaPercent(record);
    if (percent >= 100) return <Tag color="red">Đầy quota</Tag>;
    if (failures > 0) return <Tag color="gold">Lỗi gần đây ({failures})</Tag>;
    if (percent >= 80) return <Tag color="orange">Sắp đầy</Tag>;
    return <Tag color="green">Hoạt động</Tag>;
  };

  const tableColumns: TableColumnsType<EmailConfigsDto> = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_: any, __: EmailConfigsDto, index: number) =>
        pageSize * (pageIndex - 1) + index + 1,
    },
    {
      title: "Email gửi",
      dataIndex: "from",
      width: 200,
      render: (v: string) => v || "-",
    },
    {
      title: "Máy chủ SMTP",
      dataIndex: "host",
      width: 160,
      render: (v: string) => v || "-",
    },
    {
      title: "Cổng SMTP",
      dataIndex: "port",
      width: 100,
      align: "center",
      render: (v: string) => v || "-",
    },
    {
      title: "Tài khoản SMTP",
      dataIndex: "userName",
      width: 200,
      render: (v: string) => v || "-",
    },
    {
      title: "Tên hiển thị",
      dataIndex: "alias",
      width: 160,
      render: (v: string) => v || "-",
    },
    {
      title: "Trạng thái",
      width: 140,
      align: "center",
      render: (_: any, record: EmailConfigsDto) => getStatusTag(record),
    },
    {
      title: "Quota hôm nay",
      width: 180,
      render: (_: any, record: EmailConfigsDto) => {
        const sent = record.sentToday ?? 0;
        const limit = record.dailyLimit ?? DEFAULT_DAILY_LIMIT;
        const percent = getQuotaPercent(record);
        return (
          <div>
            <span style={{ fontSize: 12 }}>
              {sent} / {limit} ({percent}%)
            </span>
            <Progress
              percent={Math.min(percent, 100)}
              size="small"
              showInfo={false}
              strokeColor={percent >= 100 ? "#dc2626" : percent >= 80 ? "#f59e0b" : "#16a34a"}
            />
          </div>
        );
      },
    },
    {
      title: "Gửi gần nhất",
      dataIndex: "lastUsedAt",
      width: 160,
      align: "center",
      render: (v: string) => v ? new Date(v).toLocaleString("vi-VN") : "-",
    },
    {
      title: "Lỗi liên tiếp",
      dataIndex: "consecutiveFailures",
      width: 100,
      align: "center",
      render: (v: number | null) => {
        const n = v ?? 0;
        if (n === 0) return <span style={{ color: "#94a3b8" }}>0</span>;
        return <Tag color={n >= 3 ? "volcano" : "gold"}>{n} / 3</Tag>;
      },
    },
    {
      title: "Bật SSL",
      dataIndex: "enableSsl",
      width: 80,
      align: "center",
      render: (v: boolean) => (
        <Tag color={v ? "green" : "default"}>{v ? "Bật" : "Tắt"}</Tag>
      ),
    },
    {
      title: "Thao tác",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_: any, record: EmailConfigsDto) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "detail",
            icon: <EyeOutlined />,
            onClick: () => {
              setCurrentItem(record);
              setIsOpenDetail(true);
            },
          },
          {
            label: "Chỉnh sửa",
            key: "edit",
            icon: <EditOutlined />,
            onClick: () => {
              setCurrentItem(record);
              setIsOpenModal(true);
            },
          },
          {
            label: "Xóa",
            key: "delete",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => setOpenPopconfirmId(record.id ?? ""),
          },
        ];
        return (
          <>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button onClick={(e) => e.preventDefault()} color="primary">
                <Space>
                  Thao tác
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa cấu hình này?"
              okText="Xóa"
              cancelText="Hủy"
              open={openPopconfirmId === record.id}
              onConfirm={() => {
                handleDelete(record.id || "");
                setOpenPopconfirmId(null);
              }}
              onCancel={() => setOpenPopconfirmId(null)}
            />
          </>
        );
      },
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      const response = await emailConfigsService.delete(id);
      if (response.status) {
        message.success("Xóa thành công");
        handleFetch();
      } else {
        message.error(response.message || "Xóa thất bại");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  const handleSearch = async (values: EmailConfigsSearch) => {
    setSearchValues(values);
    setPageIndex(1);
    await handleFetch(values);
  };

  const handleFetch = useCallback(
    async (searchData?: EmailConfigsSearch) => {
      dispatch(setIsLoading(true));
      try {
        const param = searchData || { pageIndex, pageSize, ...searchValues };
        const response = await emailConfigsService.getData(param as EmailConfigsSearch);
        if (response != null && response.data != null) {
          const data = response.data;
          setDataList(data.items);
          setDataPage({
            pageIndex: data.pageIndex,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPage: data.totalPage,
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [pageIndex, pageSize]
  );

  const handleShowModal = (item?: EmailConfigsDto) => {
    setCurrentItem(item);
    setIsOpenModal(true);
  };

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  // Summary stats
  const summary = (() => {
    let sent = 0, limit = 0, usable = 0, nearFull = 0, off = 0, autoDisabled = 0;
    for (const it of dataList) {
      const s = it.sentToday ?? 0;
      const l = it.dailyLimit ?? DEFAULT_DAILY_LIMIT;
      const failures = it.consecutiveFailures ?? 0;
      sent += s; limit += l;
      if (it.allowSendMail === false) { off++; if (failures >= 3) autoDisabled++; continue; }
      if (s / Math.max(l, 1) >= 0.8) nearFull++;
      usable++;
    }
    return { sent, limit, usable, nearFull, off, autoDisabled, total: dataList.length };
  })();

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" style={{ marginBottom: 10 }}>
        <AutoBreadcrumb />
      </Flex>
      <Flex justifyContent="flex-end" style={{ marginBottom: 10, gap: 8 }}>
        <Button icon={<SearchOutlined />} onClick={() => setIsPanelVisible(!isPanelVisible)}>Tìm kiếm</Button>
        <Button icon={<SendOutlined />} onClick={() => message.info("Chức năng test gửi email đang phát triển")}>Test gửi email</Button>
        <Button color="green" variant="solid" icon={<PlusCircleOutlined />} onClick={() => handleShowModal()}>Thêm mới</Button>
      </Flex>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
        <Card bodyStyle={{ padding: 12 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Tài khoản khả dụng</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: summary.usable === 0 && summary.total > 0 ? "#dc2626" : "#16a34a" }}>
            {summary.usable} / {summary.total}
          </div>
        </Card>
        <Card bodyStyle={{ padding: 12 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Đã gửi hôm nay</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#005C8C" }}>
            {summary.sent} / {summary.limit.toLocaleString("vi-VN")}
          </div>
          <Progress percent={summary.limit > 0 ? Math.round((summary.sent / summary.limit) * 100) : 0} size="small" showInfo={false} strokeColor={summary.limit > 0 && summary.sent / summary.limit >= 0.8 ? "#f59e0b" : "#16a34a"} />
        </Card>
        <Card bodyStyle={{ padding: 12 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Sắp đầy quota</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: summary.nearFull > 0 ? "#f59e0b" : "#94a3b8" }}>{summary.nearFull}</div>
        </Card>
        <Card bodyStyle={{ padding: 12 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Auto-tắt do lỗi / Tạm tắt</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: summary.autoDisabled > 0 ? "#dc2626" : "#94a3b8" }}>
            {summary.autoDisabled} / {summary.off}
          </div>
        </Card>
      </div>

      {summary.autoDisabled > 0 && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", padding: "8px 12px", borderRadius: 4, marginBottom: 12, fontSize: 13 }}>
          <strong>Cảnh báo:</strong> {summary.autoDisabled} tài khoản đã bị tự động tắt do gửi fail liên tục ≥ 3 lần. Vào chi tiết để xem lý do, sửa cấu hình rồi bật lại &quot;Cho phép gửi email&quot; — counter sẽ tự reset.
        </div>
      )}

      {isPanelVisible && (
        <div style={{ marginBottom: 12 }}>
          <Search handleSearch={handleSearch} />
        </div>
      )}

      <Card bodyStyle={{ padding: 12 }}>
        <div className="table-responsive">
          <Table<EmailConfigsDto>
            columns={tableColumns}
            bordered
            dataSource={dataList}
            rowKey="id"
            scroll={{ x: 1400 }}
            pagination={false}
            loading={loading}
            tableLayout="fixed"
          />
        </div>

        <Flex justifyContent="flex-end" style={{ marginTop: 16 }}>
          <Pagination
            total={dataPage?.totalCount || 0}
            current={pageIndex}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} trong ${total} cấu hình`
            }
            onChange={(page, size) => {
              setPageIndex(page);
              if (size !== pageSize) setPageSize(size);
            }}
          />
        </Flex>
      </Card>

      <CreateUpdateForm
        isOpen={isOpenModal}
        onSuccess={() => {
          handleFetch();
          setIsOpenModal(false);
        }}
        onClose={() => {
          setIsOpenModal(false);
          setCurrentItem(undefined);
        }}
        data={currentItem}
      />

      <Detail
        isOpen={isOpenDetail}
        data={currentItem}
        onClose={() => {
          setIsOpenDetail(false);
          setCurrentItem(undefined);
        }}
      />
    </>
  );
};

export default withAuthorization(Page, "");
