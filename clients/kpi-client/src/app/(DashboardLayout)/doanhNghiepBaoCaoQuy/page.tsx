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
} from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import bcSubmissionService from "@/services/bcSubmission/bcSubmission.service";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";

const { Text } = Typography;

export default function DoanhNghiepBaoCaoQuyPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 20,
    totalCount: 0,
  });
  const [idFormTemplate, setIdFormTemplate] = useState<string>("");

  // Filters
  const [filterQuarter, setFilterQuarter] = useState<number | undefined>(
    Math.ceil((dayjs().month() + 1) / 3),
  );
  const [filterYear, setFilterYear] = useState<Dayjs | null>(dayjs());
  const [filterPlatformType, setFilterPlatformType] = useState<
    string | undefined
  >(undefined);
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
          setIdFormTemplate(dotItems[0].bcFormTemplates[0].id);
          // Initial fetch after dots are loaded
          fetchData(
            1,
            20,
            filterQuarter,
            filterYear,
            filterPlatformType,
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

    setLoading(true);
    try {
      const body: any = {
        pageIndex: page,
        pageSize: size,
        namBaoCao: currentYear,
        thangBaoCao: currentQuarter,
        nameNenTang: currentName,
        companyTaxcode: currentTaxCode,
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
                const matchingDot = lookupDots.find(
                  (d: any) => d.kySo === m && d.namBaoCao === currentYear,
                );
                expandedItems.push({
                  ...sample,
                  thangBaoCao: m,
                  namBaoCao: currentYear,
                  status: "CHUA_NOP", // Trạng thái ảo
                  isVirtual: true,
                  idDotBaoCao: matchingDot?.id || null,
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
      setLoading(false);
    }
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
      if (submission.status === "DRAFT")
        return <Tag color="error">Chưa nộp</Tag>;
      if (submission.status === "TAM_LUU")
        return <Tag color="error">Tạm lưu</Tag>;
      if (submission.status === "NOP_MUON")
        return <Tag color="orange">Nộp muộn</Tag>;

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
      width: 110,
      align: "center" as const,
      fixed: "right" as const,
      render: (_: any, r: any) => {
        // Find matching submission in history
        const history = r.lichSuNop || [];
        const submission = history.find(
          (h: any) =>
            h.thangBaoCao === r.thangBaoCao && h.namBaoCao === r.namBaoCao,
        );

        const templateId = submission?.formTemplateId;

        const canView = r.idDotBaoCao && templateId;
        const isSubmitted =
          submission &&
          (submission.status === "SUBMITTED" ||
            submission.status === "APPROVED" ||
            submission.status === "COMPLETED" ||
            submission.status === "CHOGUIMAIL");

        return (
          <Button
            type="primary"
            ghost
            
            icon={isSubmitted ? <EyeOutlined /> : <FileTextOutlined />}
            // disabled={!canView}
            onClick={() => {
              if (isSubmitted) {
                router.push(
                  `/doanhNghiepBaoCaoQuy/${r.idDotBaoCao}/${idFormTemplate}?assignmentId=${r.id}&month=${r.thangBaoCao}&year=${r.namBaoCao}`,
                );
              } else {
                router.push(
                  `/doanhNghiepBaoCaoQuy/${r.idDotBaoCao}/${idFormTemplate}?assignmentId=${r.id}&month=${r.thangBaoCao}&year=${r.namBaoCao}`,
                );
              }
            }}
          >
            {isSubmitted ? "Sửa báo cáo" : "Làm báo cáo"}
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <AutoBreadcrumb />
      </div>

      <Card bordered={false} style={{ borderRadius: 10 }}>
        <Space wrap style={{ marginBottom: 16 }}>
          <DatePicker
            placeholder="Tất cả năm"
            style={{ width: 130 }}
            value={filterYear}
            onChange={setFilterYear}
            allowClear
            format="YYYY"
            picker="year"
          />
          <Select
            placeholder="Quý"
            style={{ width: 130 }}
            value={filterQuarter}
            onChange={setFilterQuarter}
            allowClear
            options={Array.from({ length: 4 }, (_, i) => ({
              label: `Quý ${i + 1}`,
              value: i + 1,
            }))}
          />
          <Select
            placeholder="Loại nền tảng"
            style={{ width: 350 }}
            value={filterPlatformType}
            onChange={setFilterPlatformType}
            allowClear
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
          <Input
            placeholder="Tìm tên nền tảng..."
            style={{ width: 250 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() =>
              fetchData(
                1,
                pagination.pageSize,
                filterQuarter,
                filterYear,
                filterPlatformType,
              )
            }
            allowClear
          />

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
              );
            }}
            loading={loading}
          >
            Tìm kiếm
          </Button>
        </Space>

        <Spin spinning={loading}>
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
                ),
            }}
            locale={{ emptyText: "Không có dữ liệu" }}
          />
        </Spin>
      </Card>
    </>
  );
}
