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
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import KPI_NhiemVuDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_NhiemVuSearchType,
  KPI_NhiemVuType,
} from "@/types/kPI_NhiemVu/kPI_NhiemVu";
import kPI_NhiemVuService from "@/services/kPI_NhiemVu/kPI_NhiemVuService";
import KPI_NhiemVuCreateOrUpdate from "./createOrUpdate";


const KPI_NhiemVuPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<ResponsePageList<KPI_NhiemVuType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<KPI_NhiemVuSearchType | null>(
    null
  );
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<KPI_NhiemVuType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const tableColumns: TableProps<KPI_NhiemVuType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
			title: "IdNhiemVuTraVe",
			dataIndex: "idNhiemVuTraVe",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.idNhiemVuTraVe}</span>
			),
		},
		{
			title: "TenNhiemVuDayDu",
			dataIndex: "tenNhiemVuDayDu",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.tenNhiemVuDayDu}</span>
			),
		},
		{
			title: "TenNhiemVuRutGon",
			dataIndex: "tenNhiemVuRutGon",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.tenNhiemVuRutGon}</span>
			),
		},
		{
			title: "MaLoaiNhiemVu",
			dataIndex: "maLoaiNhiemVu",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.maLoaiNhiemVu}</span>
			),
		},
		{
			title: "TenLoaiNhiemVu",
			dataIndex: "tenLoaiNhiemVu",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.tenLoaiNhiemVu}</span>
			),
		},
		{
			title: "NhiemVuTrongTam",
			dataIndex: "nhiemVuTrongTam",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.nhiemVuTrongTam}</span>
			),
		},
		{
			title: "ThoiHan",
			dataIndex: "thoiHan",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{extensions.toDateString(record.thoiHan)}</span>
			),
		},
		{
			title: "NgayHoanThanh",
			dataIndex: "ngayHoanThanh",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{extensions.toDateString(record.ngayHoanThanh)}</span>
			),
		},
		{
			title: "NgayVanBan",
			dataIndex: "ngayVanBan",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{extensions.toDateString(record.ngayVanBan)}</span>
			),
		},
		{
			title: "MaNhiemVuCha",
			dataIndex: "maNhiemVuCha",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.maNhiemVuCha}</span>
			),
		},
		{
			title: "LoaiHanXuLy",
			dataIndex: "loaiHanXuLy",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.loaiHanXuLy}</span>
			),
		},
		{
			title: "Email",
			dataIndex: "email",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.email}</span>
			),
		},
		{
			title: "IdDotTheoDoiDanhGia",
			dataIndex: "idDotTheoDoiDanhGia",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.idDotTheoDoiDanhGia}</span>
			),
		},
		{
			title: "IdLyLich",
			dataIndex: "idLyLich",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.idLyLich}</span>
			),
		},
		{
			title: "IdPhongBan",
			dataIndex: "idPhongBan",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.idPhongBan}</span>
			),
		},
		{
			title: "TenPhongBan",
			dataIndex: "tenPhongBan",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.tenPhongBan}</span>
			),
		},
		{
			title: "IdNguoiXuLy",
			dataIndex: "idNguoiXuLy",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.idNguoiXuLy}</span>
			),
		},
		{
			title: "TenNguoiXuLy",
			dataIndex: "tenNguoiXuLy",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.tenNguoiXuLy}</span>
			),
		},
		{
			title: "IdLinhVuc",
			dataIndex: "idLinhVuc",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.idLinhVuc}</span>
			),
		},
		{
			title: "TenLinhVuc",
			dataIndex: "tenLinhVuc",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.tenLinhVuc}</span>
			),
		},
		{
			title: "SoLanCapNhatTienDo",
			dataIndex: "soLanCapNhatTienDo",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.soLanCapNhatTienDo}</span>
			),
		},
		{
			title: "IsHoanThanh",
			dataIndex: "isHoanThanh",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.isHoanThanh}</span>
			),
		},
		{
			title: "IsDaDuyet",
			dataIndex: "isDaDuyet",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.isDaDuyet}</span>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.status}</span>
			),
		},
		{
			title: "KetQuaXuLyMoiNhat",
			dataIndex: "ketQuaXuLyMoiNhat",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.ketQuaXuLyMoiNhat}</span>
			),
		},
		{
			title: "KetQuaTuXepLoai",
			dataIndex: "ketQuaTuXepLoai",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.ketQuaTuXepLoai}</span>
			),
		},
		{
			title: "KetQuaPhoPhongXepLoai",
			dataIndex: "ketQuaPhoPhongXepLoai",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.ketQuaPhoPhongXepLoai}</span>
			),
		},
		{
			title: "KetQuaLanhDaoXepLoai",
			dataIndex: "ketQuaLanhDaoXepLoai",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.ketQuaLanhDaoXepLoai}</span>
			),
		},
		{
			title: "Type",
			dataIndex: "type",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.type}</span>
			),
		},
		{
			title: "TypeCaNhanTruongBan",
			dataIndex: "typeCaNhanTruongBan",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.typeCaNhanTruongBan}</span>
			),
		},
		{
			title: "EmailsNguoiThucHien",
			dataIndex: "emailsNguoiThucHien",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{record.emailsNguoiThucHien}</span>
			),
		},
		{
			title: "TimeDongBo",
			dataIndex: "timeDongBo",
			render: (_: any, record: KPI_NhiemVuType) => (
				<span>{extensions.toDateString(record.timeDongBo)}</span>
			),
		},
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      render: (_: any, record: KPI_NhiemVuType) => {
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
                type="primary"
                
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
    const response = await kPI_NhiemVuService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<KPI_NhiemVuSearchType>["onFinish"] = async (
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
    async (searchDataOverride?: KPI_NhiemVuSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = searchDataOverride || {
        pageIndex,
        pageSize,
        ...(searchValues || {}),
      };
      const response = await kPI_NhiemVuService.getData(searchData);
      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_NhiemVuType) => {
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
        className="mb-2 "
      >
        <AutoBreadcrumb />
        <div className="btn-group" style={{ gap: "10px" }}>
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
          {isOpenModal && (
            <KPI_NhiemVuCreateOrUpdate
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
        <KPI_NhiemVuDetail item={currentItem} onClose={handleCloseDetail} />
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
          
          align="end"
        />
      </Card>
    </>
  );
};

export default withAuthorization(KPI_NhiemVuPage, "");
