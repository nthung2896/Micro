"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  message,
  Select,
  Space,
  Button,
  Spin,
  Input,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  SyncOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import bcSubmissionService from "@/services/bcSubmission/bcSubmission.service";
import bcFormTemplateService from "@/services/bcFormTemplate/bcFormTemplate.service";
import { useRouter } from "next/navigation";
import { BCFormTemplateType } from "@/types/bcFormTemplate/dto";

const { Text, Title } = Typography;

export default function TongHopKetQuaBaoCaoNamPage() {
  const router = useRouter();
  
  const [dots, setDots] = useState<any[]>([]);
  const [selectedDotId, setSelectedDotId] = useState<string | undefined>();
  const [templateId, setTemplateId] = useState<string | undefined>();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 20,
    totalCount: 0,
  });

   const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState("");
  const [platformName, setPlatformName] = useState("");

  // 1. Fetch danh sách đợt báo cáo NĂM
  useEffect(() => {
    const fetchDots = async () => {
      try {
        const res = await bcSubmissionService.getDotBaoCaoData({
          pageIndex: 1,
          pageSize: 500,
          loaiKyBaoCao: "NAM",
        });
        if (res?.data?.items) {
          const dotItems = res.data.items;
          setDots(dotItems);
          if (dotItems.length > 0) {
            setSelectedDotId(dotItems[0].id);
          }
        }
      } catch (error) {
        message.error("Lỗi khi tải danh sách đợt báo cáo");
      }
    };
    fetchDots();
  }, []);

  // 2. Fetch template ID and Data
  const fetchData = useCallback(async (dotId: string, page = 1, size = 20) => {
    if (!dotId) return;
    setLoading(true);
    try {
      const dotDetail = dots.find(d => d.id === dotId);
      const idBaoCao = dotDetail?.idBaoCao;

      // Lấy templateId để phục vụ việc Xem báo cáo
      if (idBaoCao && !templateId) {
        const templateRes = await bcFormTemplateService.getData({ idBaoCao, pageIndex: 1, pageSize: 1 });
        const firstTemplate = templateRes.data?.items?.[0];
        if (firstTemplate) {
            setTemplateId(firstTemplate.id);
        }
      }

      const searchBody = {
        pageIndex: page,
        pageSize: size,
        idDotBaoCao: dotId,
        LoaiKyBaoCao: "NAM",
        CompanyTaxcode: keyword || undefined,
        NameNenTang: platformName || undefined,
        Status: statusFilter || undefined,
      };

      const resData = await bcSubmissionService.getBaoCaoDoiTuongData(searchBody);

      if (resData?.data) {
        setData(resData.data.items || []);
        setPagination({
          pageIndex: resData.data.pageIndex,
          pageSize: resData.data.pageSize,
          totalCount: resData.data.totalCount,
        });
      }
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  }, [dots, templateId, keyword, platformName, statusFilter]);

  useEffect(() => {
    if (selectedDotId) {
      fetchData(selectedDotId, 1, pagination.pageSize);
    }
  }, [selectedDotId]);

  const handleSearch = () => {
    if (selectedDotId) fetchData(selectedDotId, 1, pagination.pageSize);
  };

  const columns = [
    {
      title: "STT",
      width: 70,
      align: "center" as const,
      render: (_: any, __: any, index: number) =>
        pagination.pageSize * (pagination.pageIndex - 1) + index + 1,
    },
    {
      title: "Tên công ty",
      dataIndex: "companyName",
      key: "companyName",
      render: (val: string) => <Text strong>{val}</Text>,
    },
    {
      title: "Tên nền tảng",
      dataIndex: "nameNenTang",
      key: "nameNenTang",
    },
    {
      title: "Mã số thuế",
      dataIndex: "companyTaxcode",
      key: "companyTaxcode",
      width: 150,
      align: "center" as const,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 150,
      align: "center" as const,
      render: (val: string) => {
        if (val === "SUBMITTED") return <Tag color="green">Đã nộp</Tag>;
        if (val === "APPROVED") return <Tag color="blue">Đã duyệt</Tag>;
        if (val === "DRAFT" || val === "TAM_LUU") return <Tag color="default">Chưa nộp</Tag>;
        if (val === "CHOGUIMAIL") return <Tag color="orange">Chờ gửi mail</Tag>;
        if (val === "NOP_MUON") return <Tag color="orange">Nộp muộn</Tag>;
        return <Tag>{val}</Tag>;
      },
    },
    {
      title: "Thao tác",
      width: 120,
      align: "center" as const,
      fixed: "right" as const,
      render: (_: any, record: any) => {
        const history = record.lichSuNop || [];
        const hasSubmission = history.length > 0;

        return (
          <Space>
            <Tooltip title="Xem báo cáo">
              <Button
                
                type="primary"
                ghost
                icon={<EyeOutlined />}
                disabled={!hasSubmission}
                onClick={() => {
                  router.push(`/baoCaoDinhKyHangNam/${selectedDotId}/xemBaoCao/${record.id}/${templateId}`);
                }}
              >
                Xem
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = async () => {
    const idDotBaoCao = selectedDotId;

    if (!idDotBaoCao) {
      message.warning("Vui lòng chọn đợt báo cáo");
      return;
    }

    setExportLoading(true);
    try {
      const params = {
        idDotBaoCao: idDotBaoCao,
        thang: null,
        nam: null,
      };

   
      const res = (await bcSubmissionService.exportExcel(
        params,
      )) as unknown as Blob;
      const url = window.URL.createObjectURL(res);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Report_${data[0].dotBaoCaoName}.xlsx`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error("Lỗi xuất báo cáo");
    } finally {
      setExportLoading(false);
    }
  };
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <AutoBreadcrumb />
      </div>

      <Card bordered={false} bodyStyle={{ padding: "16px" }}>
        <Flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 16 }}>
          <Space wrap>
            <Text strong>Đợt báo cáo:</Text>
            <Select
              style={{ width: 280 }}
              value={selectedDotId}
              onChange={(val) => {
                setSelectedDotId(val);
                setTemplateId(undefined); 
              }}
              placeholder="Chọn đợt báo cáo"
              options={dots.map((d) => ({ label: d.name, value: d.id }))}
            />
            <Input
              placeholder="Tìm theo MST..."
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 150 }}
            />
            <Input
              placeholder="Tên nền tảng..."
              allowClear
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 220 }}
            />
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: 150 }}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { label: "Đã nộp", value: "SUBMITTED" },
                { label: "Đã duyệt", value: "APPROVED" },
                { label: "Chưa nộp", value: "DRAFT" },
                { label: "Chờ gửi mail", value: "CHOGUIMAIL" },
                { label: "Nộp muộn", value: "NOP_MUON" },
              ]}
            />
            <Button
                icon={<SearchOutlined />}
                title="Tìm kiếm"
                onClick={() => selectedDotId && fetchData(selectedDotId)}
            />
          </Space>
           <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={exportLoading}
              onClick={handleExport}
              disabled={!selectedDotId || data.length === 0}
            >
              Xuất báo cáo
            </Button>
        </Flex>

        <Spin spinning={loading}>
          <div className="table-responsive">
            <Table
              columns={columns}
              dataSource={data}
              rowKey="id"
              bordered
              size="small"
              pagination={{
                total: pagination.totalCount,
                current: pagination.pageIndex,
                pageSize: pagination.pageSize,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total}`,
                onChange: (page, size) => selectedDotId && fetchData(selectedDotId, page, size),
              }}
              locale={{ emptyText: "Không có dữ liệu đối tượng báo cáo" }}
            />
          </div>
        </Spin>
      </Card>
    </>
  );
}
