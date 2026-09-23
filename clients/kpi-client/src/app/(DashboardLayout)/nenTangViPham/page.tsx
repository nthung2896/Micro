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
import { NenTangViPhamType } from "@/types/nen-tang-vi-pham/dto";
import { NenTangViPhamSearchType } from "@/types/nen-tang-vi-pham/request";
import nenTangViPhamService from "@/services/nenTangViPham/nenTangViPham.service";
import Search from "./search";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

const NenTangViPhamPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [data, setData] = useState<PagedList<NenTangViPhamType>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);
  const [searchValues, setSearchValues] = useState<NenTangViPhamSearchType | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getVisibilityTag = (isHienThi: boolean) => {
    return isHienThi ? (
      <Tag color="success">Hiển thị</Tag>
    ) : (
      <Tag color="default">Ẩn</Tag>
    );
  };

  const tableColumns: TableProps<NenTangViPhamType>["columns"] = [
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
      render: (_: any, record: NenTangViPhamType) => (
        <span
          style={{ fontWeight: "bold", color: "#0143DF", cursor: "pointer" }}
          onClick={() => {
            router.push(`/nenTangViPham/detail?id=${record.id}`);
          }}
          className="hover:text-blue-600"
        >
          {record.tenNenTang || "—"}
        </span>
      ),
    },
    {
      title: "Tên ứng dụng",
      dataIndex: "tenUngDung",
      key: "tenUngDung",
      render: (text: string) => text || "—",
    },
    {
      title: "Nguồn vi phạm",
      dataIndex: "tenNguon",
      key: "tenNguon",
      render: (text: string) => text || "—",
    },
    {
      title: "Loại vi phạm",
      dataIndex: "tenLoaiViPham",
      key: "tenLoaiViPham",
      render: (text: string) => text || "—",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "ngayBatDau",
      key: "ngayBatDau",
      render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "ngayKetThuc",
      key: "ngayKetThuc",
      render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Nền tảng liên kết",
      dataIndex: "tenNenTangLienKet",
      key: "tenNenTangLienKet",
      render: (text: string) => text || "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "isHienThi",
      key: "isHienThi",
      align: "center",
      render: (val: boolean) => getVisibilityTag(val),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      render: (_: any, record: NenTangViPhamType) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "detail",
            icon: <EyeOutlined />,
            onClick: () => {
              router.push(`/nenTangViPham/detail?id=${record.id}`);
            },
          },
          {
            label: "Chỉnh sửa",
            key: "edit",
            icon: <EditOutlined />,
            onClick: () => {
              router.push(`/nenTangViPham/createOrUpdate?id=${record.id}`);
            },
          },
          {
            type: "divider",
          },
          {
            label: "Xóa",
            key: "delete",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => setConfirmDeleteId(record.id ?? ""),
          },
        ];
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
      const response = await nenTangViPhamService.delete(confirmDeleteId);
      if (response.status) {
        message.success("Xóa nền tảng vi phạm thành công");
        handleLoadData();
      } else {
        message.error(response.message || "Xóa nền tảng vi phạm thất bại");
      }
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<NenTangViPhamSearchType>["onFinish"] = async (values) => {
    try {
      setSearchValues(values);
      setPageIndex(1);
      await handleLoadData(values, 1);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  };

  const handleLoadData = useCallback(
    async (searchDataOverride?: NenTangViPhamSearchType, indexOverride?: number) => {
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
        const response = await nenTangViPhamService.getData(searchData);
        if (response && response.status && response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
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
          <Button
            onClick={() => router.push("/nenTangViPham/createOrUpdate")}
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
          <p>Bạn có chắc chắn muốn xóa nền tảng vi phạm này?</p>
        </Modal>
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
                router.push(`/nenTangViPham/detail?id=${record.id}`);
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

export default withAuthorization(NenTangViPhamPage, "");
