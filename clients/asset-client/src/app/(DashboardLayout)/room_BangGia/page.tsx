"use client";
import { useCallback, useEffect, useState } from "react";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageList } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import * as extensions from "@/utils/extensions";
import {
  AppstoreOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExportOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  FormProps,
  MenuProps,
  Modal,
  Pagination,
  Segmented,
  Space,
  Table,
  TableProps,
  Tag,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Room_BangGiaDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  Room_BangGiaSearchType,
  Room_BangGiaType,
} from "@/types/room_BangGia/room_BangGia";
import room_BangGiaService from "@/services/room_BangGia/room_BangGiaService";
import Room_BangGiaCreateOrUpdate from "./createOrUpdate";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import RoomBangGiaMatrix from "@/components/room-banggia/RoomBangGiaMatrix";

const Room_BangGiaPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<ResponsePageList<Room_BangGiaType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<Room_BangGiaSearchType | null>(
    null
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<Room_BangGiaType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "matrix">("list");

  const [loaiTinOptions, setLoaiTinOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [thuocTinhOptions, setThuocTinhOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [loaiTinRes, thuocTinhRes] = await Promise.all([
        duLieuDanhMucService.getDropdownCode("LOAITIN"),
        duLieuDanhMucService.getDropdownCode("THUOCTINHBANGGIATIN"),
      ]);
      if (loaiTinRes?.status && Array.isArray(loaiTinRes.data)) {
        setLoaiTinOptions(loaiTinRes.data);
      }
      if (thuocTinhRes?.status && Array.isArray(thuocTinhRes.data)) {
        setThuocTinhOptions(thuocTinhRes.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh mục bảng giá:", error);
    }
  }, []);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  const tableColumns: TableProps<Room_BangGiaType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Loại tin",
      dataIndex: "loaiTin",
      key: "loaiTin",
      render: (text: string, record: Room_BangGiaType) => {
        const displayLabel =
          loaiTinOptions.find((o) => o.value === text || o.label === text)
            ?.label || text || "--";
        return (
          <span style={{ fontWeight: 600, color: record.maMau || "inherit" }}>
            {displayLabel}
          </span>
        );
      },
    },
    {
      title: "Giá tin (VNĐ/ngày)",
      dataIndex: "giaTin",
      key: "giaTin",
      align: "right",
      render: (val?: number) => (
        <span style={{ fontWeight: 500, color: "#0958d9" }}>
          {val != null ? `${val.toLocaleString("vi-VN")} đ` : "--"}
        </span>
      ),
    },
    {
      title: "Mã màu",
      dataIndex: "maMau",
      key: "maMau",
      align: "center",
      width: 130,
      render: (color?: string) =>
        color ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                backgroundColor: color,
                border: "1px solid #d9d9d9",
                display: "inline-block",
              }}
            />
            <code>{color}</code>
          </div>
        ) : (
          "--"
        ),
    },
    {
      title: "Thuộc tính",
      dataIndex: "thuocTinh",
      key: "thuocTinh",
      render: (text?: string) => {
        const displayLabel =
          thuocTinhOptions.find((o) => o.value === text || o.label === text)
            ?.label || text || "--";
        return displayLabel;
      },
    },
    {
      title: "Tự động duyệt",
      dataIndex: "isTuDongDuyet",
      key: "isTuDongDuyet",
      align: "center",
      width: 120,
      render: (val?: boolean) =>
        val ? <Tag color="success">Bật</Tag> : <Tag color="default">Tắt</Tag>,
    },
    {
      title: "Duy trì 10 ngày",
      dataIndex: "isDuyTriThem10Ngay",
      key: "isDuyTriThem10Ngay",
      align: "center",
      width: 130,
      render: (val?: boolean) =>
        val ? <Tag color="success">Bật</Tag> : <Tag color="default">Tắt</Tag>,
    },
    {
      title: "Nút gọi",
      dataIndex: "isHienThiNutGoi",
      key: "isHienThiNutGoi",
      align: "center",
      width: 100,
      render: (val?: boolean) =>
        val ? <Tag color="success">Bật</Tag> : <Tag color="default">Tắt</Tag>,
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      width: 120,
      render: (_: any, record: Room_BangGiaType) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "2",
            icon: <EyeOutlined />,
            onClick: () => {
              setCurentItem(record);
              setIsOpenDetail(true);
            },
          },
          {
            label: "Chỉnh sửa",
            key: "3",
            icon: <EditOutlined />,
            onClick: () => {
              handleShowModal(true, record);
            },
          },
          {
            type: "divider",
          },
          {
            label: "Xóa",
            key: "4",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => setConfirmDeleteId(record.id ?? ""),
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
          </>
        );
      },
    },
  ];

  const hanleCreateEditSuccess = () => {
    handleLoadData();
    setCurentItem(null);
  };

  const handleDelete = async () => {
    const response = await room_BangGiaService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<Room_BangGiaSearchType>["onFinish"] = async (
    values
  ) => {
    try {
      setSearchValues(values);
      await handleLoadData(values);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
    }
  };

  const handleLoadData = useCallback(
    async (searchDataOverride?: Room_BangGiaSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = searchDataOverride || {
        pageIndex,
        pageSize,
        ...(searchValues || {}),
      };
      const response = await room_BangGiaService.getData(searchData);
      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );

  const handleShowModal = (isEdit?: boolean, item?: Room_BangGiaType) => {
    setIsOpenModal(true);
    if (isEdit) {
      setCurentItem(item ?? null);
    }
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setCurentItem(null);
  };

  const handleCloseDetail = () => {
    setIsOpenDetail(false);
  };

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-3 flex-wrap gap-2"
      >
        <AutoBreadcrumb />
        <Flex alignItems="center" gap={8} className="flex-wrap">
          <Segmented
            value={viewMode}
            onChange={(val) => setViewMode(val as "list" | "matrix")}
            options={[
              {
                label: "Quản lý danh sách",
                value: "list",
                icon: <UnorderedListOutlined />,
              },
              {
                label: "Bảng giá ma trận",
                value: "matrix",
                icon: <AppstoreOutlined />,
              },
            ]}
          />
          <Button
            icon={<ExportOutlined />}
            onClick={() => window.open("/bang-gia", "_blank")}
          >
            Mở trang Portal
          </Button>

          {viewMode === "list" && (
            <>
              <Button
                onClick={() => toggleSearch()}
                type="primary"
                icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
              >
                {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
              </Button>
              <Button
                onClick={() => {
                  handleShowModal();
                }}
                type="primary"
                icon={<PlusCircleOutlined />}
              >
                Thêm mới
              </Button>
            </>
          )}

          {isOpenModal && (
            <Room_BangGiaCreateOrUpdate
              onSuccess={hanleCreateEditSuccess}
              onClose={handleClose}
              item={currentItem}
              loaiTinOptions={loaiTinOptions}
              thuocTinhOptions={thuocTinhOptions}
            />
          )}
        </Flex>
      </Flex>

      {isOpenDetail && (
        <Room_BangGiaDetail
          item={currentItem}
          onClose={handleCloseDetail}
          loaiTinOptions={loaiTinOptions}
          thuocTinhOptions={thuocTinhOptions}
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
          <p>Bạn có chắc chắn muốn xóa mục này?</p>
        </Modal>
      )}

      {viewMode === "matrix" ? (
        <Card className="customCardShadow">
          <RoomBangGiaMatrix
            isAdmin={true}
            onEditCell={(record) => handleShowModal(true, record)}
          />
        </Card>
      ) : (
        <>
          {isPanelVisible && (
            <Search
              onFinish={onFinishSearch}
              pageIndex={pageIndex}
              pageSize={pageSize}
              loaiTinOptions={loaiTinOptions}
              thuocTinhOptions={thuocTinhOptions}
            />
          )}

          <Card className={"customCardShadow"}>
            <div className="table-responsive">
              <Table
                columns={tableColumns}
                bordered
                dataSource={data?.items}
                rowKey="id"
                scroll={{ x: "max-content" }}
                pagination={false}
                loading={loading}
              />
            </div>
            <Pagination
              className="mt-2"
              total={data?.totalCount}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} trong ${total} dữ liệu`
              }
              pageSize={pageSize}
              defaultCurrent={1}
              onChange={(e) => {
                setPageIndex(e);
              }}
              onShowSizeChange={(current, pageSize) => {
                setPageIndex(current);
                setPageSize(pageSize);
              }}
              size="small"
              align="end"
            />
          </Card>
        </>
      )}
    </>
  );
};

export default withAuthorization(Room_BangGiaPage, "");
