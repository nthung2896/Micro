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
  StarOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  Image,
  MenuProps,
  Pagination,
  Popconfirm,
  Space,
  Table,
  TableColumnsType,
  Tag,
  message,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import tinTucService from "@/services/tinTuc/tinTuc.service";
import { TinTucDto, TinTucSearch } from "@/types/tinTuc";
import Search from "./search";
import CreateUpdateForm from "./createOrUpdate";

const GLOBAL_DEPT_ID = "33000000-0000-0000-0000-000000000000";

const Page: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";
  const currentUser = useSelector((state) => state.auth.User);
  const isAdmin = currentUser?.listRole?.includes("Admin") === true;
  const isGlobalDept = currentUser?.donViId === GLOBAL_DEPT_ID;

  const canModify = (record: TinTucDto) => {
    if (isAdmin) return true;
    if (isGlobalDept) return record.departmentId === GLOBAL_DEPT_ID || !record.departmentId;
    return record.departmentId === currentUser?.donViId;
  };

  const [dataList, setDataList] = useState<TinTucDto[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<TinTucSearch | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [currentItem, setCurrentItem] = useState<TinTucDto | undefined>();
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);

  const getTrangThaiTag = (trangThai: number) => {
    switch (trangThai) {
      case 0: return <Tag color="default">Nháp</Tag>;
      case 1: return <Tag color="green">Đã xuất bản</Tag>;
      case 2: return <Tag color="red">Ẩn</Tag>;
      default: return <Tag>Không xác định</Tag>;
    }
  };

  const tableColumns: TableColumnsType<TinTucDto> = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_: any, __: TinTucDto, index: number) =>
        pageSize * (pageIndex - 1) + index + 1,
    },
    {
      title: "Tiêu đề",
      dataIndex: "tieuDe",
      width: 350,
      render: (v: string, record: TinTucDto) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image
            width={48}
            height={48}
            src={record.anhDaiDien ? `${staticUrl}/${record.anhDaiDien}` : ""}
            fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2JmYmZiZiIgZm9udC1zaXplPSIxNiI+8J+WvDwvdGV4dD48L3N2Zz4="
            style={{ borderRadius: 4, objectFit: "cover", flexShrink: 0 }}
            preview={false}
          />
          <span>
            {record.isNoiBat && <StarOutlined style={{ color: "#faad14", marginRight: 4 }} />}
            {v}
          </span>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "tenDanhMuc",
      width: 150,
      render: (v: string) => v || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      width: 120,
      align: "center",
      render: (v: number) => getTrangThaiTag(v),
    },
    {
      title: "Ngày xuất bản",
      dataIndex: "ngayXuatBan",
      width: 130,
      align: "center",
      render: (v: string) =>
        v ? new Date(v).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Lượt xem",
      dataIndex: "luotXem",
      width: 90,
      align: "center",
    },
    {
      title: "Thao tác",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_: any, record: TinTucDto) => {
        if (!canModify(record)) return null;
        const items: MenuProps["items"] = [
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
            label: record.trangThai === 1 ? "Ẩn tin" : "Xuất bản",
            key: "toggle",
            icon: <EyeOutlined />,
            onClick: () => handleToggleTrangThai(record),
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
              description="Bạn có chắc chắn muốn xóa tin tức này?"
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

  const handleToggleTrangThai = async (record: TinTucDto) => {
    const newStatus = record.trangThai === 1 ? 2 : 1;
    const response = await tinTucService.updateTrangThai(record.id, newStatus);
    if (response.status) {
      message.success(newStatus === 1 ? "Đã xuất bản" : "Đã ẩn tin");
      handleFetch();
    } else {
      message.error(response.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await tinTucService.delete(id);
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

  const handleSearch = async (values: TinTucSearch) => {
    setSearchValues(values);
    setPageIndex(1);
    await handleFetch(values);
  };

  const handleFetch = useCallback(
    async (searchData?: TinTucSearch) => {
      dispatch(setIsLoading(true));
      try {
        const baseParam = searchData || { pageIndex, pageSize, ...searchValues };
        const param: TinTucSearch = isAdmin
          ? baseParam
          : { ...baseParam, departmentId: currentUser?.donViId };
        const response = await tinTucService.getData(param as TinTucSearch);
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
    [pageIndex, pageSize, isAdmin, currentUser?.donViId]
  );

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ marginBottom: 10, flexWrap: "wrap", gap: 8 }}
      >
        <AutoBreadcrumb />
      </Flex>
      <Flex
        justifyContent="flex-end"
        style={{ marginBottom: 10, gap: 8 }}
      >
        <Button
          icon={<SearchOutlined />}
          onClick={() => setIsPanelVisible(!isPanelVisible)}
        >
          Tìm kiếm
        </Button>
        <Button
          color="green" variant="solid"
          icon={<PlusCircleOutlined />}
          onClick={() => {
            setCurrentItem(undefined);
            setIsOpenModal(true);
          }}
        >
          Thêm mới
        </Button>
      </Flex>

      {isPanelVisible && (
        <div style={{ marginBottom: 12 }}>
          <Search handleSearch={handleSearch} />
        </div>
      )}

      <Card bodyStyle={{ padding: 12 }}>
        <div className="table-responsive">
          <Table<TinTucDto>
            columns={tableColumns}
            bordered
            dataSource={dataList}
            rowKey="id"
            scroll={{ x: 1100 }}
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
              `${range[0]}-${range[1]} trong ${total} tin tức`
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
    </>
  );
};

export default withAuthorization(Page, "");
