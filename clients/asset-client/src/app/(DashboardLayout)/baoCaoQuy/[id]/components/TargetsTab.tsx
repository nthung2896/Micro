"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  message,
  Select,
  Space,
  Button,
  Input,
  Spin,
  DatePicker,
  Row,
  Col,
  Modal,
  Tooltip,
  Pagination,
  Radio,
  TableColumnsType,
} from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  CalendarOutlined,
  PushpinOutlined,
  MailOutlined,
  BellOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import bcSubmissionService from "@/services/bcSubmission/bcSubmission.service";
import notificationService from "@/services/notification/notification.service";
import { apiService } from "@/services/index";
import dayjs, { Dayjs } from "dayjs";
import { useParams, useRouter } from "next/navigation";
import ConstractStatusConstant from "@/constants/ConstractStatusConstant";
import { useSelector } from "react-redux";

const { Text } = Typography;

interface TargetsTabProps {
  data: any[];
  pageData: { pageIndex: number; pageSize: number; totalCount: number };
  onFetch: (params?: any) => void;
  loading?: boolean;
  bcFormTemplatesId?: string;
  isGuiMail?: boolean;
}

export default function TargetsTab({
  bcFormTemplatesId,
  isGuiMail,
}: TargetsTabProps) {
  const router = useRouter();
  const params = useParams();
  const idDotBaoCao = params.id as string;
  const user = useSelector((state: any) => state.auth.user);

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
  const [selectingAll, setSelectingAll] = useState(false);

  const [data, setData] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 20,
    totalCount: 0,
  });

  const [sendingMailAll, setSendingMailAll] = useState(false);
  const [sendingNotificationAll, setSendingNotificationAll] = useState(false);

  // Filters
  const [filterQuarter, setFilterQuarter] = useState<number | undefined>(
    Math.ceil((dayjs().month() + 1) / 3),
  );
  const [filterYear, setFilterYear] = useState<Dayjs | null>(dayjs());
  const [filterPlatformType, setFilterPlatformType] = useState<
    string | undefined
  >(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    undefined,
  );
  const [keyword, setKeyword] = useState("");
  const [taxCode, setTaxCode] = useState("");

  // Dot bao cao list for dropdown
  const [dotList, setDotList] = useState<{ label: string; value: string }[]>(
    [],
  );
  // Dot bao cao full list for lookup (kySo, namBaoCao)
  const [dots, setDots] = useState<any[]>([]);

  useEffect(() => {
    // Load danh sách đợt báo cáo để lọc
    bcSubmissionService
      .getDotBaoCaoData({ pageIndex: 1, pageSize: 500, loaiKyBaoCao: "QUY" })
      .then((res) => {
        if (res?.data?.items) {
          const dotItems = res.data.items;
          setDots(dotItems);
          setDotList(
            dotItems.map((x: any) => ({ label: x.name, value: x.id })),
          );
          // Initial fetch after dots are loaded
          fetchData(
            1,
            20,
            filterQuarter,
            filterYear,
            filterPlatformType,
            filterStatus,
            dotItems,
          );
        }
      });
  }, []);

  const fetchData = async (
    page = 1,
    size = 20,
    quarter?: number,
    year?: Dayjs | null,
    typeId?: string,
    status?: string,
    dotsOverride?: any[],
  ) => {
    // Validation: (Year AND Quarter) OR (Year AND Platform Name/MST)
    const currentYear = year?.year() ?? filterYear?.year();
    const currentQuarter = quarter ?? filterQuarter;
    const currentName = keyword;
    const currentTaxCode = taxCode;

    if (!currentYear) {
      message.warning("Vui lòng chọn Năm báo cáo");
      return;
    }
    if (!currentQuarter && !currentName && !currentTaxCode) {
      message.warning(
        "Vui lòng chọn Quý báo cáo hoặc nhập Tên nền tảng / Mã số thuế",
      );
      return;
    }

    setFetching(true);
    try {
      const body: any = {
        pageIndex: page,
        pageSize: size,
        namBaoCao: currentYear,
        thangBaoCao: currentQuarter,
        nameNenTang: currentName,
        companyTaxcode: currentTaxCode,
        Status: status ?? filterStatus,
        IdDotBaoCao: idDotBaoCao, // Add context of current period
      };
      if (typeId) body.PlatformManageTypeId = typeId;

      // Nếu có (Năm + Quý/Tên/MST) -> Hiển thị tất cả (kể cả chưa nộp)
      const isFullSearch =
        currentYear && (currentQuarter || currentName || currentTaxCode);
      if (!isFullSearch) {
        body.ListStatus = ["SUBMITTED", "APPROVED"];
      }

      body.LoaiKyBaoCao = "QUY";

      const res = await bcSubmissionService.getBaoCaoDoiTuongData(body);
      if (res?.data) {
        let items = res.data.items || [];

        const lookupDots = dotsOverride || dots;

        // Resolve month/year. Prioritize search current filters to ensure display matches intent.
        items = items.map((item: any) => {
          const dot = lookupDots.find((d: any) => d.id === item.idDotBaoCao);
          const history = item.lichSuNop || [];
          const latestSub =
            history.length > 0 ? history[history.length - 1] : null;

          return {
            ...item,
            thangBaoCao:
              currentQuarter ||
              item.thangBaoCao ||
              dot?.kySo ||
              latestSub?.thangBaoCao,
            namBaoCao:
              currentYear ||
              item.namBaoCao ||
              dot?.namBaoCao ||
              latestSub?.namBaoCao,
          };
        });

        // Nếu tìm theo Tên nền tảng/MST (không chọn quý) -> Mở rộng đủ 4 quý
        if (
          currentYear &&
          (currentName || currentTaxCode) &&
          !currentQuarter &&
          items.length > 0
        ) {
          const expandedItems: any[] = [];

          // Nhóm theo Nền tảng (dựa trên IdDoiTuong hoặc MST + Tên)
          const platforms = Array.from(
            new Set(
              items.map(
                (x: any) =>
                  x.idDoiTuong || `${x.companyTaxcode}_${x.nameNenTang}`,
              ),
            ),
          );

          platforms.forEach((pKey: any) => {
            const platformSamples = items.filter(
              (x: any) =>
                x.idDoiTuong === pKey ||
                `${x.companyTaxcode}_${x.nameNenTang}` === pKey,
            );
            const sample = platformSamples[0];

            for (let m = 1; m <= 4; m++) {
              const existing = platformSamples.find(
                (x: any) => x.thangBaoCao === m,
              );
              if (existing) {
                expandedItems.push(existing);
              } else {
                expandedItems.push({
                  ...sample,
                  thangBaoCao: m,
                  namBaoCao: currentYear,
                  status: "CHUA_NOP", // Trạng thái ảo
                  isVirtual: true,
                  idDotBaoCao: null,
                });
              }
            }
          });
          items = expandedItems;
        }

        setData(items);
        setPagination({
          pageIndex: res.data.pageIndex,
          pageSize: res.data.pageSize,
          totalCount: res.data.totalCount,
        });
      }
    } catch {
      message.error("Lỗi tải dữ liệu");
    } finally {
      setFetching(false);
    }
  };

  const handleSendMail = async (record: any) => {
    try {
      const history = record.lichSuNop || [];
      const sameCompanyPending = data.filter(
        (x) =>
          (x.companyTaxcode === record.companyTaxcode ||
            (x.companyName === record.companyName && !record.companyTaxcode)) &&
          !history.find(
            (h: any) =>
              h.thangBaoCao === record.thangBaoCao &&
              h.namBaoCao === record.namBaoCao,
          ),
      );

      const platformRows = sameCompanyPending
        .map(
          (item, index) => `
        <tr>
          <td style="border:1px solid #d9d9d9;text-align:center;">${index + 1}</td>
          <td style="border:1px solid #d9d9d9;">${item.nameNenTang}</td>
          <td style="border:1px solid #d9d9d9;">${item.platformManageTypeName || "Nền tảng TMĐT"}</td>
        </tr>
      `,
        )
        .join("");

      const response = await apiService.post("/EmailTemplates/SendByCode", {
        code: "BC_NHACNOPBAOCAO",
        toEmail: record.emailNguoiDaiDien || "890191mv@gmai.com",
        data: {
          CompanyName: record.companyName,
          CompanyTaxCode: record.companyTaxcode,
          Deadline: dayjs()
            .month(Math.ceil((dayjs().month() + 1) / 3) * 3 - 1)
            .endOf("month")
            .format("DD/MM/YYYY"),
          PlatformRows: platformRows,
        },
      });

      if (response.status) {
        message.success(
          `Gửi mail thành công cho công ty ${record.companyName}!`,
        );
        // On success, we might want to refresh to show "Pending Mail" if status changed in DB
        // But since we are using virtual status, we rely on the next fetch.
        fetchData(
          pagination.pageIndex,
          pagination.pageSize,
          filterQuarter,
          filterYear,
          filterPlatformType,
          filterStatus,
        );
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi mail:", error);
      message.error(error.message || "Gửi mail thất bại");
    }
  };

  const handleSendMailAll = async () => {
    const pendingItems = data.filter(
      (r) => renderMonthlyStatus(r).props.color === "error",
    );
    if (pendingItems.length === 0) {
      message.info("Không có nền tảng nào chưa nộp để gửi mail");
      return;
    }

    Modal.confirm({
      title: "Xác nhận gửi mail hàng loạt",
      content: `Bạn có chắc chắn muốn gửi mail cho tất cả các doanh nghiệp chưa nộp báo cáo quý ${filterQuarter}/${filterYear?.year()} không?`,
      okText: "Gửi ngay",
      cancelText: "Hủy",
      onOk: async () => {
        setSendingMailAll(true);
        try {
          const groups: { [key: string]: any[] } = {};
          pendingItems.forEach((item: any) => {
            const key = item.companyTaxcode || item.companyName;
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
          });

          const uniqueCompanies = Object.keys(groups);
          let successCount = 0;
          for (const key of uniqueCompanies) {
            const groupItems = groups[key];
            const firstItem = groupItems[0];
            const email = firstItem.emailNguoiDaiDien ?? "890191MV@gmai.com";

            const platformRows = groupItems
              .map(
                (item, index) => `
                <tr>
                  <td style="border:1px solid #d9d9d9;text-align:center;">${index + 1}</td>
                  <td style="border:1px solid #d9d9d9;">${item.nameNenTang}</td>
                  <td style="border:1px solid #d9d9d9;">${item.platformManageTypeName || "Nền tảng TMĐT"}</td>
                </tr>
              `,
              )
              .join("");

            const mailResp = await apiService.post(
              "/EmailTemplates/SendByCode",
              {
                code: "BC_NHACNOPBAOCAO",
                toEmail: email,
                data: {
                  CompanyName: firstItem.companyName,
                  CompanyTaxCode: firstItem.companyTaxcode,
                  Deadline: dayjs()
                    .month(Math.ceil((dayjs().month() + 1) / 3) * 3 - 1)
                    .endOf("month")
                    .format("DD/MM/YYYY"),
                  PlatformRows: platformRows,
                },
              },
            );
            if (mailResp.status) successCount++;
          }
          message.success(
            `Đã gửi mail thành công cho ${successCount} doanh nghiệp.`,
          );
        } finally {
          setSendingMailAll(false);
        }
      },
    });
  };


  const handleSendNotification = async (record: any) => {
    try {
      const response = await notificationService.create({
        tieuDe: "Nhắc nhở nộp báo cáo định kỳ (Quý)",
        message: `Thông báo nhắc nhở nộp báo cáo định kỳ quý ${filterQuarter}/${filterYear?.year()} cho nền tảng ${record.nameNenTang}.`,
        noiDung: `Kính gửi đơn vị ${record.companyName},<br/>Đây là thông báo nhắc nhở nộp báo cáo cho đợt báo cáo hiện tại.`,
        link: `/doanhNghiepBaoCaoQuy`,
        type: "Báo cáo định kỳ (Quý)",
        itemName: "Báo cáo định kỳ (Quý)",
        loaiThongBao: "System",
        toUser: record.idNguoiTaoNenTang,
        fromUser: user?.id,
        isRead: false,
        isDisplay: true,
        sendToFrontEndUser: true,
      });

      if (response.status) {
        message.success(`Đã gửi thông báo cho công ty ${record.companyName}!`);
      }
    } catch (error: any) {
      message.error(error.message || "Gửi thông báo thất bại");
    }
  };

  const handleSendNotificationAll = async () => {
    const pendingItems = data.filter(
      (r) => renderMonthlyStatus(r).props.color === "error",
    );
    if (pendingItems.length === 0) {
      message.info("Không có nền tảng nào chưa nộp để gửi thông báo");
      return;
    }

    const quy = filterQuarter;
    const nam = filterYear?.year();

    Modal.confirm({
      title: "Xác nhận gửi thông báo hàng loạt",
      content: `Bạn có chắc chắn muốn gửi thông báo nhắc nhở cho tất cả ${pendingItems.length} nền tảng chưa nộp báo cáo Quý ${quy}/${nam} không?`,
      okText: "Gửi ngay",
      cancelText: "Hủy",
      onOk: async () => {
        setSendingNotificationAll(true);
        try {
          // Nhóm theo idNguoiTaoNenTang (người chịu trách nhiệm nộp báo cáo)
          const groups = pendingItems.reduce<Record<string, any[]>>(
            (acc, item) => {
              const key = item.idNguoiTaoNenTang;
              if (!key) return acc; // Bỏ qua bản ghi không có người phụ trách
              if (!acc[key]) acc[key] = [];
              acc[key].push(item);
              return acc;
            },
            {},
          );

          const skipped = pendingItems.filter(
            (x) => !x.idNguoiTaoNenTang,
          ).length;

          // Gửi song song toàn bộ thông báo
          const results = await Promise.allSettled(
            Object.entries(groups).map(([userId, items]) => {
              const firstItem = items[0];
              const platformList = items
                .map((x, i) => `${i + 1}. ${x.nameNenTang}`)
                .join("<br/>");
              return notificationService.create({
                tieuDe: `Nhắc nhở nộp báo cáo định kỳ (Quý ${quy}/${nam})`,
                message: `Bạn có ${items.length} nền tảng chưa nộp báo cáo nền tảng lớn Quý ${quy}/${nam}.`,
                noiDung: `Kính gửi đơn vị ${firstItem.companyName},<br/>Các nền tảng sau chưa nộp báo cáo Quý ${quy}/${nam}:<br/>${platformList}<br/>Vui lòng hoàn thành trước hạn quy định.`,
                link: `/doanhNghiepBaoCaoQuy`,
                type: "Báo cáo định kỳ (Quý)",
                itemName: "Báo cáo định kỳ (Quý)",
                loaiThongBao: "System",
                toUser: userId,
                fromUser: user?.id,
                isRead: false,
                isDisplay: true,
                sendToFrontEndUser: true,
              });
            }),
          );

          const successCount = results.filter(
            (r) => r.status === "fulfilled" && (r.value as any)?.status,
          ).length;
          const failCount = results.length - successCount;

          if (failCount === 0) {
            message.success(
              `Đã gửi thông báo thành công cho ${successCount} đơn vị${skipped > 0 ? ` (bỏ qua ${skipped} nền tảng không có người phụ trách)` : ""}.`,
            );
          } else {
            message.warning(
              `Gửi thành công: ${successCount}, thất bại: ${failCount}${skipped > 0 ? `, bỏ qua: ${skipped}` : ""}.`,
            );
          }
        } catch (error: any) {
          message.error(error?.message || "Đã xảy ra lỗi khi gửi thông báo");
        } finally {
          setSendingNotificationAll(false);
        }
      },
    });
  };

  const renderMonthlyStatus = (record: any) => {
    // 1. Kiểm tra trong lichSuNop (Dữ liệu từ MongoDB)
    const history = record.lichSuNop || [];
    const submission = history.find(
      (h: any) =>
        h.thangBaoCao === record.thangBaoCao &&
        h.namBaoCao === record.namBaoCao,
    );

    // Nếu có submission trong MongoDB -> Ưu tiên dùng status từ MongoDB
    if (submission) {
      if (submission.status === "APPROVED")
        return <Tag color="purple">Đã duyệt</Tag>;
      if (
        submission.status === "SUBMITTED" ||
        submission.status === "COMPLETED"
      )
        return <Tag color="success">Đã nộp</Tag>;
      if (submission.status === "REJECTED")
        return <Tag color="orange">Từ chối</Tag>;
      if (submission.status === "CHOGUIMAIL")
        return <Tag color="orange">Chờ gửi mail</Tag>;
      if (submission.status === "DRAFT" || submission.status === "TAM_LUU")
        return <Tag color="error">Chưa nộp</Tag>;

      return <Tag color="blue">{submission.status}</Tag>;
    }

    // Nếu không có submission cho quý này -> Luôn tính là Chưa nộp
    // (Bỏ qua record.status vì đó là trạng thái tổng quát/cũ của bản ghi SQL)
    return <Tag color="error">Chưa nộp</Tag>;
  };

  const columns = [
    {
      title: "STT",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, i: number) =>
        (pagination.pageIndex - 1) * pagination.pageSize + i + 1,
    },
    {
      title: "Tên nền tảng",
      dataIndex: "nameNenTang",
      key: "nameNenTang",
      width: 200,
      align: "center" as const,
    },
    {
      title: "Thông tin doanh nghiệp",
      key: "companyTaxcode",
      width: 200,
      align: "center" as const,
      render: (_: any, r: any) => (
        <div>
          <Text strong>{r.companyName}</Text>
          <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
            {r.companyTaxcode}
          </Text>
        </div>
      ),
    },

    {
      title: "Quý",
      width: 90,
      align: "center" as const,
      render: (_: any, r: any) =>
        r.thangBaoCao ? `Quý ${r.thangBaoCao}` : `Quý ${filterQuarter}`,
    },
    {
      title: "Năm",
      width: 80,
      align: "center" as const,
      render: (_: any, r: any) =>
        r.namBaoCao ? `Năm ${r.namBaoCao}` : `Năm ${filterYear?.year()}`,
    },
    {
      title: "Trạng thái",
      width: 100,
      align: "center" as const,
      render: (_: any, r: any) => renderMonthlyStatus(r),
    },
    {
      title: "Thao tác",
      width: 140,
      align: "center" as const,
      fixed: "right" as const,
      render: (_: any, r: any) => {
        const history = r.lichSuNop || [];
        const submission = history.find(
          (h: any) =>
            h.thangBaoCao === r.thangBaoCao && h.namBaoCao === r.namBaoCao,
        );

        const templateId = submission?.formTemplateId || bcFormTemplatesId;
        const status = renderMonthlyStatus(r).props.children;
        const isNotSubmitted = renderMonthlyStatus(r).props.color === "error";

        return (
          <Space>
            {status === "Đã nộp" ||
            status === "Đã duyệt" ||
            status === "Chờ gửi mail" ? (
              <Button
                type="primary"
                ghost
                
                icon={<EyeOutlined />}
                onClick={() => {
                  router.push(
                    `/bao-cao-ke-khai/${r.idDotBaoCao}/${templateId}?assignmentId=${r.id}&month=${r.thangBaoCao}&year=${r.namBaoCao}&isXemBaoCao=true`,
                  );
                }}
              >
                Xem
              </Button>
            ) : (
              <Space size={4}>
                {isGuiMail && (
                  <Tooltip title="Gửi mail nhắc nhở">
                    <Button
                      
                      icon={<MailOutlined style={{ color: "#1890ff" }} />}
                      onClick={() => handleSendMail(r)}
                    />
                  </Tooltip>
                )}
                <Tooltip title="Gửi thông báo hệ thống">
                  <Button
                    
                    icon={<BellOutlined style={{ color: "#52c41a" }} />}
                    onClick={() => handleSendNotification(r)}
                  />
                </Tooltip>
              </Space>
            )}
          </Space>
        );
      },
    },
  ];

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
        status: "DRAFT",
        isSend: false,
        companyName: p.companyName || p.name,
        companyTaxcode: p.companyTaxCode,
      }));

      await apiService.post<any>(`/BCDotBaoCao/SendRequireReport`, requests);
      message.success("Thêm đối tượng báo cáo thành công");
      setIsAddModalOpen(false);
      // onFetch(); // Tải lại danh sách đã thê
      fetchData(
        1,
        pagination.pageSize,
        filterQuarter,
        dayjs(),
        undefined,
        undefined,
      );
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
    <>
      <Card
        bordered={false}
        className="mb-4 shadow-sm"
        style={{ borderRadius: 12, marginBottom: 16 }}
        headStyle={{ borderBottom: "1px solid #f0f0f0", padding: "0 24px" }}
        bodyStyle={{ padding: "24px" }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={4}>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13 }}>
                Năm báo cáo
              </Text>
            </div>
            <DatePicker
              placeholder="Chọn năm"
              style={{ width: "100%" }}
              value={filterYear}
              onChange={setFilterYear}
              allowClear={false}
              format="YYYY"
              picker="year"
              suffixIcon={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13 }}>
                Quý báo cáo
              </Text>
            </div>
            <Select
              placeholder="Chọn quý"
              style={{ width: "100%" }}
              value={filterQuarter}
              onChange={setFilterQuarter}
              allowClear
              options={Array.from({ length: 4 }, (_, i) => ({
                label: `Quý ${i + 1}`,
                value: i + 1,
              }))}
              suffixIcon={<CalendarOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13 }}>
                Trạng thái nộp
              </Text>
            </div>
            <Select
              placeholder="Chọn trạng thái"
              style={{ width: "100%" }}
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
              options={[
                { label: "Đã nộp", value: "SUBMITTED" },
                { label: "Đã duyệt", value: "APPROVED" },
                { label: "Chưa nộp", value: "DRAFT" },
              ]}
              suffixIcon={<FilterOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={10}>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13 }}>
                Mã số thuế
              </Text>
            </div>
            <Input
              placeholder="Nhập MST..."
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
              onPressEnter={() =>
                fetchData(
                  1,
                  pagination.pageSize,
                  filterQuarter,
                  filterYear,
                  filterPlatformType,
                  filterStatus,
                )
              }
              allowClear
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            />
          </Col>

          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13 }}>
                Loại nền tảng
              </Text>
            </div>
            <Select
              placeholder="Chọn loại nền tảng"
              style={{ width: "100%" }}
              value={filterPlatformType}
              onChange={setFilterPlatformType}
              allowClear
              options={[
                {
                  label: "Nền tảng TMĐT kinh doanh trực tiếp...",
                  value: "1",
                },
                {
                  label: "Nền tảng TMĐT kinh doanh trực tiếp nước ngoài...",
                  value: "2",
                },
                {
                  label: "Nền tảng TMĐT trung gian...",
                  value: "3",
                },
                {
                  label: "Nền tảng TMĐT trung gian nước ngoài...",
                  value: "4",
                },
              ]}
              suffixIcon={<PushpinOutlined />}
            />
          </Col>
          <Col xs={24} md={12}>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 13 }}>
                Tên nền tảng
              </Text>
            </div>
            <Input
              placeholder="Nhập tên nền tảng cần tìm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={() =>
                fetchData(
                  1,
                  pagination.pageSize,
                  filterQuarter,
                  filterYear,
                  filterPlatformType,
                  filterStatus,
                )
              }
              allowClear
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            />
          </Col>

          <Col
            xs={24}
            md={24}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 8,
            }}
          >
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                const currentQuarter = Math.ceil((dayjs().month() + 1) / 3);
                setFilterQuarter(currentQuarter);
                setFilterYear(dayjs());
                setFilterPlatformType(undefined);
                setFilterStatus(undefined);
                setKeyword("");
                setTaxCode("");
                fetchData(
                  1,
                  pagination.pageSize,
                  currentQuarter,
                  dayjs(),
                  undefined,
                  undefined,
                );
              }}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => {
                fetchData(
                  1,
                  pagination.pageSize,
                  filterQuarter,
                  filterYear,
                  filterPlatformType,
                  filterStatus,
                );
              }}
              loading={fetching}
              style={{ paddingLeft: 32, paddingRight: 32 }}
            >
              Tìm kiếm
            </Button>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={openAddModal}
            >
              Thêm đối tượng
            </Button>
            {isGuiMail && (
              <Button
                danger
                icon={<MailOutlined />}
                onClick={handleSendMailAll}
                loading={sendingMailAll}
              >
                Gửi mail hàng loạt
              </Button>
            )}
            <Button
              style={{
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
                color: "white",
              }}
              icon={<BellOutlined />}
              onClick={handleSendNotificationAll}
              loading={sendingNotificationAll}
            >
              Gửi thông báo hàng loạt
            </Button>
          </Col>
        </Row>
      </Card>

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
              style={{ width: 400 }}
              value={modalTypeFilter}
              onChange={(val) => setModalTypeFilter(val)}
              options={[
                {
                  label:
                    "Nền tảng TMĐT kinh doanh trực tiếp có chức năng đặt hàng trực tuyến",
                  value: "1",
                },
                {
                  label:
                    "Nền tảng TMĐT kinh doanh trực tiếp nước ngoài có chức năng đặt hàng trực tuyến có hoạt động TMĐT tại Việt Nam",
                  value: "2",
                },
                {
                  label:
                    "Nền tảng TMĐT trung gian, mạng xã hội hoạt động TMĐT, nền tảng TMĐT tích hợp",
                  value: "3",
                },
                {
                  label:
                    "Nền tảng TMĐT trung gian nước ngoài, mạng xã hội hoạt động TMĐT nước ngoài, nền tảng TMĐT tích hợp nước ngoài",
                  value: "4",
                },
              ]}
            />
            <Select
              placeholder="Trạng thái nền tảng"
              mode="multiple"
              allowClear
              style={{ width: 250 }}
              value={modalStatusFilter}
              onChange={(val) => setModalStatusFilter(val)}
              options={ConstractStatusConstant.getDropdownListKey().filter(
                (item: any) => item.value !== 0,
              )}
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
      <Spin spinning={fetching}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(r) => `${r.id}_${r.thangBaoCao}`}
          bordered
          size="small"
          pagination={{
            total: pagination.totalCount,
            current: pagination.pageIndex,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            showTotal: (t, r) => `${r[0]}-${r[1]} / ${t}`,
            onChange: (page, size) =>
              fetchData(
                page,
                size,
                filterQuarter,
                filterYear,
                filterPlatformType,
                filterStatus,
              ),
          }}
          locale={{ emptyText: "Không có dữ liệu" }}
        />
      </Spin>
    </>
  );
}
