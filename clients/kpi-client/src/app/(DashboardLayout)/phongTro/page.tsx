"use client";
import { useCallback, useEffect, useState } from "react";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageList } from "@/types/general";
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
  Image,
  MenuProps,
  Modal,
  Pagination,
  Space,
  Table,
  TableProps,
  Tag,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import PhongTroDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  PhongTroSearchType,
  PhongTroType,
} from "@/types/phongTro/phongTro";
import phongTroService from "@/services/phongTro/phongTroService";
import PhongTroCreateOrUpdate from "./createOrUpdate";
import { buildFileUrl } from "@/utils/file";

const PhongTroPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<ResponsePageList<PhongTroType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<PhongTroSearchType | null>(
    null
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<PhongTroType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const tableColumns: TableProps<PhongTroType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Hình ảnh",
      dataIndex: "hinhAnhDaiDien",
      key: "hinhAnhDaiDien",
      align: "center",
      width: 90,
      render: (_: any, record: PhongTroType) => {
        const rawImg =
          record.hinhAnhDaiDien ||
          record.danhSachHinhAnh?.split(/[;,]/)[0]?.trim();
        const imgUrl = rawImg ? buildFileUrl(rawImg) : "";
        const allImgs = record.danhSachHinhAnh
          ? record.danhSachHinhAnh
              .split(/[;,]/)
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s) => buildFileUrl(s))
          : imgUrl
          ? [imgUrl]
          : [];

        if (!imgUrl) {
          return (
            <div
              style={{
                width: 65,
                height: 48,
                borderRadius: 6,
                background: "#f3f4f6",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: 10,
                border: "1px dashed #d1d5db",
                margin: "0 auto",
              }}
            >
              Chưa có ảnh
            </div>
          );
        }

        return (
          <div style={{ position: "relative", display: "inline-block" }}>
            <Image
              src={imgUrl}
              alt={record.tieuDe}
              width={65}
              height={48}
              style={{
                borderRadius: 6,
                objectFit: "cover",
                border: "1px solid #e5e7eb",
                display: "block",
              }}
              fallback="https://via.placeholder.com/65x48?text=No+Image"
            />
            {allImgs.length > 1 && (
              <span
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: 2,
                  background: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  fontSize: 10,
                  padding: "0 4px",
                  borderRadius: 4,
                  lineHeight: "14px",
                  fontWeight: 500,
                }}
              >
                +{allImgs.length}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Tiêu đề & Phòng",
      dataIndex: "tieuDe",
      render: (_: any, record: PhongTroType) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.tieuDe}</div>
          <div style={{ marginTop: 4 }}>
            {record.maPhong && <Tag color="blue">{record.maPhong}</Tag>}
            {record.loaiPhong && <Tag color="cyan">{record.loaiPhong}</Tag>}
            {record.isNoiBat && <Tag color="gold">Nổi bật</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: "Giá thuê",
      dataIndex: "giaChoThue",
      render: (val?: number) =>
        val ? (
          <span style={{ color: "#f5222d", fontWeight: "bold" }}>
            {val.toLocaleString()} đ/tháng
          </span>
        ) : (
          <span style={{ color: "#8c8c8c" }}>Thỏa thuận</span>
        ),
    },
    {
      title: "Diện tích",
      dataIndex: "dienTich",
      render: (val?: number) => (val ? `${val} m²` : "-"),
    },
    {
      title: "Khu vực",
      dataIndex: "diaChi",
      render: (_: any, record: PhongTroType) => {
        const parts = [record.tenXa, record.tenHuyen, record.tenTinh].filter(Boolean);
        return <span>{parts.length > 0 ? parts.join(", ") : record.diaChi || "-"}</span>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      render: (val?: number) => {
        if (val === 0) return <Tag color="green">Còn trống</Tag>;
        if (val === 1) return <Tag color="red">Đã thuê</Tag>;
        return <Tag color="default">Tạm ngưng</Tag>;
      },
    },
    {
      title: "Kiểm duyệt",
      dataIndex: "trangThaiDuyet",
      render: (val?: number) => {
        if (val === 1) return <Tag color="success">Đã duyệt</Tag>;
        if (val === 0) return <Tag color="warning">Chờ duyệt</Tag>;
        if (val === 2) return <Tag color="error">Từ chối</Tag>;
        return <Tag color="default">Hết hạn</Tag>;
      },
    },
    {
      title: "Gói tin",
      dataIndex: "goiTin",
      render: (val?: number) => {
        if (val === 3) return <Tag color="magenta">VIP Nổi bật</Tag>;
        if (val === 2) return <Tag color="purple">VIP 2</Tag>;
        if (val === 1) return <Tag color="blue">VIP 1</Tag>;
        return <Tag>Thường</Tag>;
      },
    },
    {
      title: "Lượt xem",
      dataIndex: "luotXem",
      align: "center",
      render: (val?: number) => val ?? 0,
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      render: (_: any, record: PhongTroType) => {
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
              <Button
                onClick={(e) => e.preventDefault()}
                color="primary"
              >
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
    const response = await phongTroService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
      setConfirmDeleteId(null);
    } else {
      toast.error(response.message);
    }
  };

  const handleClose = () => {
    setIsOpenModal(false);
  };

  const handleShowModal = (isEdit: boolean = false, item?: PhongTroType) => {
    if (isEdit && item) {
      setCurentItem(item);
    } else {
      setCurentItem(null);
    }
    setIsOpenModal(true);
  };

  const handleCloseDetail = () => {
    setIsOpenDetail(false);
    setCurentItem(null);
  };

  const handleLoadData = useCallback(async () => {
    dispatch(setIsLoading(true));
    try {
      const searchData = {
        ...searchValues,
        pageIndex: pageIndex,
        pageSize: pageSize,
      };
      const response: any = await phongTroService.getData(searchData);
      if (response.status) {
        setData(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, pageIndex, pageSize, searchValues]);

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  const onFinishSearch = (values: PhongTroSearchType) => {
    setSearchValues(values);
    setPageIndex(1);
  };

  return (
    <>
      <AutoBreadcrumb
        items={[
          {
            title: "Trang chủ",
            path: "/",
          },
          {
            title: "Quản lý phòng trọ",
            path: "/phongTro",
          },
        ]}
      />
      <Flex
        alignItems="center"
        justifyContent="flex-end"
        className="mb-3"
      >
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setIsPanelVisible(!isPanelVisible);
            }}
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
          {isOpenModal && (
            <PhongTroCreateOrUpdate
              onSuccess={hanleCreateEditSuccess}
              onClose={handleClose}
              item={currentItem}
            />
          )}
        </div>
      </Flex>
      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
      )}
      {isOpenDetail && (
        <PhongTroDetail item={currentItem} onClose={handleCloseDetail} />
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
  );
};

export default withAuthorization(PhongTroPage, "");
