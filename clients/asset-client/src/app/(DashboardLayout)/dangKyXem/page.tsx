"use client";
import { useCallback, useEffect, useRef, useState } from "react";
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
  SendOutlined,
  CheckOutlined,
  AppstoreAddOutlined,
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
import DangKyXemDetail from "./detail";
import Search from "./search";
import DangKyXemNenTangList from "./DangKyXemNenTangList";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { DangKyXemSearchType } from "@/types/dang-ky-xem/request";
import dangKyXemService from "@/services/dangKyXem/dangKyXem.service";
import DangKyXemCreateOrUpdate from "./createOrUpdate";
import { DangKyXemType } from "@/types/dang-ky-xem/dto";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import DangKyXemStatusConstant from "@/constants/DangKyXemStatusConstant";
import RoleConstant from "@/constants/RoleConstant";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";

const DangKyXemPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [data, setData] = useState<PagedList<DangKyXemType>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [searchValues, setSearchValues] = useState<DangKyXemSearchType | null>(
    null,
  );
  const loading = useSelector((state) => state.general.isLoading);
  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles: string[] = authState?.User?.listRole || authState?.ListRole || [];
  const isAdmin = userRoles.includes(RoleConstant.Admin);
  const isChuyenVienSo = userRoles.includes(RoleConstant.ChuyenVienSo);
  const isChuyenVienCuc = userRoles.includes(RoleConstant.ChuyenVienCuc);
  const canApprove = isChuyenVienSo || isChuyenVienCuc;
  const canCreate = userRoles.includes(RoleConstant.CVQUANLYTHITRUONG);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<DangKyXemType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [edit, setEdit] = useState<boolean>(false);
  const [rejectItem, setRejectItem] = useState<DangKyXemType | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [attachItem, setAttachItem] = useState<DangKyXemType | null>(null);
  const [isSignDangKyXem, setIsSignDangKyXem] = useState<boolean>(false);
  const isSignDangKyXemRef = useRef<boolean>(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [signIds, setSignIds] = useState<string[]>([]);

  const handleApprove = async (id: string) => {
    dispatch(setIsLoading(true));
    try {
      const res = await dangKyXemService.approve(id);
      if (res.status) {
        message.success("Phê duyệt thành công");
        handleLoadData();
      } else {
        message.error(res.message || "Lỗi khi phê duyệt");
      }
    } catch (error: any) {
      message.error("Đã xảy ra lỗi");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      message.error("Vui lòng nhập lý do từ chối");
      return;
    }
    dispatch(setIsLoading(true));
    try {
      const res = await dangKyXemService.reject({ ...rejectItem!, lyDoTuChoi: rejectReason });
      if (res.status) {
        message.success("Từ chối thành công");
        setRejectItem(null);
        setRejectReason("");
        handleLoadData();
      } else {
        message.error(res.message || "Lỗi khi từ chối");
      }
    } catch (error: any) {
      message.error("Đã xảy ra lỗi");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const tableColumns: TableProps<DangKyXemType>["columns"] = [
    {
      title: "STT",
      width: 70,
      align: "center",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1 + (pageIndex - 1) * pageSize,
    },
    {
      title: "Nền tảng đăng ký xem",
      dataIndex: "nenTangMuonXem",
    },
    {
      title: "Nền tảng đã gắn",
      dataIndex: "nenTangDaGan",
      render: (val: string) => val || ""
    },
    {
      title: "Loại gửi đề xuất",
      dataIndex: "typeGuiDeXuat_txt",

    },
    {
      title: "Người đề xuất",
      dataIndex: "hoTen",

    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai_txt",
      align: "center",
      render: (val: string, record: DangKyXemType) => {
        const statusVal = record.trangThai;
        if (statusVal === undefined || statusVal === null) return <Tag color="default">{val || "Chưa xác định"}</Tag>;
        return (
          <Tag color={DangKyXemStatusConstant.getColor(statusVal)}>
            {DangKyXemStatusConstant.getDisplayName(statusVal)}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      align: "center",
      render: (val: Date) => val ? dayjs(val).format("DD/MM/YYYY") : "—",
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      width: 150,
      render: (_: any, record: DangKyXemType) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "2",
            icon: <EyeOutlined />,
            onClick: () => {
              router.push(`/dangKyXem/detail/${record.id}`);
            },
          }
        ];

        if (record.createdId === currentUser?.id && (record.trangThai === 0 || record.trangThai === 3)) {
          items.push({
            label: "Chỉnh sửa",
            key: "3",
            icon: <EditOutlined />,
            onClick: () => {
              handleShowModal(true, record);
            },
          });
        }

        if (record.createdId === currentUser?.id && (record.trangThai === 0)) {
          items.push({
            label: "Gửi duyệt",
            key: "send",
            icon: <SendOutlined />,
            onClick: () => {
              Modal.confirm({
                title: "Xác nhận gửi duyệt",
                content: "Bạn có chắc chắn muốn gửi duyệt đăng ký xem này?",
                onOk: () => {
                  if (isSignDangKyXemRef.current) {
                    setSignIds([record.id!]);
                    setIsSignModalOpen(true);
                  } else {
                    handleGuiDuyet(record);
                  }
                },
              });
            },
          });
        }

        if (record.trangThai === 1 && canApprove) {
          items.push({
            label: "Phê duyệt",
            key: "approve",
            icon: <CheckOutlined />,
            onClick: () => {
              Modal.confirm({
                title: "Xác nhận phê duyệt",
                content: "Bạn có chắc chắn muốn phê duyệt đề xuất này?",
                onOk: () => handleApprove(record.id!),
              });
            },
          });
          items.push({
            label: "Từ chối",
            key: "reject",
            icon: <CloseOutlined />,
            onClick: () => setRejectItem(record),
          });
        }

        if (record.trangThai === 2 && canApprove) {
          items.push({
            label: "Gắn nền tảng",
            key: "attach",
            icon: <AppstoreAddOutlined />,
            onClick: () => setAttachItem(record),
          });
        }

        if (record.createdId === currentUser?.id && (record.trangThai === 0 || record.trangThai === 3)) {
          items.push(
            {
              type: "divider",
            },
            {
              label: "Xóa",
              key: "4",
              danger: true,
              icon: <DeleteOutlined />,
              onClick: () => setConfirmDeleteId(record.id ?? ""),
            }
          );
        }
        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button onClick={(e) => e.preventDefault()} type="default" size="small">
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

  const handleCreateEditSuccess = () => {
    handleLoadData();
    setCurentItem(null);
  };

  const handleGuiDuyet = async (record: DangKyXemType) => {
    dispatch(setIsLoading(true));
    try {
      const payload = {
        ...record,
        trangThai: 1,
      };
      const res = await dangKyXemService.update(payload);
      if (res.status) {
        message.success("Gửi duyệt thành công!");
        handleLoadData();
      } else {
        message.error(res.message || "Gửi duyệt thất bại!");
      }
    } catch (error: any) {
      message.error(error?.message || "Đã xảy ra lỗi");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleDelete = async () => {
    const response = await dangKyXemService.delete(confirmDeleteId ?? "");
    if (response.status) {
      message.success("Xóa thành công");
      handleLoadData();
    } else {
      message.error(response.message || "Xóa thất bại");
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<DangKyXemSearchType>["onFinish"] = async (
    values,
  ) => {
    setSearchValues(values);
    setPageIndex(1);
    await handleLoadData({ ...values, pageIndex: 1, pageSize });
  };

  const handleLoadData = useCallback(
    async (searchDataOverride?: DangKyXemSearchType) => {
      dispatch(setIsLoading(true));
      try {
        const searchData = searchDataOverride || {
          pageIndex,
          pageSize,
          ...searchValues,
        };
        const response = await dangKyXemService.getData(searchData);
        if (response?.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [dispatch, pageIndex, pageSize, searchValues],
  );

  const handleShowModal = (isEdit?: boolean, item?: DangKyXemType) => {
    setIsOpenModal(true);
    setEdit(false);
    if (isEdit) {
      setEdit(true);
      setCurentItem(item ?? null);
    }
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setCurentItem(null);
  };

  const handleCloseDetail = () => {
    setIsOpenDetail(false);
    setCurentItem(null);
  };

  const handleSignSuccess = async (
    result: any[],
    certificate: any,
  ) => {
    dispatch(setIsLoading(true));
    try {
      const responseSign = await dangKyXemService.sign({
        signResultItems: result,
        certificateInfo: certificate,
      });

      if (!responseSign.status) {
        message.error(responseSign.message || "Lỗi ký số hồ sơ");
        return;
      }

      const promises = result.map((item) => {
        const record = data?.items.find((r) => r.id === item.id);
        const payload = {
          ...record,
          trangThai: 1,
        };
        return dangKyXemService.update(payload);
      });

      const results = await Promise.all(promises);
      const failedCount = results.filter((r) => !r.status).length;

      if (failedCount === 0) {
        message.success("Ký số và gửi duyệt đăng ký xem thành công!");
        handleLoadData();
      } else if (failedCount < result.length) {
        message.warning(`Đã xử lý xong, nhưng có ${failedCount} hồ sơ cập nhật trạng thái thất bại`);
        handleLoadData();
      } else {
        message.error("Ký số thành công nhưng gửi duyệt thất bại");
      }
    } catch (error: any) {
      message.error(error?.message || "Lỗi trong quá trình ký số và gửi duyệt");
    } finally {
      dispatch(setIsLoading(false));
      setIsSignModalOpen(false);
    }
  };

  const getIsSignDangKyXem = useCallback(async () => {
    try {
      const res = await duLieuDanhMucService.getAllByGroupCode("CAUHINH_SIGN_NENTANG");
      if (res.status && res.data?.length) {
        const signConfig = res.data.find(
          (item: any) => item.code === "SIGN_DANGKYXEMNENTANG"
        );
        const val = Number(signConfig?.priority) === 1;
        setIsSignDangKyXem(val);
        isSignDangKyXemRef.current = val;
      }
    } catch (error) {
      console.error("Lỗi khi tải cấu hình ký số:", error);
    }
  }, []);

  useEffect(() => {
    handleLoadData();
    getIsSignDangKyXem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, getIsSignDangKyXem]);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-2 flex-wrap justify-content-end"
      >
        <AutoBreadcrumb />

        <div className="btn-group flex" style={{ gap: 12 }}>
          <Button
            onClick={toggleSearch}
            type={isPanelVisible ? "default" : "primary"}
            size="middle"
            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
          {canCreate && (
            <Button
              onClick={() => handleShowModal(false)}
              type="primary"
              icon={<PlusCircleOutlined />}
              size="middle"
            >
              Thêm mới
            </Button>
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

      {confirmDeleteId && (
        <Modal
          title="Xác nhận xóa"
          open={true}
          onOk={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa dữ liệu này?</p>
        </Modal>
      )}

      {isOpenModal && (
        <DangKyXemCreateOrUpdate
          onSuccess={handleCreateEditSuccess}
          onClose={handleClose}
          item={currentItem}
          isEdit={edit}
          open={true}
        />
      )}

      {rejectItem && (
        <Modal
          title="Từ chối phê duyệt"
          open={true}
          onOk={submitReject}
          onCancel={() => {
            setRejectItem(null);
            setRejectReason("");
          }}
          okText="Xác nhận từ chối"
          cancelText="Hủy"
        >
          <p>Nhập lý do từ chối:</p>
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Lý do từ chối..."
          />
        </Modal>
      )}

      {attachItem && (
        <Modal
          title="Gắn nền tảng"
          open={true}
          onCancel={() => setAttachItem(null)}
          footer={null}
          width={900}
        >
          <DangKyXemNenTangList dangKyXemId={attachItem.id!} readOnly={false} onChange={handleLoadData} />
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
            onChange={(page, size) => {
              setPageIndex(page);
              setPageSize(size);
            }}
            showSizeChanger
            align="end"
          />
        </div>
      </Card>
      <DigitalSignatureModal
        ids={signIds}
        open={isSignModalOpen}
        onCancel={() => setIsSignModalOpen(false)}
        onSignSuccess={handleSignSuccess}
        signerService={dangKyXemService}
      />
    </>
  );
};

export default withAuthorization(DangKyXemPage, "");
