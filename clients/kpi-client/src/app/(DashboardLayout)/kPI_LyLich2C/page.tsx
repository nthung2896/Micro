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
  BankOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  UploadOutlined,
  UserAddOutlined,
  TeamOutlined,
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
  ConfigProvider,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import KPI_LyLich2CDetail from "./detail";
import Search from "./search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_LyLich2CSearchType,
  KPI_LyLich2CType,
} from "@/types/kPI_LyLich2C/kPI_LyLich2C";
import kPI_LyLich2CService from "@/services/kPI_LyLich2C/kPI_LyLich2CService";
import KPI_LyLich2CCreateOrUpdate from "./createOrUpdate";
import KPI_LyLich2CImport from "./import";
import EditUserRole, { UserRoleAssignmentUser } from "../QLNguoiDung/editUserRole";
import { DropdownOption } from "@/types/general";


const KPI_LyLich2CPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<ResponsePageList<KPI_LyLich2CType[]>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<KPI_LyLich2CSearchType | null>(
    null
  );
  const loading = useSelector((state) => state.general.isLoading);
  const currentUser = useSelector((state: any) => state.auth.User);
  const authState = useSelector((state: any) => state.auth);
  const userRoles: string[] = currentUser?.listRole || authState?.ListRole || [];
  const isAdmin = userRoles.some((r: string) =>
    r.toLowerCase() === "admin" ||
    r.toLowerCase() === "superadmin" ||
    r.toLowerCase().includes("admin")
  );
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<KPI_LyLich2CType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmCreateAccountId, setConfirmCreateAccountId] = useState<string | null>(null);
  const [confirmCreateAllAccounts, setConfirmCreateAllAccounts] = useState<boolean>(false);
  const [isOpenImportModal, setIsOpenImportModal] = useState<boolean>(false);
  const [isOpenEditUserRole, setIsOpenEditUserRole] = useState<boolean>(false);
  const [currentRoleUser, setCurrentRoleUser] = useState<UserRoleAssignmentUser | null>(null);
  const [dropVaiTros, setDropVaiTros] = useState<DropdownOption[]>([]);

  const tableColumns: TableProps<KPI_LyLich2CType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },

    {
      title: "Họ và Tên",
      dataIndex: "hoTen",
      key: "hoTen",
      width: 280,
      render: (v: string, record: KPI_LyLich2CType) => (
        <div>
          <div className="font-semibold text-gray-900">{v || "-"}</div>
          <div className="flex flex-col gap-1 mt-1">
            {record.userName && (
              <div className="text-xs">
                <span className="text-gray-500 mr-1">Tài khoản:</span>
                <span className="inline-block px-2 py-0.5 font-medium bg-blue-100 text-blue-700 rounded-md border border-blue-200">
                  {record.userName}
                </span>
              </div>
            )}
            {record.roleNames && record.roleNames.length > 0 && (
              <div className="text-xs flex flex-wrap items-center gap-1">
                <span className="text-gray-500">Vai trò:</span>
                {record.roleNames.map((roleName) => (
                  <span
                    key={roleName}
                    className="inline-block px-2 py-0.5 font-medium bg-cyan-100 text-cyan-700 rounded-md"
                  >
                    {roleName}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Đơn vị",
      dataIndex: "donVi",
      key: "donVi",
      width: 350,
      render: (_: any, record: KPI_LyLich2CType) => (
        <div className="flex flex-col gap-1">
          {record.donViSuDungName && (
            <div className="font-medium text-blue-700 flex items-start gap-2">
              <BankOutlined className="mt-1 opacity-70" />
              <span>{record.donViSuDungName}</span>
            </div>
          )}
          {record.phongBanName && (
            <div className="text-sm text-gray-600 flex items-start gap-2 pl-2">
              <span className="text-gray-400">└─</span>
              <span>{record.phongBanName}</span>
            </div>
          )}
          {!record.donViSuDungName && !record.phongBanName && <span>-</span>}
        </div>
      ),
    },
    {
      title: "Giới Tính",
      dataIndex: "gioiTinh",
      key: "gioiTinh",
      width: 90,
      align: "center",
      render: (v: number) => (v === 1 ? "Nam" : v === 2 ? "Nữ" : "-"),
    },
    {
      title: "Ngày Sinh",
      dataIndex: "ngaysinh",
      key: "ngaysinh",
      width: 110,
      align: "center",
      render: (v: any) => <span>{extensions.toDateString(v)}</span>,
    },
    {
      title: "Chức Vụ",
      dataIndex: "chucVuHienTai",
      key: "chucVuHienTai",
      width: 180,
      render: (_: any, record: KPI_LyLich2CType) => (
        <span className="font-medium text-gray-800">
          {record.chucVuHienTaiName || record.chucVuHienTai || "-"}
        </span>
      ),
    },
    {
      title: "Trình Độ",
      dataIndex: "trinhDoMax",
      key: "trinhDoMax",
      width: 150,
      render: (_: any, record: KPI_LyLich2CType) => (
        <span className="font-medium text-gray-800">
          {record.trinhDoMaxName || record.trinhDoMax || "-"}
        </span>
      ),
    },
    {
      title: "Lý Luận Chính Trị",
      dataIndex: "lyLuanChinhTri",
      key: "lyLuanChinhTri",
      width: 160,
      render: (_: any, record: KPI_LyLich2CType) => (
        <span className="font-medium text-gray-800">
          {record.lyLuanChinhTriName || record.lyLuanChinhTri || "-"}
        </span>
      ),
    },
    {
      title: "Loại Hợp Đồng",
      dataIndex: "loaiHopDong",
      key: "loaiHopDong",
      width: 180,
      render: (_: any, record: KPI_LyLich2CType) => (
        <span className="font-medium text-gray-800">
          {record.loaiHopDongName || record.loaiHopDong || "-"}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 180,
      render: (v: string) => <span>{v || "-"}</span>,
    },
    {
      title: "Điện Thoại",
      dataIndex: "phone",
      key: "phone",
      width: 120,
      render: (v: string) => <span>{v || "-"}</span>,
    },



    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      width: 120,
      render: (_: any, record: KPI_LyLich2CType) => {
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
          ...(isAdmin && record.userId && record.userName
            ? [
              {
                label: "Phân quyền",
                key: "editUserRole",
                icon: <UserAddOutlined />,
                onClick: () => {
                  setCurrentRoleUser({
                    id: record.userId,
                    name: record.hoTen,
                    vaiTro: record.roleCodes ?? [],
                  });
                  setIsOpenEditUserRole(true);
                },
              },
            ]
            : []),
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
          ...(!record.userName
            ? [
              {
                label: "Tạo tài khoản",
                key: "5",
                icon: <UserAddOutlined />,
                onClick: () => setConfirmCreateAccountId(record.id ?? ""),
              },
            ]
            : []),
        ];
        return (
          <>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button
                onClick={(e) => e.preventDefault()}
                type="default"
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
    const response = await kPI_LyLich2CService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const handleCreateAccount = async () => {
    try {
      const response = await kPI_LyLich2CService.createAccountByLyLichId(confirmCreateAccountId ?? "");
      if (response.status) {
        toast.success(response.message || "Tạo tài khoản thành công!");
        handleLoadData();
      } else {
        toast.error(response.message || "Tạo tài khoản thất bại!");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tạo tài khoản!");
    } finally {
      setConfirmCreateAccountId(null);
    }
  };

  const handleCreateAllAccounts = async () => {
    try {
      dispatch(setIsLoading(true));
      const response = await kPI_LyLich2CService.createAccountForAll();
      if (response.status) {
        toast.success(response.message || "Tạo tài khoản hàng loạt thành công!");
        handleLoadData();
      } else {
        toast.error(response.message || "Tạo tài khoản hàng loạt thất bại!");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tạo tài khoản hàng loạt!");
    } finally {
      setConfirmCreateAllAccounts(false);
      dispatch(setIsLoading(false));
    }
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<KPI_LyLich2CSearchType>["onFinish"] = async (
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
    async (searchDataOverride?: KPI_LyLich2CSearchType) => {
      dispatch(setIsLoading(true));

      const searchData = searchDataOverride || {
        pageIndex,
        pageSize,
        ...(searchValues || {}),
      };
      const response = await kPI_LyLich2CService.getData(searchData);
      if (response != null && response.data != null) {
        const data = response.data;
        setData(data);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_LyLich2CType) => {
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

  const styledColumns = tableColumns?.map((col) => ({
    ...col,
    onHeaderCell: () => ({
      style: {
        backgroundColor: "#0355a2",
        color: "#ffffff",
        fontWeight: 600,
        textAlign: "center" as const,
      },
    }),
  }));

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-2 flex-wrap justify-content-end"
      >
        <AutoBreadcrumb />

        <Space>
          <Button
            onClick={() => toggleSearch()}
            type="primary"
            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
          <Button
            onClick={() => handleShowModal()}
            type="primary"
            icon={<PlusCircleOutlined />}
          >
            Thêm mới
          </Button>
          <Button
            onClick={() => setIsOpenImportModal(true)}
            type="default"
            icon={<UploadOutlined />}
          >
            Nhập (Import)
          </Button>
          <Button
            onClick={() => setConfirmCreateAllAccounts(true)}
            type="primary"
            icon={<TeamOutlined />}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Tạo tài khoản hàng loạt
          </Button>

          {isOpenModal && (
            <KPI_LyLich2CCreateOrUpdate
              onSuccess={hanleCreateEditSuccess}
              onClose={handleClose}
              item={currentItem}
            />
          )}
          {isOpenImportModal && (
            <KPI_LyLich2CImport
              onClose={() => setIsOpenImportModal(false)}
              onSuccess={() => handleLoadData()}
            />
          )}
        </Space>
      </Flex>
      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
          pageIndex={pageIndex}
          pageSize={pageSize}
          columns={tableColumns}
        />
      )}
      {isOpenDetail && (
        <KPI_LyLich2CDetail item={currentItem} onClose={handleCloseDetail} />
      )}
      <EditUserRole
        user={currentRoleUser}
        isOpen={isOpenEditUserRole}
        onClose={() => {
          setIsOpenEditUserRole(false);
          setCurrentRoleUser(null);
        }}
        onSuccess={handleLoadData}
        dropVaiTros={dropVaiTros}
        setDropVaiTros={setDropVaiTros}
      />

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

      {confirmCreateAccountId && (
        <Modal
          title="Xác nhận tạo tài khoản"
          open={true}
          onOk={handleCreateAccount}
          onCancel={() => setConfirmCreateAccountId(null)}
          okText="Tạo tài khoản"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn tạo tài khoản cho lý lịch này?</p>
        </Modal>
      )}

      {confirmCreateAllAccounts && (
        <Modal
          title="Xác nhận tạo tài khoản hàng loạt"
          open={true}
          onOk={handleCreateAllAccounts}
          onCancel={() => setConfirmCreateAllAccounts(false)}
          okText="Đồng ý"
          cancelText="Hủy"
        >
          <p>Hệ thống sẽ tự động tạo tài khoản cho tất cả các lý lịch chưa có tài khoản. Bạn có chắc chắn muốn tiếp tục?</p>
        </Modal>
      )}
      <Card className={"customCardShadow"}>
        <div className="table-responsive">
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: "#0355a2",
                  headerColor: "#ffffff",
                },
              },
            }}
          >
            <Table
              columns={styledColumns}
              bordered
              dataSource={data?.items}
              rowKey="id"
              scroll={{ x: "max-content" }}
              pagination={false}
              loading={loading}
            />
          </ConfigProvider>
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

export default withAuthorization(KPI_LyLich2CPage, "");
