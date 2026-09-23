import React, { useState } from "react";
import {
  Card,
  Table,
  TableColumnsType,
  Pagination,
  Tag,
  Button,
  Space,
  Modal,
  message,
  Select,
  Input,
  Tooltip,
  Dropdown,
  Radio,
} from "antd";
import Flex from "@/components/shared-components/Flex";
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  MailOutlined,
  MoreOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/services/index";
import notificationService from "@/services/notification/notification.service";
import Text from "antd/es/typography/Text";
import { MenuProps } from "antd/lib";
import ConstractStatusConstant from "@/constants/ConstractStatusConstant";
import dayjs from "dayjs";

interface TargetsTabProps {
  data: any[];
  pageData: { pageIndex: number; pageSize: number; totalCount: number };
  onFetch: (params?: any) => void;
  loading?: boolean;
  isGuiMail?: boolean;
  bcFormTemplatesId?: string;
}

const TargetsTab: React.FC<TargetsTabProps> = ({
  data,
  pageData,
  onFetch,
  loading,
  isGuiMail,
  bcFormTemplatesId,
}) => {
  const params = useParams();
  const router = useRouter();
  const idDotBaoCao = params.id as string;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [platformPage, setPlatformPage] = useState({
    pageIndex: 1,
    pageSize: 5,
    totalCount: 0,
  });
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<React.Key[]>(
    [],
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<any[]>([]);
  const [addingTargets, setAddingTargets] = useState(false);
  const [modalTypeFilter, setModalTypeFilter] = useState<string | undefined>(
    undefined,
  );
  const [modalStatusFilter, setModalStatusFilter] = useState<number[]>([]);
  const [modalSearchKeyword, setModalSearchKeyword] = useState("");
  const [modalSearchType, setModalSearchType] = useState<
    "name" | "taxCode" | "domain"
  >("name");
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectingAll, setSelectingAll] = useState(false);
  const [sendingMailAll, setSendingMailAll] = useState(false);
  const [pendingMailCount, setPendingMailCount] = useState(0);
  const [pendingNotificationCount, setPendingNotificationCount] = useState(0);
  const [approvingAll, setApprovingAll] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [sendingNotificationAll, setSendingNotificationAll] = useState(false);

  React.useEffect(() => {
    setPendingMailCount(data.filter((x) => x.status === "CHOGUIMAIL").length);
    setPendingNotificationCount(
      data.filter((x) => x.status === "CHOGUIMAIL" || x.status === "DRAFT")
        .length,
    );
    setSubmittedCount(data.filter((x) => x.status === "SUBMITTED").length);
  }, [data]);

  const fetchPlatforms = async (
    pageIndex = 1,
    pageSize = 10,
    extraFilters?: {
      PlatformManageTypeId?: string;
      listStatus?: number[];
      keyword?: string;
      searchType?: "name" | "taxCode" | "domain";
    },
  ) => {
    setPlatformLoading(true);
    try {
      const keyword = extraFilters?.keyword ?? "";
      const searchType = extraFilters?.searchType ?? "name";
      const searchParams = {
        pageIndex,
        pageSize,
        IdDotBaoCao: idDotBaoCao,
        ...(extraFilters?.PlatformManageTypeId
          ? { PlatformManageTypeId: extraFilters.PlatformManageTypeId }
          : {}),
        ...(extraFilters?.listStatus && extraFilters.listStatus.length > 0
          ? { listStatus: extraFilters.listStatus }
          : {}),
        ...(keyword
          ? {
              [searchType === "name"
                ? "Name"
                : searchType === "taxCode"
                  ? "CompanyTaxCode"
                  : "Domain"]: keyword,
            }
          : {}),
      };
      // Fetch platforms not in the reporting period
      const response = await apiService.post<any>(
        "/BCBaoCaoDoiTuong/GetNenTang",
        searchParams,
      );
      if (response?.data) {
        setPlatforms(response.data.items || []);
        setPlatformPage({
          pageIndex: response.data.pageIndex,
          pageSize: response.data.pageSize,
          totalCount: response.data.totalCount,
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải đối tượng chưa add:", error);
      message.error("Lỗi khi tải danh sách đối tượng");
    } finally {
      setPlatformLoading(false);
    }
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
    setSelectedPlatformIds([]);
    setSelectedPlatforms([]);
    setModalTypeFilter(undefined);
    setModalStatusFilter([]);
    setModalSearchKeyword("");
    setModalSearchType("name");
    setPlatforms([]);
  };

  // const handleDelete = async (id: string) => {
  //   try {
  //     const response = await apiService.delete(
  //       `/BCBaoCaoDoiTuong/Delete/${id}`,
  //     );
  //     if (response.status) {
  //       message.success("Xóa đối tượng báo cáo thành công");
  //       setIsOpenDeleteModal(false);
  //       setDeleteId(null);
  //       setSelectedPlatformIds([]);
  //       setSelectedPlatforms([]);
  //       onFetch();
  //     } else {
  //       message.error(response.message || "Xóa đối tượng thất bại");
  //     }
  //   } catch (error) {
  //     console.error("Lỗi khi xóa đối tượng:", error);
  //     message.error("Xóa đối tượng thất bại");
  //   }
  // };

  const handleAddSubmit = async () => {
    if (selectedPlatforms.length === 0) {
      message.warning("Vui lòng chọn ít nhất một đối tượng");
      return;
    }
    setAddingTargets(true);
    try {
      // Map to BCDotBaoCaoDoiTuongRequest
      const requests = selectedPlatforms.map((p) => ({
        idDoiTuong: p.id,
        idDotBaoCao: idDotBaoCao,
        typeDoiTuong: p.typeDoiTuong || "DOANH_NGHIEP", // Default or map if exist
        typeOrganization: p.typeOrganization || "N/A", // Required field
        idOrganization: p.idOrganization || null,
        status: isGuiMail ? "CHOGUIMAIL" : "DRAFT",
        isSend: false,
        companyName: p.companyName || p.name,
        companyTaxcode: p.companyTaxCode,
      }));

      await apiService.post<any>(`/BCDotBaoCao/SendRequireReport`, requests);
      message.success("Thêm đối tượng báo cáo thành công");
      setIsAddModalOpen(false);
      onFetch(); // Tải lại danh sách đã thêm
    } catch (error) {
      console.error("Lỗi khi thêm đối tượng:", error);
      message.error("Thêm đối tượng thất bại");
    } finally {
      setAddingTargets(false);
    }
  };

  const handleSelectAll = async () => {
    setSelectingAll(true);
    try {
      const searchParams = {
        pageIndex: 1,
        pageSize: platformPage.totalCount, // Fetch everything matching filters
        IdDotBaoCao: idDotBaoCao,
        ...(modalTypeFilter ? { PlatformManageTypeId: modalTypeFilter } : {}),
        ...(modalStatusFilter && modalStatusFilter.length > 0
          ? { listStatus: modalStatusFilter }
          : {}),
        ...(modalSearchKeyword
          ? {
              [modalSearchType === "name"
                ? "Name"
                : modalSearchType === "taxCode"
                  ? "CompanyTaxCode"
                  : "Domain"]: modalSearchKeyword,
            }
          : {}),
      };

      const response = await apiService.post<any>(
        "/BCBaoCaoDoiTuong/GetNenTang",
        searchParams,
      );
      if (response?.data?.items) {
        const allRows = response.data.items;
        const allIds = allRows.map((r: any) => r.id);
        setSelectedPlatformIds(allIds);
        setSelectedPlatforms(allRows);
        message.success(`Đã chọn tất cả ${allIds.length} đối tượng`);
      }
    } catch (error) {
      console.error("Lỗi khi chọn tất cả:", error);
      message.error("Lỗi khi chọn tất cả đối tượng");
    } finally {
      setSelectingAll(false);
    }
  };

  const handleModalSearch = () => {
    fetchPlatforms(1, platformPage.pageSize, {
      PlatformManageTypeId: modalTypeFilter,
      listStatus: modalStatusFilter,
      keyword: modalSearchKeyword,
      searchType: modalSearchType,
    });
  };

  const handleSendMail = async (data: any) => {
    try {
      if (!data.emailNguoiDaiDien) {
        message.error("Email người đại diện không tồn tại");
        return;
      }
      const response = await apiService.post("/EmailTemplates/SendByCode", {
        code: "BC_NHACNOPBAOCAO",
        toEmail: data.emailNguoiDaiDien ?? "890191MV@gmai.com",
        data: {
          CompanyName: data.companyName,
          PlatformName: data.nameNenTang,
          PlatformType: data.platformManageTypeName,
          CompanyTaxCode: data.companyTaxcode,
          Deadline: dayjs(data.hanNopBaoCao).format("DD/MM/YYYY HH:mm:ss"),
        },
      });

      if (response.status) {
        message.success("Gửi mail thành công!");
        await apiService.put(
          `/BCBaoCaoDoiTuong/UpdateStatus/${data.id}?status=DRAFT`,
        );
        onFetch();
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi mail:", error);
      message.error(error.message || "Gửi mail thất bại");
    }
  };

  const handleSendMailAll = async () => {
    if (pendingMailCount === 0) {
      message.info("Không có đối tượng nào đang chờ gửi mail");
      return;
    }

    Modal.confirm({
      title: "Xác nhận gửi mail hàng loạt",
      content: `Bạn có chắc chắn muốn gửi mail cho tất cả ${pendingMailCount} đối tượng đang chờ gửi mail không?`,
      okText: "Gửi ngay",
      cancelText: "Hủy",
      onOk: async () => {
        setSendingMailAll(true);
        try {
          const resp = await apiService.post<any>("/BCBaoCaoDoiTuong/GetData", {
            IdDotBaoCao: idDotBaoCao,
            Status: "CHOGUIMAIL",
            pageSize: pendingMailCount,
            pageIndex: 1,
          });

          if (resp?.data?.items) {
            const items = resp.data.items;
            let successCount = 0;
            let failCount = 0;

            for (const item of items) {
              try {
                if (item.emailNguoiDaiDien) {
                  await apiService.post("/EmailTemplates/SendByCode", {
                    code: "BC_NHACNOPBAOCAO",
                    toEmail: item.emailNguoiDaiDien,
                    data: {
                      CompanyName: item.companyName,
                      PlatformName: item.nameNenTang,
                      PlatformType: item.platformManageTypeName,
                      CompanyTaxCode: item.companyTaxcode,
                      Deadline: dayjs(item.hanNopBaoCao).format(
                        "DD/MM/YYYY HH:mm:ss",
                      ),
                    },
                  });
                  await apiService.put(
                    `/BCBaoCaoDoiTuong/UpdateStatus/${item.id}?status=DRAFT`,
                  );
                  successCount++;
                } else {
                  failCount++;
                }
              } catch (e) {
                console.error("Gửi mail lỗi cho item:", item.id, e);
                failCount++;
              }
            }
            message.success(
              `Đã gửi mail thành công cho ${successCount} đối tượng. ${failCount > 0 ? `Thất bại ${failCount} đối tượng.` : ""}`,
            );
            onFetch();
            console.log("resp", resp);
          }
        } catch (error) {
          console.error("Lỗi khi gửi mail hàng loạt:", error);
          message.error("Lỗi khi thực hiện gửi mail hàng loạt");
        } finally {
          setSendingMailAll(false);
        }
      },
    });
  };

  const handleApprove = async (record: any) => {
    try {
      const response = await apiService.put(
        `/BCBaoCaoDoiTuong/UpdateStatus/${record.id}?status=APPROVED`,
      );
      if (response.status) {
        message.success("Duyệt báo cáo thành công");
        onFetch();
      } else {
        message.error(response.message || "Duyệt báo cáo thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi duyệt báo cáo:", error);
      message.error("Lỗi hệ thống khi duyệt báo cáo");
    }
  };

  const handleApproveAll = async () => {
    if (submittedCount === 0) {
      message.info("Không có báo cáo nào đang chờ duyệt");
      return;
    }

    Modal.confirm({
      title: "Xác nhận duyệt tất cả",
      content: `Bạn có chắc chắn muốn duyệt tất cả ${submittedCount} báo cáo đang chờ duyệt không?`,
      okText: "Duyệt ngay",
      cancelText: "Hủy",
      onOk: async () => {
        setApprovingAll(true);
        try {
          // Lấy tất cả báo cáo đang chờ duyệt (SUBMITTED)
          const resp = await apiService.post<any>("/BCBaoCaoDoiTuong/GetData", {
            IdDotBaoCao: idDotBaoCao,
            Status: "SUBMITTED",
            pageSize: 1000,
            pageIndex: 1,
          });

          if (resp?.data?.items) {
            const items = resp.data.items;
            let successCount = 0;
            let failCount = 0;

            for (const item of items) {
              try {
                const response = await apiService.put(
                  `/BCBaoCaoDoiTuong/UpdateStatus/${item.id}?status=APPROVED`,
                );
                if (response.status) {
                  successCount++;
                } else {
                  failCount++;
                }
              } catch (e) {
                console.error("Duyệt lỗi cho item:", item.id, e);
                failCount++;
              }
            }
            message.success(
              `Đã duyệt thành công cho ${successCount} báo cáo. ${failCount > 0 ? `Thất bại ${failCount} báo cáo.` : ""}`,
            );
            onFetch();
          }
        } catch (error) {
          console.error("Lỗi khi duyệt hàng loạt:", error);
          message.error("Lỗi khi thực hiện duyệt hàng loạt");
        } finally {
          setApprovingAll(false);
        }
      },
    });
  };

  const handleSendNotification = async (record: any) => {
    try {
      const response = await notificationService.create({
        tieuDe: "Nhắc nhở nộp báo cáo định kỳ",
        message: `Thông báo nhắc nhở nộp báo cáo cho nền tảng ${record.nameNenTang}. Hạn nộp: ${dayjs(record.hanNopBaoCao).format("DD/MM/YYYY HH:mm")}`,
        noiDung: `Kính gửi đơn vị ${record.companyName},<br/>
             Đây là thông báo nhắc nhở nộp báo cáo ${record.nameNenTang} cho đợt báo cáo hiện tại.
             Vui lòng hoàn thành báo cáo trước ngày ${dayjs(record.hanNopBaoCao).format("DD/MM/YYYY")}.`,
        donViId: record.idOrganization,
        link: `/duyetBaoCao/${idDotBaoCao}/xemBaoCao/${record.id}`,
        type: "REPORT_REMINDER",
        itemName: "Báo cáo định kỳ",
        loaiThongBao: "System",
        isRead: false,
        isDisplay: true,
        sendToFrontEndUser: true,
      });

      if (response.status) {
        message.success(`Đã gửi thông báo cho công ty ${record.companyName}!`);
        onFetch();
      } else {
        message.error(response.message || "Gửi thông báo thất bại");
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi thông báo:", error);
      message.error(error.message || "Gửi thông báo thất bại");
    }
  };

  const handleSendNotificationAll = async () => {
    if (pendingNotificationCount === 0) {
      message.info("Không có đối tượng nào đang chờ gửi thông báo");
      return;
    }

    Modal.confirm({
      title: "Xác nhận gửi thông báo hàng loạt",
      content: `Bạn có chắc chắn muốn gửi thông báo cho tất cả ${pendingNotificationCount} đối tượng đang chờ không?`,
      okText: "Gửi ngay",
      cancelText: "Hủy",
      onOk: async () => {
        setSendingNotificationAll(true);
        try {
          const resp = await apiService.post<any>("/BCBaoCaoDoiTuong/GetData", {
            IdDotBaoCao: idDotBaoCao,
            listStatus: ["CHOGUIMAIL", "DRAFT"],
            pageSize: 1000,
            pageIndex: 1,
          });

          if (resp?.data?.items) {
            const items = resp.data.items;

            // Group items by Organization (donViId)
            const groups: { [key: string]: any[] } = {};
            items.forEach((item: any) => {
              const key =
                item.idOrganization || item.companyTaxcode || item.companyName;
              if (!groups[key]) groups[key] = [];
              groups[key].push(item);
            });

            const uniqueOrgs = Object.keys(groups);
            let successCount = 0;
            let failCount = 0;

            for (const key of uniqueOrgs) {
              const groupItems = groups[key];
              const firstItem = groupItems[0];

              try {
                const response = await notificationService.create({
                  tieuDe: "Nhắc nhở nộp báo cáo định kỳ",
                  message: `Bạn có ${groupItems.length} nền tảng cần nộp báo cáo định kỳ.`,
                  noiDung: `Kính gửi đơn vị ${firstItem.companyName},<br/>Bạn đang có ${groupItems.length} nền tảng đang chờ nộp báo cáo định kỳ. Vui lòng kiểm tra và hoàn thành báo cáo sớm.`,
                  donViId: firstItem.idOrganization,
                  link: `/duyetBaoCao/${idDotBaoCao}`,
                  type: "REPORT_REMINDER",
                  itemName: "Báo cáo định kỳ",
                  loaiThongBao: "System",
                  isRead: false,
                });

                if (response.status) {
                  successCount++;
                } else {
                  failCount++;
                }
              } catch (e) {
                console.error(
                  "Gửi thông báo lỗi cho đơn vị:",
                  firstItem.companyName,
                  e,
                );
                failCount++;
              }
            }

            message.success(
              `Đã gửi thông báo thành công cho ${successCount} đơn vị. ${failCount > 0 ? `Thất bại ${failCount} đơn vị.` : ""}`,
            );
            onFetch();
          }
        } catch (error) {
          console.error("Lỗi khi gửi thông báo hàng loạt:", error);
          message.error("Lỗi khi thực hiện gửi thông báo hàng loạt");
        } finally {
          setSendingNotificationAll(false);
        }
      },
    });
  };

  const tableColumns: TableColumnsType<any> = [
    {
      title: "STT",
      width: 70,
      align: "center",
      render: (_: any, __: any, index: number) =>
        pageData.pageSize * (pageData.pageIndex - 1) + index + 1,
    },
    {
      title: "Thông tin công ty chủ quản / Người đại diện",
      width: 350,
      render: (_: any, record: any) => (
        <>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>
            {record.companyName}
          </Text>
          <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
            ({record.tenNguoiDaiDien || "Chưa cập nhật"}
            {" - Email: "}
            {record.emailNguoiDaiDien || "Chưa cập nhật"}
            {" - SĐT: "}
            {record.sdtNguoiDaiDien || "Chưa cập nhật"})
          </Text>
        </>
      ),
    },
    {
      title: "Tên nền tảng",
      dataIndex: "nameNenTang",
      width: 200,
      align: "center",
    },
    {
      title: "Loại nền tảng",
      dataIndex: "platformManageTypeName",
      width: 300,
      render: (val: string, record: any) => (
        <Text style={{ fontSize: 12 }}>{val}</Text>
      ),
    },
    {
      title: "Mã số thuế / Mã ĐD",
      dataIndex: "companyTaxcode",
      width: 100,
      align: "center",
      render: (val: string, record: any) =>
        val || record?.taxcode || record?.maSoThue || "-",
    },
    {
      title: "Trạng thái nộp",
      dataIndex: "status",
      width: 150,
      align: "center",
      render: (val: string, record: any) => {
        if (val === "SUBMITTED") return <Tag color="green">Đã nộp</Tag>;
        if (val === "APPROVED") return <Tag color="blue">Đã duyệt</Tag>;
        if (val === "DRAFT") return <Tag color="default">Chưa nộp</Tag>;
        if (val === "CHOGUIMAIL") {
          return (
            <Tag
              icon={<ClockCircleOutlined />}
              color="orange"
            >
              Chờ gửi mail
            </Tag>
          );
        }
        return <Tag color="default">{val}</Tag>;
      },
    },
    {
      title: "Thao tác",
      width: 100,
      align: "center",
      render: (_: any, record: any) => {
        const items: MenuProps["items"] = [
          {
            key: "Detail",
            label: "Xem",
            icon: <EyeOutlined />,
            onClick: () =>
              router.push(
                `/duyetBaoCao/${idDotBaoCao}/xemBaoCao/${record.id}/${bcFormTemplatesId}`,
              ),
          },
          // {
          //   key: "Delete",
          //   label: "Xóa",
          //   icon: <DeleteOutlined />,
          //   onClick: () => {
          //     setIsOpenDeleteModal(true);
          //     setDeleteId(record.id);
          //   },
          // },
        ];
        return (
          <Space>
            {record.status === "CHOGUIMAIL" && (
              <>
                <Tooltip title="Gửi mail">
                  <Button
                    
                    icon={<MailOutlined style={{ color: "#1890ff" }} />}
                    onClick={() => handleSendMail(record)}
                  />
                </Tooltip>
                <Tooltip title="Gửi thông báo">
                  <Button
                    
                    icon={<BellOutlined style={{ color: "#52c41a" }} />}
                    onClick={() => handleSendNotification(record)}
                  />
                </Tooltip>
              </>
            )}
            {record.status === "SUBMITTED" && (
              <Tooltip title="Duyệt báo cáo">
                <Button
                  icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                  onClick={() => handleApprove(record)}
                />
              </Tooltip>
            )}
            <Dropdown menu={{ items }} placement="bottomRight">
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const platformColumns: TableColumnsType<any> = [
    {
      title: "Tên nền tảng/doanh nghiệp",
      dataIndex: "name",
      render: (text: string, record: any) => (
        <strong>{text || record?.companyName || "-"}</strong>
      ),
    },
    {
      title: "Loại nền tảng",
      dataIndex: "platformManageTypeName",
      render: (val: string, record: any) => val || record?.typeDoiTuong || "-",
    },
    {
      title: "Mã số thuế",
      dataIndex: "companyTaxCode",
      width: 150,
      render: (val: string) => val || "-",
    },
    {
      title: "Tên miền",
      dataIndex: "domain",
      width: 250,
      render: (val: string) => val || "-",
    },
  ];

  return (
    <Card bordered={false}>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        style={{ marginBottom: 16 }}
      >
        {/* {isOpenDeleteModal && (
          <Modal
            title="Xóa đối tượng báo cáo"
            open={isOpenDeleteModal}
            onCancel={() => setIsOpenDeleteModal(false)}
            onOk={() => handleDelete(deleteId || "")}
            confirmLoading={deleting}
            okText="Xóa"
            cancelText="Hủy"
          >
            <p>Bạn có chắc chắn muốn xóa đối tượng báo cáo này?</p>
          </Modal>
        )} */}
        <h3 style={{ margin: 0 }}>Danh sách đối tượng báo cáo</h3>
        <Space>
          <Input.Search
            placeholder="Tìm theo mã số thuế..."
            allowClear
            onSearch={(value) => {
              onFetch({ pageIndex: 1, CompanyTaxcode: value || undefined });
            }}
            style={{ width: 220 }}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: 160 }}
            onChange={(val) => {
              onFetch({ pageIndex: 1, Status: val || undefined });
            }}
            options={[
              { label: "Đã nộp", value: "SUBMITTED" },
              { label: "Đã duyệt", value: "APPROVED" },
              { label: "Chưa nộp", value: "DRAFT" },
              { label: "Chờ gửi mail", value: "CHOGUIMAIL" },
            ]}
          />
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleApproveAll}
            loading={approvingAll}
            disabled={submittedCount === 0}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Duyệt tất cả ({submittedCount})
          </Button>
          {/* <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={openAddModal}
          >
            Thêm đối tượng
          </Button> */}
          {isGuiMail && (
            <Button
              type="primary"
              danger
              icon={<MailOutlined />}
              onClick={handleSendMailAll}
              loading={sendingMailAll}
              disabled={pendingMailCount === 0}
            >
              Gửi mail cho tất cả ({pendingMailCount})
            </Button>
          )}
          <Button
            type="primary"
            icon={<BellOutlined />}
            onClick={handleSendNotificationAll}
            loading={sendingNotificationAll}
            disabled={pendingNotificationCount === 0}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Gửi thông báo cho tất cả ({pendingNotificationCount})
          </Button>
        </Space>
      </Flex>

      <div className="table-responsive">
        <Table
          columns={tableColumns}
          bordered
          dataSource={data}
          rowKey={(record) => record.id || Math.random().toString()}
          scroll={{ x: 800 }}
          pagination={false}
          loading={loading}
          locale={{ emptyText: "Chưa có đối tượng báo cáo nào được thêm" }}
        />
      </div>

      <Flex justifyContent="flex-end" style={{ marginTop: 16 }}>
        <Pagination
          total={pageData?.totalCount || 0}
          current={pageData?.pageIndex || 1}
          pageSize={pageData?.pageSize || 20}
          showSizeChanger
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trong ${total} đối tượng`
          }
          onChange={(page, size) => {
            onFetch({ pageIndex: page, pageSize: size });
          }}
        />
      </Flex>

      <Modal
        title="Thêm đối tượng báo cáo (Nền tảng)"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          setSelectedPlatformIds([]);
          setSelectedPlatforms([]);
          setPlatformPage({ totalCount: 0, pageIndex: 1, pageSize: 5 });
        }}
        width={1500}
        destroyOnClose
        footer={
          <Flex justifyContent="flex-end" alignItems="center">
            <Space>
              <Button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedPlatformIds([]);
                  setSelectedPlatforms([]);
                  setPlatformPage({ totalCount: 0, pageIndex: 1, pageSize: 5 });
                }}
              >
                Đóng
              </Button>
              <Button
                type="primary"
                loading={addingTargets}
                onClick={handleAddSubmit}
              >
                Thêm đối tượng đã chọn
              </Button>
              <Button
                type="primary"
                ghost
                onClick={handleSelectAll}
                loading={selectingAll}
                disabled={platformPage.totalCount === 0}
                style={{ color: "red" }}
              >
                Chọn tất cả ({platformPage.totalCount})
              </Button>
            </Space>
          </Flex>
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 12,
            padding: "12px",
            background: "#f0f2f5",
            borderRadius: "8px",
          }}
        >
          <Space wrap size={12}>
            <Select
              placeholder="Loại nền tảng"
              allowClear
              style={{ width: 220 }}
              value={modalTypeFilter}
              onChange={(val) => setModalTypeFilter(val)}
              options={[
                { label: "Thông báo kinh doanh", value: "1" },
                { label: "Đăng ký KD nước ngoài", value: "2" },
                { label: "Tích hợp", value: "3" },
                { label: "Tích hợp nước ngoài", value: "4" },
              ]}
            />
            <Select
              placeholder="Trạng thái nền tảng"
              mode="multiple"
              allowClear
              style={{ width: 250 }}
              value={modalStatusFilter}
              onChange={(val) => setModalStatusFilter(val)}
              options={ConstractStatusConstant.getDropdownListKey()}
            />
          </Space>

          <Space size={16}>
            <Radio.Group
              value={modalSearchType}
              onChange={(e) => {
                setModalSearchType(e.target.value);
                setModalSearchKeyword("");
              }}
            >
              <Radio value="name">Tên nền tảng</Radio>
              <Radio value="taxCode">Mã số thuế</Radio>
              <Radio value="domain">Tên miền</Radio>
            </Radio.Group>
          </Space>

          <Space>
            <Input
              value={modalSearchKeyword}
              onChange={(e) => setModalSearchKeyword(e.target.value)}
              placeholder={
                modalSearchType === "name"
                  ? "Nhập tên nền tảng..."
                  : modalSearchType === "taxCode"
                    ? "Nhập mã số thuế..."
                    : "Nhập tên miền..."
              }
              allowClear
              onPressEnter={handleModalSearch}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleModalSearch}
            >
              Tìm kiếm
            </Button>
          </Space>
        </div>
        <Table
          rowSelection={{
            selectedRowKeys: selectedPlatformIds,
            onChange: (newSelectedRowKeys, newSelectedRows) => {
              setSelectedPlatformIds(newSelectedRowKeys);
              setSelectedPlatforms(newSelectedRows);
            },
          }}
          columns={platformColumns}
          dataSource={platforms}
          rowKey="id"
          pagination={false}
          loading={platformLoading}
          scroll={{ y: 400 }}
          bordered
          size="small"
        />
        <Flex justifyContent="flex-end" style={{ marginTop: 16 }}>
          <Pagination
            size="small"
            total={platformPage.totalCount || 0}
            current={platformPage.pageIndex || 1}
            pageSize={platformPage.pageSize || 10}
            showSizeChanger
            onChange={(page, size) => {
              fetchPlatforms(page, size, {
                PlatformManageTypeId: modalTypeFilter,
                listStatus: modalStatusFilter,
              });
            }}
          />
        </Flex>
      </Modal>
    </Card>
  );
};

export default TargetsTab;
