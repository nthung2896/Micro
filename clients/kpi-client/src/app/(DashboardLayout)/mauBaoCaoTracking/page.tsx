"use client";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageInfo } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { SearchOutlined, FileOutlined, FileWordOutlined, FilePdfOutlined, FileExcelOutlined, BellOutlined, CloseOutlined, TeamOutlined, GlobalOutlined, ClusterOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Modal, Pagination, Row, Select, Space, Table, TableColumnsType, Tag, message, List, DatePicker, Tabs } from "antd";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import mauBaoCaoService from "@/services/mauBaoCao/mauBaoCao.service";
import { MauBaoCaoDto, MauBaoCaoTrackingDto, MauBaoCaoTrackingSearch, MauBaoCaoChiTietDto, SaveMauBaoCaoDataRequest } from "@/types/mauBaoCao";
import PlatformManageTypeConstant from "@/constants/PlatformManageTypeConstant";
import parse, { DOMNode } from "html-react-parser";
import dayjs from "dayjs";
import { useSessionStorage } from "@/hooks/useSessionStorage";
const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ label: `Tháng ${i + 1}`, value: i + 1 }));
const YEARS = Array.from({ length: 11 }, (_, i) => ({ label: `Năm ${2020 + i}`, value: 2020 + i }));

interface GroupedCompanyItem {
  companyTaxCode: string;
  companyName: string;
  companyId?: string | null;
  companyEmail?: string | null;
  companyPhone?: string | null;
  submittedCount: number;
  totalPlatforms: number;
  platforms: MauBaoCaoTrackingDto[];
}

