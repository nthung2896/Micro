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
  PlusCircleOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
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
} from "antd";
import { useDispatch } from "react-redux";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { VuViecPhanAnhType } from "@/types/vu-viec-phan-anh/dto";
import { VuViecPhanAnhSearchType } from "@/types/vu-viec-phan-anh/request";
import vuViecPhanAnhService from "@/services/vuViecPhanAnh/vuViecPhanAnh.service";
import Search from "./search";
import ProcessVuViecModal from "./ProcessVuViecModal";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

const VuViecPhanAnhPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [data, setData] = useState<PagedList<VuViecPhanAnhType>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);
  const [searchValues, setSearchValues] = useState<VuViecPhanAnhSearchType | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [processItem, setProcessItem] = useState<VuViecPhanAnhType | null>(null);

  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles: string[] = currentUser?.listRole || authState?.ListRole || [];
  const isDoanhNghiep = userRoles.includes("DoanhNghiep");

  const getStatusTag = (status: number, statusText?: string) => {
    const text = statusText || (
      status === 0 ? "Mới tạo" :
        status === 1 ? "Đang xử lý" :
          status === 2 ? "Đã xử lý" :
            status === 3 ? "Yêu cầu giải trình" :
              status === 4 ? "Đã giải trình" :
                status === 5 ? "Yêu cầu giải trình lại" : "Chưa xác định"
    );
    switch (status) {
      case 0:
        return <Tag style={{ backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "4px", margin: 0 }}>{text}</Tag>;
      case 1:
        return <Tag color="processing" style={{ borderRadius: "4px", margin: 0 }}>{text}</Tag>;
      case 2:
        return <Tag color="success" style={{ borderRadius: "4px", margin: 0 }}>{text}</Tag>;
      case 3:
        return <Tag color="warning" style={{ borderRadius: "4px", margin: 0 }}>{text}</Tag>;
      case 4:
        return <Tag color="cyan" style={{ borderRadius: "4px", margin: 0 }}>{text}</Tag>;
      case 5:
        return <Tag color="volcano" style={{ borderRadius: "4px", margin: 0 }}>{text}</Tag>;
      default:
        return <Tag color="default" style={{ borderRadius: "4px", margin: 0 }}>{text}</Tag>;
    }
  };

  const getKetLuanTag = (ketLuan?: number) => {
    switch (ketLuan) {
      case 1:
        return <Tag color="error" style={{ borderRadius: "4px", margin: 0 }}>Có vi phạm</Tag>;
      case 2:
        return <Tag color="success" style={{ borderRadius: "4px", margin: 0 }}>Không vi phạm</Tag>;
      default:
        return <Tag color="default" style={{ borderRadius: "4px", margin: 0 }}>Chưa kết luận</Tag>;
    }
  };

  const handleStartProcess = (id: string) => {
    Modal.confirm({
      title: "Xác nhận bắt đầu xử lý",
      content: "Bạn có chắc chắn muốn bắt đầu xử lý vụ việc phản ánh này không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          dispatch(setIsLoading(true));
          const response = await vuViecPhanAnhService.changeStatus(id, 1);
          if (response.status) {
            message.success("Bắt đầu xử lý vụ việc thành công");
            handleLoadData();
          } else {
            message.error(response.message || "Không thể bắt đầu xử lý");
          }
        } catch (error) {
          message.error("Có lỗi xảy ra");
        } finally {
          dispatch(setIsLoading(false));
        }
      },
    });
  };

  const tableColumns: TableProps<VuViecPhanAnhType>["columns"] = [
    {
      title: "#",
      width: 50,
      align: "center",
      render: (_: any, __: any, index: number) => (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: "Nền tảng/Ứng dụng",
      key: "nenTangUngDung",
      render: (_: any, record: VuViecPhanAnhType) => {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
            <div style={{ fontWeight: 700, color: "#475569", fontSize: "12px" }}>
              #Vụ việc {record.soThuTu ?? 0}
            </div>
            <div>
              <span>Nền tảng:</span>{" "}
              <span
                style={{ fontWeight: 700, color: "#1890ff", cursor: "pointer", textDecoration: "underline" }}
                onClick={() => router.push(`/vuViecPhanAnh/detail?id=${record.id}`)}
              >
                {record.tenNenTang || "Chưa cập nhật"}
              </span>
            </div>
            {record.tenUngDung && (
              <div>
                <span>Ứng dụng:</span>{" "}
                <span style={{ color: "#1e293b" }}>{record.tenUngDung}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Thông tin doanh nghiệp",
      key: "thongTinChuThe",
      render: (_: any, record: VuViecPhanAnhType) => {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
            <div>
              <span style={{ fontWeight: 500 }}>Tên tổ chức:</span>{" "}
              <strong>{record.tenThuongNhan || "Chưa cập nhật"}</strong>
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>Mã số thuế:</span>{" "}
              <span>{record.maSoDoanhNghiep || "Chưa cập nhật"}</span>
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>Địa chỉ:</span>{" "}
              {record.diaChi ? (
                <span>{record.diaChi}</span>
              ) : (
                <span style={{ color: "#ea580c" }}>Chưa cập nhật</span>
              )}
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>Điện thoại:</span>{" "}
              {record.dienThoai ? (
                <span>{record.dienThoai}</span>
              ) : (
                <span style={{ color: "#ea580c" }}>Chưa cập nhật</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Thời gian",
      key: "thoiGian",
      render: (_: any, record: VuViecPhanAnhType) => {
        const createdDateStr = record.createdDate ? dayjs(record.createdDate).format("DD/MM/YYYY") : "Chưa cập nhật";
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px" }}>
            <div>
              <span style={{ color: "#64748b" }}>Ngày tạo:</span>{" "}
              <span style={{ fontWeight: 500 }}>{createdDateStr}</span>
            </div>
            <div>
              <span style={{ color: "#64748b" }}>Người tạo:</span>{" "}
              {record.createdBy ? (
                <span style={{ fontWeight: 500 }}>{record.createdBy}</span>
              ) : (
                <span style={{ color: "#ea580c" }}>Chưa cập nhật</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Trạng thái hồ sơ",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      render: (status: number, record: VuViecPhanAnhType) => getStatusTag(status, record.trangThai_txt),
    },
    {
      title: "Kết luận",
      dataIndex: "ketLuan",
      key: "ketLuan",
      align: "center",
      render: (ketLuan: number) => getKetLuanTag(ketLuan),
    },
    {
      title: "Thao tác",
      width: 120,
      align: "center",
      render: (_: any, record: VuViecPhanAnhType) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "detail",
            icon: <EyeOutlined />,
            onClick: () => {
              router.push(`/vuViecPhanAnh/detail?id=${record.id}`);
            },
          },
          {
            label: "Chỉnh sửa",
            key: "edit",
            icon: <EditOutlined />,
            onClick: () => {
              router.push(`/vuViecPhanAnh/createOrUpdate?id=${record.id}`);
            },
          },
        ];

        if (record.trangThai === 0 && !isDoanhNghiep) {
          items.push({
            label: "Bắt đầu xử lý",
            key: "startProcess",
            icon: <PlayCircleOutlined />,
            onClick: () => handleStartProcess(record.id ?? ""),
          });
        }

        if ((record.trangThai === 1 || record.trangThai === 4) && !isDoanhNghiep) {
          items.push({
            label: "Xử lý vụ việc",
            key: "process",
            icon: <CheckCircleOutlined />,
            onClick: () => setProcessItem(record),
          });
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
            <Button  style={{ borderRadius: "4px" }}>
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
      const response = await vuViecPhanAnhService.delete(confirmDeleteId);
      if (response.status) {
        message.success("Xóa vụ việc phản ánh thành công");
        handleLoadData();
      } else {
        message.error(response.message || "Xóa vụ việc phản ánh thất bại");
      }
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<VuViecPhanAnhSearchType>["onFinish"] = async (values) => {
    try {
      setSearchValues(values);
      setPageIndex(1);
      await handleLoadData(values, 1);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  };

  const handleLoadData = useCallback(
    async (searchDataOverride?: VuViecPhanAnhSearchType, indexOverride?: number) => {
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
        const response = await vuViecPhanAnhService.getData(searchData);
        if (response && response.status && response.data) {
          setData(response.data);
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
        <div className="btn-group w-fit flex" style={{ gap: 12 }}>
          <Button
            onClick={toggleSearch}
            color="cyan" variant="solid"
            size="middle"
            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
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
          <p>Bạn có chắc chắn muốn xóa vụ việc phản ánh này?</p>
        </Modal>
      )}

      {processItem && (
        <ProcessVuViecModal
          open={!!processItem}
          item={processItem}
          onCancel={() => setProcessItem(null)}
          onSuccess={() => {
            setProcessItem(null);
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
            onRow={(record) => ({
              onClick: (event: any) => {
                const target = event.target as HTMLElement;
                if (
                  target.tagName === "BUTTON" ||
                  target.closest("button") ||
                  target.tagName === "A" ||
                  target.closest("a") ||
                  target.classList.contains("ant-dropdown-menu-item") ||
                  target.closest(".ant-dropdown")
                ) {
                  return;
                }
                router.push(`/vuViecPhanAnh/detail?id=${record.id}`);
              },
              style: { cursor: "pointer" }
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

export default withAuthorization(VuViecPhanAnhPage, "");
