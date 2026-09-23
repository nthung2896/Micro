"use client";
import React, { useCallback, useEffect, useState } from "react";
import Flex from "@/components/shared-components/Flex";
import { PagedList } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  LinkOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  FormProps,
  MenuProps,
  Modal,
  Pagination,
  Space,
  Table,
  TableProps,
  Tag,
  message,
  Input,
} from "antd";
import { useDispatch } from "react-redux";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import CreateCaseModal from "./detail/CreateCaseModal";
import { PhanAnhNenTangType } from "@/types/phan-anh-nen-tang/dto";
import { PhanAnhNenTangSearchType } from "@/types/phan-anh-nen-tang/request";
import phanAnhNenTangService from "@/services/phanAnhNenTang/phanAnhNenTang.service";
import Search from "./search";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

const PhanAnhNenTangPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [data, setData] = useState<PagedList<PhanAnhNenTangType>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);
  const [searchValues, setSearchValues] = useState<PhanAnhNenTangSearchType | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // States cho đồng bộ các chức năng từ detail ra danh sách
  const [selectedItem, setSelectedItem] = useState<PhanAnhNenTangType | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);
  const [isCreateCaseModalOpen, setIsCreateCaseModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedItems, setSelectedItems] = useState<PhanAnhNenTangType[]>([]);

  const handleChangeStatus = (record: PhanAnhNenTangType, newStatus: number, statusText: string) => {
    if (!record || !record.id) return;
    Modal.confirm({
      title: `Chuyển trạng thái phản ánh`,
      content: `Bạn có chắc chắn muốn chuyển trạng thái phản ánh này sang "${statusText}" không?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          dispatch(setIsLoading(true));
          const updateData: any = {
            ...record,
            trangThai: newStatus,
          };
          const response = await phanAnhNenTangService.update(updateData);
          if (response.status) {
            message.success(`Đã cập nhật trạng thái phản ánh thành "${statusText}"`);
            handleLoadData();
          } else {
            message.error(response.message || "Cập nhật trạng thái thất bại");
          }
        } catch (error: any) {
          message.error(error?.message || "Cập nhật trạng thái thất bại");
        } finally {
          dispatch(setIsLoading(false));
        }
      },
    });
  };

  const handleRejectSubmit = async () => {
    if (!selectedItem || !selectedItem.id || !rejectReason.trim()) return;
    setSubmittingReject(true);
    try {
      const updateData: any = {
        ...selectedItem,
        trangThai: 2, // Đã từ chối
        lyDoTuChoi: rejectReason.trim(),
      };
      const response = await phanAnhNenTangService.update(updateData);
      if (response.status) {
        message.success("Đã từ chối tiếp nhận phản ánh thành công");
        setIsRejectModalOpen(false);
        setRejectReason("");
        setSelectedItem(null);
        handleLoadData();
      } else {
        message.error(response.message || "Từ chối tiếp nhận thất bại");
      }
    } catch (error: any) {
      message.error(error?.message || "Đã xảy ra lỗi");
    } finally {
      setSubmittingReject(false);
    }
  };

  const getStatusTag = (status: number, statusText?: string) => {
    const text = statusText || "Không xác định";
    switch (status) {
      case 0:
        return <Tag color="default">{text}</Tag>;
      case 1:
        return <Tag color="processing">{text}</Tag>;
      case 2:
        return <Tag color="error">{text}</Tag>;
      case 3:
        return <Tag color="success">{text}</Tag>;
      default:
        return <Tag color="default">{text}</Tag>;
    }
  };

  const tableColumns: TableProps<PhanAnhNenTangType>["columns"] = [
    {
      title: "STT",
      width: 70,
      align: "center",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: "Tên nền tảng",
      key: "tenNenTang",
      render: (_: any, record: PhanAnhNenTangType) => {
        const url = record.diaChiNenTang || "";
        const href = url.startsWith("http") ? url : `https://${url}`;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {url ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#1890ff", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                {url}
                <LinkOutlined style={{ fontSize: "12px" }} />
              </a>
            ) : (
              <span style={{ color: "#8c8c8c", fontStyle: "italic" }}>Chưa có địa chỉ</span>
            )}
            <span style={{ color: "#ea580c", fontStyle: "italic", fontSize: "13px" }}>
              {record.tenThuongNhan || "Chưa có tên doanh nghiệp"}
            </span>
            <span style={{ color: "#ea580c", fontStyle: "italic", fontSize: "13px" }}>
              ({record.tenTinh ? record.tenTinh : "Chưa có tỉnh/ thành phố"})
            </span>
            {record.hasVuViec && (
              <Tag color="blue" style={{ marginTop: 4, width: "fit-content", fontSize: 11 }}>
                Đã liên kết với vụ việc: #{record.soThuTu ?? 0}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Loại phản ánh",
      dataIndex: "tenLoaiPhanAnh",
      key: "tenLoaiPhanAnh",
    },
    {
      title: "Người phản ánh",
      key: "nguoiPhanAnh",
      render: (_: any, record: PhanAnhNenTangType) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span
            style={{ fontWeight: "bold", color: "#262626", cursor: "pointer" }}
            onClick={() => {
              router.push(`/phanAnhNenTang/detail?id=${record.id}`);
            }}
            className="hover:text-blue-600"
          >
            {record.hoTen || "Không có tên"}
          </span>
          <span style={{ fontSize: "13px", color: "#595959" }}>
            Email:{record.email || ""}
          </span>
          <span style={{ fontSize: "13px", color: "#595959" }}>
            CMND:{record.soCCCD || ""}
          </span>
          <span style={{ fontSize: "13px", color: "#595959" }}>
            Điện thoại:{record.soDienThoai || ""}
          </span>
        </div>
      ),
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date: string) => {
        if (!date) return "";
        const formattedDate = dayjs(date).format("DD/MM/YYYY");
        return <span>{formattedDate}</span>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      render: (status: number, record: PhanAnhNenTangType) => getStatusTag(status, record.trangThai_txt),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      render: (_: any, record: PhanAnhNenTangType) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "detail",
            icon: <EyeOutlined />,
            onClick: () => {
              router.push(`/phanAnhNenTang/detail?id=${record.id}`);
            },
          },
          {
            label: "Chỉnh sửa",
            key: "edit",
            icon: <EditOutlined />,
            onClick: () => {
              router.push(`/phanAnhNenTang/createOrUpdate?id=${record.id}`);
            },
          },
        ];

        if (record.trangThai === 0) {
          items.push(
            {
              type: "divider",
            },
            {
              label: "Ghi nhận",
              key: "ghiNhan",
              icon: <PlayCircleOutlined style={{ color: "#1d4ed8" }} />,
              onClick: () => handleChangeStatus(record, 1, "Đã ghi nhận"),
            },
            {
              label: "Từ chối",
              key: "tuChoi",
              danger: true,
              icon: <CloseCircleOutlined />,
              onClick: () => {
                setSelectedItem(record);
                setIsRejectModalOpen(true);
                setRejectReason("");
              },
            }
          );
        }

        if (record.trangThai === 1) {
          if (!record.hasVuViec) {
            items.push(
              {
                type: "divider",
              },
              {
                label: "Tạo vụ việc",
                key: "taoVuViec",
                icon: <PlusCircleOutlined style={{ color: "#3b82f6" }} />,
                onClick: () => {
                  setSelectedItem(record);
                  setIsCreateCaseModalOpen(true);
                },
              }
            );
          } else if (record.vuViecId) {
            items.push(
              {
                type: "divider",
              },
              {
                label: "Xem vụ việc xử lý",
                key: "xemVuViec",
                icon: <PlayCircleOutlined style={{ color: "#10b981" }} />,
                onClick: () => router.push(`/vuViecPhanAnh/detail?id=${record.vuViecId}`),
              }
            );
          }
        }

        items.push(
          {
            type: "divider",
          },
          {
            label: "Xóa",
            key: "delete",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => setConfirmDeleteId(record.id ?? ""),
          }
        );

        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button onClick={(e) => e.preventDefault()}>
              <Space>
                Thao tác
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        );
      },
    },
  ];


  const handleDelete = async () => {
    if (confirmDeleteId) {
      const response = await phanAnhNenTangService.delete(confirmDeleteId);
      if (response.status) {
        message.success("Xóa phản ánh thành công");
        handleLoadData();
      } else {
        message.error(response.message || "Xóa phản ánh thất bại");
      }
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<PhanAnhNenTangSearchType>["onFinish"] = async (values) => {
    try {
      setSearchValues(values);
      setPageIndex(1); // Reset page to 1 on search
      await handleLoadData(values, 1);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  };

  const handleLoadData = useCallback(
    async (searchDataOverride?: PhanAnhNenTangSearchType, indexOverride?: number) => {
      dispatch(setIsLoading(true));

      const cleanedSearchValues = Object.fromEntries(
        Object.entries(searchValues || {}).filter(
          ([_, value]) => value !== "" && value !== null && value !== undefined
        )
      );

      const targetIndex = indexOverride ?? pageIndex;

      const searchData = searchDataOverride || {
        pageIndex: targetIndex,
        pageSize,
        ...cleanedSearchValues,
      };

      try {
        const response = await phanAnhNenTangService.getData(searchData);
        if (response && response.status && response.data) {
          setData(response.data);
          setSelectedRowKeys([]);
          setSelectedItems([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );


  useEffect(() => {
    handleLoadData();
  }, [pageIndex, pageSize]);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-2 flex-wrap justify-content-end"
      >
        <AutoBreadcrumb />
        <div className="btn-group w-fit flex" style={{ gap: 12, alignItems: "center" }}>
          {selectedRowKeys.length > 0 && (
            <Button
              onClick={() => {
                const validItems = selectedItems.filter(item => !item.hasVuViec && item.trangThai === 1);
                if (validItems.length === 0) {
                  message.warning("Không có phản ánh hợp lệ nào được chọn (phải có trạng thái 'Đã ghi nhận' và chưa tạo vụ việc)!");
                  return;
                }
                setSelectedItem(null);
                setIsCreateCaseModalOpen(true);
              }}
              type="primary"
              style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
              icon={<PlusCircleOutlined />}
              size="middle"
            >
              Tạo vụ việc ({selectedItems.filter(item => !item.hasVuViec && item.trangThai === 1).length} mục)
            </Button>
          )}
          <Button
            onClick={toggleSearch}
            color="cyan" variant="solid"
            size="middle"
            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
          <Button
            onClick={() => router.push("/phanAnhNenTang/createOrUpdate")}
            type="primary"
            style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
            className="btn-green"
            icon={<PlusCircleOutlined />}
            size="middle"
          >
            Thêm mới
          </Button>
        </div>
      </Flex>

      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
      )}



      {confirmDeleteId && (
        <Modal
          title="Xác nhận xóa"
          open={true}
          onOk={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa phản ánh này?</p>
        </Modal>
      )}

      {/* Modal Từ Chối */}
      <Modal
        open={isRejectModalOpen}
        title="TỪ CHỐI TRANH CHẤP, PHẢN ÁNH, KHIẾU NẠI"
        onCancel={() => {
          setIsRejectModalOpen(false);
          setRejectReason("");
          setSelectedItem(null);
        }}
        width={600}
        footer={
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <Button
              type="primary"
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim() || submittingReject}
              loading={submittingReject}
              style={{
                backgroundColor: !rejectReason.trim() ? "#93c5fd" : "#3b82f6",
                borderColor: !rejectReason.trim() ? "#93c5fd" : "#3b82f6",
                color: "#fff",
                width: "100px",
                borderRadius: 4
              }}
            >
              Lưu
            </Button>
            <Button
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectReason("");
                setSelectedItem(null);
              }}
              style={{
                backgroundColor: "#94a3b8",
                borderColor: "#94a3b8",
                color: "#fff",
                width: "100px",
                borderRadius: 4
              }}
            >
              Đóng
            </Button>
          </div>
        }
      >
        {selectedItem && (
          <div style={{ color: "#334155", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
            <div style={{ marginBottom: "8px" }}>
              Tên miền: {selectedItem.diaChiNenTang || "—"}
            </div>
            <div style={{ marginBottom: "8px" }}>
              Nội dung: {selectedItem.noiDungPhanAnh || "—"}
            </div>
            <div style={{ marginBottom: "8px" }}>
              Người phản ánh: {selectedItem.hoTen || "—"}
            </div>
            <div style={{ marginBottom: "8px" }}>
              Ngày phản ánh: {selectedItem.createdDate ? dayjs(selectedItem.createdDate).format("DD/MM/YYYY") : "—"}
            </div>
            <div style={{ marginBottom: "8px" }}>
              Điện thoại: {selectedItem.soDienThoai || "—"}
            </div>
            <div style={{ marginBottom: "8px" }}>
              Email: {selectedItem.email || "—"}
            </div>
          </div>
        )}

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>
            Lý do từ chối<span style={{ color: "#ef4444" }}>*</span>
          </label>
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            style={{
              border: "1px solid #d9d9d9",
              borderRadius: "4px"
            }}
          />
        </div>
      </Modal>

      {/* Modal Xác nhận tạo mới vụ việc */}
      {isCreateCaseModalOpen && (selectedItem || selectedItems.length > 0) && (
        <CreateCaseModal
          open={isCreateCaseModalOpen}
          onCancel={() => {
            setIsCreateCaseModalOpen(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          items={selectedItem ? undefined : selectedItems.filter(item => !item.hasVuViec && item.trangThai === 1)}
          onSuccess={() => {
            setIsCreateCaseModalOpen(false);
            setSelectedItem(null);
            setSelectedRowKeys([]);
            setSelectedItems([]);
            handleLoadData();
          }}
        />
      )}

      <Card className="customCardShadow">
        <div className="table-responsive">
          <Table
            columns={tableColumns}
            bordered
            dataSource={data?.items}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={false}
            loading={loading}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys, selectedRows) => {
                setSelectedRowKeys(keys);
                setSelectedItems(selectedRows);
              },
              getCheckboxProps: (record) => ({
                disabled: record.hasVuViec || record.trangThai !== 1,
              }),
            }}
            onRow={(record) => ({
              onClick: (event) => {
                const target = event.target as HTMLElement;
                if (
                  target.tagName === "A" ||
                  target.closest("a") ||
                  target.tagName === "BUTTON" ||
                  target.closest("button") ||
                  target.closest(".ant-dropdown") ||
                  target.closest(".ant-table-selection-column") ||
                  target.closest(".ant-checkbox-wrapper")
                ) {
                  return;
                }
                router.push(`/phanAnhNenTang/detail?id=${record.id}`);
              },
              style: { cursor: "pointer" },
            })}
          />
        </div>
        <div
          style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}
        >
          <Pagination
            total={data?.totalCount}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} trong ${total} dữ liệu`
            }
            pageSize={pageSize}
            current={pageIndex}
            onChange={(page) => {
              setPageIndex(page);
            }}
            onShowSizeChange={(current, size) => {
              setPageIndex(current);
              setPageSize(size);
            }}
            align="end"
          />
        </div>
      </Card>
    </>
  );
};

export default withAuthorization(PhanAnhNenTangPage, "");