const Page: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [rawDataList, setRawDataList] = useState<MauBaoCaoTrackingDto[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const loading = useSelector((state) => state.general.isLoading);

  // Bộ lọc
  const [thangBaoCao, setThangBaoCao] = useState<number>(dayjs().month() + 1);
  const [namBaoCao, setNamBaoCao] = useState<number>(dayjs().year());
  const [keyword, setKeyword] = useState<string>("");
  const [loaiNenTang, setLoaiNenTang] = useState<number | null>(null);
  const [selectedTemplateIdFilter, setSelectedTemplateIdFilter] = useState<string>("");
  const [templateList, setTemplateList] = useState<MauBaoCaoDto[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedRowKeys, setSelectedRowKeys, clearSelectedRowKeys] = useSessionStorage<React.Key[]>("mauBaoCaoTracking_selected", []);
  const [activeTab, setActiveTab] = useState<string>("NEN_TANG");
  const [kyBaoCaoFilter, setKyBaoCaoFilter] = useState<string>("THANG");

  // Tải danh sách mẫu biểu báo cáo
  const fetchTemplates = async () => {
    try {
      const res = await mauBaoCaoService.getData({ pageIndex: 1, pageSize: 100 });
      if (res.status && res.data) {
        setTemplateList(res.data.items);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách mẫu báo cáo:", err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Xem chi tiết báo cáo đã nộp
  const [isOpenViewModal, setIsOpenViewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MauBaoCaoDto | null>(null);
  const [selectedTracking, setSelectedTracking] = useState<MauBaoCaoTrackingDto | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // Thực hiện gộp dữ liệu theo doanh nghiệp ở client
  const groupedCompanyList = useMemo((): GroupedCompanyItem[] => {
    const map = new Map<string, GroupedCompanyItem>();

    rawDataList.forEach((item) => {
      const key = item.companyTaxCode || item.companyName;
      if (!map.has(key)) {
        map.set(key, {
          companyTaxCode: item.companyTaxCode,
          companyName: item.companyName,
          companyId: item.companyId,
          companyEmail: item.companyEmail,
          companyPhone: item.companyPhone,
          submittedCount: 0,
          totalPlatforms: 0,
          platforms: []
        });
      }

      const group = map.get(key)!;
      group.platforms.push(item);
      group.totalPlatforms++;
      if (item.status === "SUBMITTED") {
        group.submittedCount++;
      }
    });

    return Array.from(map.values());
  }, [rawDataList]);

  // Lấy trạng thái nền tảng từ template đã chọn
  const [trackingStatusFilter, setTrackingStatusFilter] = useState<string>("");

  // Lấy danh sách kỳ báo cáo khả dụng dựa vào tab + template
  const availableKyList = useMemo(() => {
    const filtered = templateList.filter(t => t.phanLoai === activeTab || (!t.phanLoai && activeTab === "NEN_TANG"));
    const kySet = new Set(filtered.map(t => t.kyBaoCao).filter((k): k is string => !!k));
    const kyMap: Record<string, string> = { THANG: "Tháng", QUY: "Quý", NAM: "Năm" };
    return Array.from(kySet).map(k => ({ value: k, label: kyMap[k] || k }));
  }, [templateList, activeTab]);

  // Khi availableKy thay đổi, nếu ky hiện tại không còn trong danh sách thì set về giá trị đầu tiên
  useEffect(() => {
    if (availableKyList.length > 0 && !availableKyList.find(k => k.value === kyBaoCaoFilter)) {
      setKyBaoCaoFilter(availableKyList[0].value as string);
    }
  }, [availableKyList, kyBaoCaoFilter]);
  useEffect(() => {
    if (selectedTemplateIdFilter && templateList.length > 0) {
      const tmpl = templateList.find(t => t.id === selectedTemplateIdFilter);
      if (tmpl?.trangThaiNenTang) {
        setTrackingStatusFilter(tmpl.trangThaiNenTang);
      } else {
        setTrackingStatusFilter("");
      }
      if (tmpl?.kyBaoCao) {
        setKyBaoCaoFilter(tmpl.kyBaoCao);
      }
    } else {
      setTrackingStatusFilter("");
    }
  }, [selectedTemplateIdFilter, templateList]);

  const handleFetch = useCallback(async (sIndex?: number, sSize?: number, tabKey?: string) => {
    dispatch(setIsLoading(true));
    try {
      const idx = sIndex || pageIndex;
      const size = sSize || pageSize;
      const param: MauBaoCaoTrackingSearch = {
        pageIndex: idx,
        pageSize: size,
        thangBaoCao,
        namBaoCao,
        keyword: keyword || undefined,
        loaiNenTang: loaiNenTang || undefined,
        mauBaoCaoId: selectedTemplateIdFilter || undefined,
        trangThaiNenTang: trackingStatusFilter || undefined,
        kyBaoCao: kyBaoCaoFilter || undefined,
      };
      param.phanLoai = tabKey || activeTab;
      const r = await mauBaoCaoService.getSubmissionTracking(param);
      if (r?.data) {
        setRawDataList(r.data.items);
        setDataPage({
          pageIndex: r.data.pageIndex,
          pageSize: r.data.pageSize,
          totalCount: r.data.totalCount,
          totalPage: r.data.totalPage
        });
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [pageIndex, pageSize, thangBaoCao, namBaoCao, keyword, loaiNenTang, selectedTemplateIdFilter, dispatch, trackingStatusFilter, kyBaoCaoFilter]);

  const handleRemind = async (record: MauBaoCaoTrackingDto) => {
    dispatch(setIsLoading(true));
    try {
      const payload: SaveMauBaoCaoDataRequest = {
        mauBaoCaoId: selectedTemplateIdFilter || "00000000-0000-0000-0000-000000000000",
        companyId: record.companyId,
        platformId: record.platformId,
        thangBaoCao,
        namBaoCao,
        values: {}
      };
      const res = await mauBaoCaoService.sendReminder(payload);
      if (res.status) {
        message.success(res.message || "Gửi email nhắc nhở thành công!");
      } else {
        message.error(res.message || "Gửi nhắc nhở thất bại");
      }
    } catch (err) {
      message.error("Lỗi khi kết nối gửi nhắc nhở");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleCompanyRemind = async (record: GroupedCompanyItem) => {
    dispatch(setIsLoading(true));
    try {
      const res = await mauBaoCaoService.sendCompanyReminder({
        companyTaxCode: record.companyTaxCode,
        thangBaoCao,
        namBaoCao
      });
      if (res.status) {
        message.success(res.message || "Gửi email nhắc nhở doanh nghiệp thành công!");
      } else {
        message.error(res.message || "Gửi nhắc nhở thất bại");
      }
    } catch (err) {
      message.error("Lỗi khi kết nối gửi nhắc nhở");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleBulkCompanyRemind = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một doanh nghiệp để nhắc nhở");
      return;
    }
    const selectedCompanies = groupedCompanyList.filter(
      (item) => selectedRowKeys.includes(item.companyTaxCode) && item.submittedCount < item.totalPlatforms
    );
    if (selectedCompanies.length === 0) {
      message.warning("Các doanh nghiệp được chọn đều đã hoàn thành nộp báo cáo!");
      return;
    }
    dispatch(setIsLoading(true));
    try {
      const res = await mauBaoCaoService.sendBulkCompanyReminder({
        companyTaxCodes: selectedCompanies.map((item) => item.companyTaxCode),
        thangBaoCao,
        namBaoCao
      });
      if (res.status) {
        message.success(res.data?.message || res.message || "Gửi nhắc nhở thành công!");
        clearSelectedRowKeys();
      } else {
        message.error(res.message || "Gửi nhắc nhở thất bại");
      }
    } catch (err) {
      message.error("Lỗi khi kết nối gửi nhắc nhở hàng loạt");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleRemindAllCompanies = async () => {
    Modal.confirm({
      title: "Xác nhận nhắc nhở tất cả doanh nghiệp",
      content: `Bạn có chắc muốn gửi nhắc nhở đến tất cả doanh nghiệp khớp với bộ lọc hiện tại?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        dispatch(setIsLoading(true));
        try {
          const res = await mauBaoCaoService.sendRemindAllCompanies({
            thangBaoCao,
            namBaoCao,
            keyword: keyword || undefined,
            loaiNenTang: loaiNenTang || undefined,
            mauBaoCaoId: selectedTemplateIdFilter || undefined,
            trangThaiNenTang: trackingStatusFilter || undefined,
          });
          if (res.status) {
            message.success(res.data?.message || res.message || "Gửi nhắc nhở tất cả thành công!");
            clearSelectedRowKeys();
          } else {
            message.error(res.message || "Gửi nhắc nhở thất bại");
          }
        } catch (err) {
          message.error("Lỗi khi kết nối gửi nhắc nhở tất cả");
        } finally {
          dispatch(setIsLoading(false));
        }
      },
    });
  };

  // Helper: download base64 as xlsx file
  const downloadExcel = (base64: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const phanLoaiLabel = activeTab === "CHUNG_THUC" ? "ChungThuc" : "NenTang";
    const kyLabel = kyBaoCaoFilter === "QUY" ? `Quy${Math.ceil(thangBaoCao / 3)}` : kyBaoCaoFilter === "NAM" ? `Nam${namBaoCao}` : `Thang${thangBaoCao}`;
    a.download = `BaoCao_${phanLoaiLabel}_${kyLabel}_Nam${namBaoCao}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportSelected = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một doanh nghiệp để tải xuống");
      return;
    }
    const selectedCompanies = groupedCompanyList.filter(
      (item) => selectedRowKeys.includes(item.companyTaxCode)
    );

    dispatch(setIsLoading(true));
    try {
      const res = await mauBaoCaoService.exportExcel({
        thangBaoCao,
        namBaoCao,
        keyword: keyword || undefined,
        loaiNenTang: activeTab === "NEN_TANG" ? (loaiNenTang || undefined) : undefined,
        mauBaoCaoId: selectedTemplateIdFilter || undefined,
        trangThaiNenTang: trackingStatusFilter || undefined,
        phanLoai: activeTab,
        kyBaoCao: kyBaoCaoFilter || undefined,
        companyTaxCodes: selectedCompanies.map((item) => item.companyTaxCode),
      });
      if (res.status && res.data) {
        downloadExcel(res.data);
        message.success("Tải xuống báo cáo Excel thành công!");
        clearSelectedRowKeys();
      } else {
        message.error(res.message || "Xuất Excel thất bại");
      }
    } catch (err) {
      message.error("Lỗi khi kết nối xuất Excel");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleExportAll = async () => {
    dispatch(setIsLoading(true));
    try {
      const res = await mauBaoCaoService.exportExcel({
        thangBaoCao,
        namBaoCao,
        keyword: keyword || undefined,
        loaiNenTang: activeTab === "NEN_TANG" ? (loaiNenTang || undefined) : undefined,
        mauBaoCaoId: selectedTemplateIdFilter || undefined,
        trangThaiNenTang: trackingStatusFilter || undefined,
        phanLoai: activeTab,
        kyBaoCao: kyBaoCaoFilter || undefined,
      });
      if (res.status && res.data) {
        downloadExcel(res.data);
        message.success("Tải xuống báo cáo Excel thành công!");
      } else {
        message.error(res.message || "Xuất Excel thất bại");
      }
    } catch (err) {
      message.error("Lỗi khi kết nối xuất Excel");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleOpenView = async (record: MauBaoCaoTrackingDto) => {
    dispatch(setIsLoading(true));
    try {
      setSelectedTracking(record);

      const isChungThuc = activeTab === "CHUNG_THUC";
      const resValues = await mauBaoCaoService.getSubmissionDetail(
        record.mauBaoCaoId || null,
        record.companyId,
        isChungThuc ? null : record.platformId,
        isChungThuc ? record.platformId : null,
        thangBaoCao,
        namBaoCao,
        true // isSpecialistView = true
      );

      if (resValues.status && resValues.data) {
        setFormValues(resValues.data.values || {});

        const resDetail = await mauBaoCaoService.getById(resValues.data.mauBaoCaoId);
        if (resDetail.status && resDetail.data) {
          setSelectedTemplate(resDetail.data);
        }
      } else {
        message.error("Không tìm thấy dữ liệu báo cáo");
        return;
      }

      setIsOpenViewModal(true);
    } catch (err) {
      message.error("Lỗi khi tải dữ liệu chi tiết báo cáo");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleExportDocx = async () => {
    if (!selectedTemplate || !selectedTracking) return;
    dispatch(setIsLoading(true));
    try {
      const payload: SaveMauBaoCaoDataRequest = {
        mauBaoCaoId: selectedTemplate.id || "",
        companyId: selectedTracking.companyId,
        platformId: activeTab === "CHUNG_THUC" ? null : selectedTracking.platformId,
        contractId: activeTab === "CHUNG_THUC" ? selectedTracking.platformId : null,
        thangBaoCao,
        namBaoCao,
        values: formValues
      };
      const res = await mauBaoCaoService.exportDocx(payload);
      if (res.status && res.data) {
        window.open(`${staticUrl}/${res.data.replace(/^\//, '')}`, "_blank");
      } else {
        message.error(res.message || "Xuất file Word thất bại");
      }
    } catch (err) {
      message.error("Lỗi khi kết nối xuất file Word");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleExportPdf = async () => {
    if (!selectedTemplate || !selectedTracking) return;
    dispatch(setIsLoading(true));
    try {
      const payload: SaveMauBaoCaoDataRequest = {
        mauBaoCaoId: selectedTemplate.id || "",
        companyId: selectedTracking.companyId,
        platformId: activeTab === "CHUNG_THUC" ? null : selectedTracking.platformId,
        contractId: activeTab === "CHUNG_THUC" ? selectedTracking.platformId : null,
        thangBaoCao,
        namBaoCao,
        values: formValues
      };
      const res = await mauBaoCaoService.exportPdf(payload);
      if (res.status && res.data) {
        window.open(`${staticUrl}/${res.data.replace(/^\//, '')}`, "_blank");
      } else {
        message.error(res.message || "Xuất PDF thất bại");
      }
    } catch (err) {
      message.error("Lỗi khi kết nối xuất PDF");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  // Tách style và body từ HtmlContent để render
  const docxPreviewContent = useMemo(() => {
    if (!selectedTemplate?.htmlContent) return null;

    const html = selectedTemplate.htmlContent;
    const styleMatch = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
      .map((m) => m[1])
      .join("\n");

    const body = html
      .replace(/<!DOCTYPE[^>]*>/i, "")
      .replace(/<html[^>]*>/i, "")
      .replace(/<\/html>/i, "")
      .replace(/<head[\s\S]*?<\/head>/i, "")
      .replace(/<body[^>]*>/i, "")
      .replace(/<\/body>/i, "")
      .trim();

    return { style: styleMatch, body };
  }, [selectedTemplate]);

  // Bộ lọc parser thay thế [[key]] thành chữ in đậm, in nghiêng màu xanh (Read-Only)
  const replaceOptions = {
    replace: (domNode: DOMNode) => {
      if (domNode.type === "text" && domNode.data) {
        const text = domNode.data;
        const regex = /\[\[(.*?)\]\]/g;
        if (!regex.test(text)) return;

        const parts = text.split(/\[\[(.*?)\]\]/);
        return (
          <>
            {parts.map((part, index) => {
              if (index % 2 === 1) {
                const key = part.trim();
                const cleanKey = `{{${key}}}`;
                const value = formValues[cleanKey];

                return (
                  <span key={index} style={{ color: "#096dd9", fontWeight: "bold", fontStyle: "italic", borderBottom: "1px solid #d9d9d9", padding: "0 4px", minWidth: "40px", display: "inline-block" }}>
                    {value || "........"}
                  </span>
                );
              }
              return part || null;
            })}
          </>
        );
      }
    },
  };

  const renderStatusTag = (status?: string | null, record?: MauBaoCaoTrackingDto) => {
    if (status === "SUBMITTED") {
      return <Tag color="green">Đã nộp ({dayjs(record?.submittedDate).format("DD/MM/YYYY")})</Tag>;
    }
    if (status === "DRAFT") {
      return <Tag color="gold">Đang nháp</Tag>;
    }
    return <Tag color="red">Chưa nộp</Tag>;
  };

  // Bảng con: Danh sách nền tảng thuộc doanh nghiệp đó dưới dạng danh sách trực quan
  const expandedRowRender = (record: GroupedCompanyItem) => {
    return (
      <div style={{ padding: "4px 16px", background: "#fafafa", borderRadius: "0 0 8px 8px" }}>
        <List
          dataSource={record.platforms}
          rowKey="platformId"
          size="small"
          renderItem={(item) => (
            <List.Item
              key={item.platformId}
              style={{ padding: "6px 0" }}
              actions={[
                <Space key="actions">
                  {item.status ? (
                    <>
                      <Button type="primary"  icon={<FileOutlined />} onClick={() => handleOpenView(item)}>
                        Xem báo cáo
                      </Button>
                      {item.status === "DRAFT" && (
                        <Button type="dashed" danger  icon={<BellOutlined />} onClick={() => handleRemind(item)}>
                          Nhắc nhở
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button type="dashed" danger  icon={<BellOutlined />} onClick={() => handleRemind(item)}>
                      Nhắc nhở
                    </Button>
                  )}
                </Space>
              ]}
            >
              <List.Item.Meta
                avatar={<GlobalOutlined style={{ color: "#1890ff", fontSize: 16, marginTop: 4 }} />}
                title={
                  <Space size="middle" wrap>
                    {(() => {
                      const tmpl = templateList.find(t => t.id === item.mauBaoCaoId);
                      return tmpl ? <Tag color="cyan">{tmpl.maMauBaoCao}</Tag> : null;
                    })()}
                    <strong style={{ fontSize: 14 }}>{item.platformName}</strong>
                    {item.domain && <span style={{ fontSize: 13, color: "#888" }}>({item.domain})</span>}
                    <span style={{ fontSize: 13, color: "#999" }}>| Loại: {item.loaiNenTangName}</span>
                    <span style={{ fontSize: 13, color: "#888" }}>| Trạng thái:</span>
                    {renderStatusTag(item.status, item)}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );
  };

  useEffect(() => {
    handleFetch(1, pageSize, activeTab);
  }, [thangBaoCao, namBaoCao, loaiNenTang, selectedTemplateIdFilter]);

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" style={{ marginBottom: 10 }}><AutoBreadcrumb /></Flex>

      <Tabs activeKey={activeTab} onChange={(key) => { setActiveTab(key); setSelectedTemplateIdFilter(""); setRawDataList([]); clearSelectedRowKeys(); handleFetch(1, undefined, key); }} style={{ marginBottom: 0 }} items={[
        {
          key: "NEN_TANG",
          label: <span><ClusterOutlined /> Nền tảng TMĐT</span>,
          children: (
            <Card bodyStyle={{ padding: 16 }} style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]} align="bottom">
                <Col md={8}>
                  <Form.Item label="Chọn mẫu báo cáo" style={{ marginBottom: 0 }}>
                    <Select allowClear placeholder="Tất cả mẫu báo cáo" options={templateList.filter(t => t.phanLoai === activeTab || (!t.phanLoai && activeTab === "NEN_TANG")).map(t => ({ label: `${t.maMauBaoCao} - ${t.tenMauBaoCao}`, value: t.id }))} value={selectedTemplateIdFilter || undefined} onChange={(val) => setSelectedTemplateIdFilter(val || "")} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                {activeTab === "NEN_TANG" && (
                  <Col md={8}>
                    <Form.Item label="Loại nền tảng" style={{ marginBottom: 0 }}>
                      <Select allowClear placeholder="Tất cả loại nền tảng" options={[{ value: 1, label: "Nền tảng TMĐT kinh doanh trực tiếp có chức năng đặt hàng trực tuyến" }, { value: 2, label: "Nền tảng TMĐT kinh doanh trực tiếp nước ngoài có chức năng đặt hàng trực tuyến có hoạt động TMĐT tại Việt Nam" }, { value: 3, label: "Nền tảng TMĐT trung gian, mạng xã hội hoạt động TMĐT, nền tảng TMĐT tích hợp" }, { value: 4, label: "Nền tảng TMĐT trung gian nước ngoài, mạng xã hội hoạt động TMĐT nước ngoài, nền tảng TMĐT tích hợp nước ngoài" }]} onChange={(val) => setLoaiNenTang(val ? Number(val) : null)} />
                    </Form.Item>
                  </Col>
                )}
                <Col md={4}>
                  <Form.Item label="Kỳ báo cáo" style={{ marginBottom: 0 }}>
                    <Select value={kyBaoCaoFilter} onChange={(val) => setKyBaoCaoFilter(val)} options={availableKyList.length > 0 ? availableKyList : [{ value: 'THANG', label: 'Tháng' }, { value: 'QUY', label: 'Quý' }, { value: 'NAM', label: 'Năm' }]} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col md={4}>
                  <Form.Item label="Kỳ" style={{ marginBottom: 0 }}>
                    <DatePicker picker={kyBaoCaoFilter === "NAM" ? "year" : kyBaoCaoFilter === "QUY" ? "month" : "month"} format={kyBaoCaoFilter === "NAM" ? "YYYY" : "MM/YYYY"} placeholder={kyBaoCaoFilter === "NAM" ? "Chọn năm" : "Chọn tháng/năm"} value={thangBaoCao && namBaoCao ? dayjs().year(namBaoCao).month(thangBaoCao - 1) : null} onChange={(date) => { if (date) { setThangBaoCao(date.month() + 1); setNamBaoCao(date.year()); } }} disabledDate={(current) => current && current.isAfter(dayjs(), "month")} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )
        },
        {
          key: "CHUNG_THUC",
          label: <span><SafetyCertificateOutlined /> Chứng thực HĐĐT</span>,
          children: (
            <Card bodyStyle={{ padding: 16 }} style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]} align="bottom">
                <Col md={8}>
                  <Form.Item label="Chọn mẫu báo cáo" style={{ marginBottom: 0 }}>
                    <Select allowClear placeholder="Tất cả mẫu báo cáo" options={templateList.filter(t => t.phanLoai === activeTab || (!t.phanLoai && activeTab === "NEN_TANG")).map(t => ({ label: `${t.maMauBaoCao} - ${t.tenMauBaoCao}`, value: t.id }))} value={selectedTemplateIdFilter || undefined} onChange={(val) => setSelectedTemplateIdFilter(val || "")} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col md={8}>
                  <Form.Item label="Kỳ báo cáo" style={{ marginBottom: 0 }}>
                    <Select value={kyBaoCaoFilter} onChange={(val) => setKyBaoCaoFilter(val)} options={availableKyList.length > 0 ? availableKyList : [{ value: 'THANG', label: 'Tháng' }, { value: 'QUY', label: 'Quý' }, { value: 'NAM', label: 'Năm' }]} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col md={4}>
                  <Form.Item label="Kỳ" style={{ marginBottom: 0 }}>
                    <DatePicker picker={kyBaoCaoFilter === "NAM" ? "year" : kyBaoCaoFilter === "QUY" ? "month" : "month"} format={kyBaoCaoFilter === "NAM" ? "YYYY" : "MM/YYYY"} placeholder={kyBaoCaoFilter === "NAM" ? "Chọn năm" : "Chọn tháng/năm"} value={thangBaoCao && namBaoCao ? dayjs().year(namBaoCao).month(thangBaoCao - 1) : null} onChange={(date) => { if (date) { setThangBaoCao(date.month() + 1); setNamBaoCao(date.year()); } }} disabledDate={(current) => current && current.isAfter(dayjs(), "month")} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )
        }
      ]} />
      <Col md={24}>
        <Row gutter={[16, 16]} justify="space-between" align="bottom">
          <Col md={20}>
            <Form.Item label="Từ khóa tìm kiếm" style={{ marginBottom: 0 }}>
              <Input placeholder="Nhập tên nền tảng, tên doanh nghiệp, mã số thuế..." value={keyword} onChange={(e) => setKeyword(e.target.value)} onPressEnter={() => handleFetch(1)} />
            </Form.Item>
          </Col>
          <Col md={4} style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="primary" icon={<SearchOutlined />} onClick={() => handleFetch(1)} style={{ width: "100%" }}>
              Tìm kiếm
            </Button>
          </Col>
        </Row>
      </Col>

      <Card bodyStyle={{ padding: 12 }}>
        {/* Bulk action bar */}
        <Flex alignItems="center" style={{ marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
          <Space>
            <Button
              type="primary"
              danger
              icon={<BellOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={handleBulkCompanyRemind}
            >
              Nhắc nhở đã chọn ({selectedRowKeys.length})
            </Button>
            <Button
              type="primary"
              icon={<BellOutlined />}
              onClick={handleRemindAllCompanies}
              disabled={loading}
            >
              Nhắc nhở tất cả
            </Button>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={handleExportSelected}
              style={{ background: "#217346", borderColor: "#217346" }}
            >
              Tải xuống đã chọn ({selectedRowKeys.length})
            </Button>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleExportAll}
              disabled={loading}
              style={{ background: "#217346", borderColor: "#217346" }}
            >
              Tải xuống tất cả
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button
                
                icon={<CloseOutlined />}
                onClick={() => clearSelectedRowKeys()}
              >
                Bỏ chọn tất cả
              </Button>
            )}
          </Space>
          <span style={{ fontSize: 13, color: "#888" }}>
            Tổng số: {dataPage?.totalCount || groupedCompanyList.length} nền tảng
          </span>
        </Flex>

        <Table<GroupedCompanyItem>
          dataSource={groupedCompanyList}
          rowKey="companyTaxCode"
          pagination={false}
          loading={loading}
          bordered
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          onRow={(record) => ({
            onClick: (e) => {
              // Tránh toggle expansion khi click vào checkbox
              const target = e.target as HTMLElement;
              if (target.closest('.ant-checkbox')) return;
              setExpandedKeys(expandedKeys.includes(record.companyTaxCode) ? [] : [record.companyTaxCode]);
            },
            style: { cursor: "pointer" }
          })}
          expandable={{
            expandedRowRender,
            expandedRowKeys: expandedKeys,
            expandIcon: () => null,
            expandIconColumnIndex: -1
          }}
          columns={[
            { title: "STT", width: 60, align: "center", render: (_, __, i) => pageSize * (pageIndex - 1) + i + 1 },
            {
              title: "Doanh nghiệp",
              dataIndex: "companyName",
              render: (v: string, record) => (
                <Space>
                  <TeamOutlined style={{ color: "#1890ff" }} />
                  <div>
                    <strong style={{ fontSize: 14 }}>{v}</strong>
                    <div style={{ fontSize: 12, color: "#888" }}>Mã số thuế: {record.companyTaxCode}</div>
                    {(record.companyEmail || record.companyPhone) && (
                      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                        {record.companyEmail && <span>Email: {record.companyEmail}</span>}
                        {record.companyEmail && record.companyPhone && <span> | </span>}
                        {record.companyPhone && <span>SĐT: {record.companyPhone}</span>}
                      </div>
                    )}
                  </div>
                </Space>
              )
            },
            {
              title: "Tình hình nộp báo cáo",
              width: 280,
              align: "center",
              render: (_, record) => {
                const isAllSubmitted = record.submittedCount === record.totalPlatforms;
                return (
                  <div>
                    <span style={{ marginRight: 8 }}>
                      Đã nộp: <strong>{record.submittedCount} / {record.totalPlatforms}</strong> nền tảng
                    </span>
                    {isAllSubmitted ? (
                      <Tag color="green">Hoàn thành</Tag>
                    ) : (
                      <Tag color="orange">Chưa hoàn thành</Tag>
                    )}
                  </div>
                );
              }
            },
            {
              title: "Thao tác",
              width: 140,
              align: "center",
              render: (_, record) => {
                const isAllSubmitted = record.submittedCount === record.totalPlatforms;
                return (
                  !isAllSubmitted ? (
                    <Button
                      type="primary"
                      danger
                      
                      icon={<BellOutlined />}
                      onClick={() => handleCompanyRemind(record)}
                    >
                      Nhắc nhở
                    </Button>
                  ) : (
                    <Tag color="green">Đã hoàn thành</Tag>
                  )
                );
              }
            }
          ]}
        />
        <Flex justifyContent="flex-end" style={{ marginTop: 16 }}>
          <Pagination total={dataPage?.totalCount || 0} current={pageIndex} pageSize={pageSize} showSizeChanger showTotal={(t, r) => `${r[0]}-${r[1]} trong ${t} nền tảng`} onChange={(p, s) => { setPageIndex(p); if (s !== pageSize) { setPageSize(s); handleFetch(p, s); } else { handleFetch(p); } }} />
        </Flex>
      </Card>

      {/* Modal Xem chi tiết tờ khai A4 đã điền (Read-Only) */}
      <Modal
        title={`Xem chi tiết báo cáo - Tháng ${thangBaoCao}/${namBaoCao}`}
        open={isOpenViewModal}
        onCancel={() => { setIsOpenViewModal(false); setSelectedTracking(null); }}
        footer={[
          <Button key="close" icon={<CloseOutlined />} onClick={() => setIsOpenViewModal(false)}>
            Đóng
          </Button>
        ]}
        width="90%"
        style={{ top: 30, maxWidth: 1400 }}
        bodyStyle={{ maxHeight: "calc(95vh - 120px)", overflow: "auto" }}
        destroyOnClose
      >
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 12, flexShrink: 0 }}>
            <div><strong>Doanh nghiệp:</strong> {selectedTracking?.companyName} (MST: {selectedTracking?.companyTaxCode})</div>
            {(selectedTracking?.companyEmail || selectedTracking?.companyPhone) && (
              <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>
                {selectedTracking?.companyEmail && <span><strong>Email:</strong> {selectedTracking.companyEmail}</span>}
                {selectedTracking?.companyEmail && selectedTracking?.companyPhone && <span> | </span>}
                {selectedTracking?.companyPhone && <span><strong>SĐT:</strong> {selectedTracking.companyPhone}</span>}
              </div>
            )}
            <div><strong>Nền tảng:</strong> {selectedTracking?.platformName} ({selectedTracking?.domain || "Ứng dụng di động"})</div>
          </div>
          <div style={{ flex: 1, padding: "30px 40px", overflowY: "auto", border: "1px solid #f0f0f0", borderRadius: "8px", background: "#ffffff" }}>
            {docxPreviewContent ? (
              <div className="docx-page-content" style={{ position: "relative" }}>
                {docxPreviewContent.style && <style>{docxPreviewContent.style}</style>}
                {parse(docxPreviewContent.body, replaceOptions)}
              </div>
            ) : (
              <Flex alignItems="center" justifyContent="center" style={{ height: "400px" }}>
                <span style={{ color: "#999" }}>Không tìm thấy mẫu thiết kế HTML.</span>
              </Flex>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default withAuthorization(Page, "");
