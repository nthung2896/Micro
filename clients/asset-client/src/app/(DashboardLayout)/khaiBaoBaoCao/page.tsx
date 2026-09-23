"use client";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageInfo } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { FileOutlined, FileWordOutlined, FilePdfOutlined, SaveOutlined, FormOutlined, InfoCircleOutlined, RightOutlined, SendOutlined, ClusterOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Table, Tag, Modal, Checkbox, Radio, message, DatePicker, List, Tabs } from "antd";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import mauBaoCaoService from "@/services/mauBaoCao/mauBaoCao.service";
import platformManageService from "@/services/platformManage/platformManage.service";
import companyInfoService from "@/services/companyInfo/companyInfo.service";
import authenticationContractService from "@/services/authenticationContract/authenticationContract.service";
import { MauBaoCaoDto, MauBaoCaoChiTietDto, SaveMauBaoCaoDataRequest } from "@/types/mauBaoCao";
import PlatformManageTypeConstant from "@/constants/PlatformManageTypeConstant";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import { PlatformManageType } from "@/types/platformManage/dto";
import { CompanyInfoType } from "@/types/companyInfo/dto";
import { AuthenticationContractType } from "@/types/authenticationContract/dto";
import parse, { DOMNode } from "html-react-parser";
import dayjs from "dayjs";

const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";
const YEARS = Array.from({ length: 6 }, (_, i) => ({ label: `Năm ${dayjs().year() - 3 + i}`, value: dayjs().year() - 3 + i }));

interface TemplateStatusItem {
  templateId: string;
  maMauBaoCao: string;
  tenMauBaoCao: string;
  platformId?: string;
  contractId?: string;
  platformName: string;
  platformDomain: string;
  platformStatus: number;
  status: string; // DRAFT, SUBMITTED, NOT_SUBMITTED
  isViewed: boolean;
  values?: Record<string, string>;
  phanLoai?: string; // NEN_TANG, CHUNG_THUC
}

interface KyBaoCaoItem {
  period: number;
  periodName: string;
  kyBaoCao: string; // THANG, QUY, NAM
  submittedCount: number;
  totalTemplates: number;
  templatesStatus: TemplateStatusItem[];
}

const Page: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentCompany, setCurrentCompany] = useState<CompanyInfoType | null>(null);
  const [platformList, setPlatformList] = useState<PlatformManageType[]>([]);
  const [templateList, setTemplateList] = useState<MauBaoCaoDto[]>([]);

  // Tabs
  const [activeTab, setActiveTab] = useState<string>("NEN_TANG");

  // Bộ lọc - NEN_TANG
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformManageType | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

  // Bộ lọc - CHUNG_THUC
  const [contractList, setContractList] = useState<AuthenticationContractType[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [selectedContract, setSelectedContract] = useState<AuthenticationContractType | null>(null);

  // Trạng thái các kỳ
  const [kyBaoCaoData, setKyBaoCaoData] = useState<KyBaoCaoItem[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // Modal Form Khai Báo (Tờ A4)
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [activePeriod, setActivePeriod] = useState<number>(1);
  const [activeKyBaoCao, setActiveKyBaoCao] = useState<string>("THANG");
  const [selectedTemplate, setSelectedTemplate] = useState<MauBaoCaoDto | null>(null);
  const [activePlatformId, setActivePlatformId] = useState<string>("");
  const [configList, setConfigList] = useState<MauBaoCaoChiTietDto[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const handleValueChange = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  };

  // 1. Tải thông tin Doanh nghiệp, Nền tảng & Tất cả mẫu báo cáo khi vào trang
  const fetchInitialData = async () => {
    dispatch(setIsLoading(true));
    try {
      const resCompany = await companyInfoService.getByCurrentUser();
      if (resCompany.status && resCompany.data) {
        setCurrentCompany(resCompany.data);

        // Lấy toàn bộ mẫu báo cáo đang hoạt động để làm dữ liệu nền
        const resTemplates = await mauBaoCaoService.getData({ pageIndex: 1, pageSize: 100 });
        if (resTemplates.status && resTemplates.data) {
          setTemplateList(resTemplates.data.items);
        }

        // Lấy danh sách nền tảng thuộc doanh nghiệp (đã được backend lọc theo session)
        const resPlatforms = await platformManageService.getPlatformData({ pageIndex: 1, pageSize: 100 });
        if (resPlatforms.status && resPlatforms.data) {
          setPlatformList(resPlatforms.data.items);
          setSelectedPlatformId("");
          setSelectedPlatform(null);
        }

        // Lấy danh sách hợp đồng chứng thực HĐĐT
        try {
          const resContracts = await authenticationContractService.getData({
            pageIndex: 1,
            pageSize: 100,
            companyTaxCode: resCompany.data.taxCode,
          });
          if (resContracts.status && resContracts.data) {
            setContractList(resContracts.data.items || []);
          }
        } catch (e) {
          // Không lỗi nếu không load được contracts
        }
      }
    } catch (err) {
      message.error("Lỗi khi tải thông tin doanh nghiệp");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // 2. Tải thông tin trạng thái nộp các kỳ báo cáo
  const load12MonthsStatus = useCallback(async () => {
    if (!currentCompany?.id || !selectedYear) return;

    setLoadingTable(true);
    try {
      const searchParams: any = {
        companyId: currentCompany.id,
        year: selectedYear,
        phanLoai: activeTab,
      };
      if (activeTab === "NEN_TANG") {
        searchParams.platformId = selectedPlatformId || undefined;
      } else {
        searchParams.contractId = selectedContractId || undefined;
      }
      const res = await mauBaoCaoService.getDanhSachKhaiBaoDoanhNghiep(searchParams);

      if (res.status && res.data) {
        setKyBaoCaoData(res.data);

        // Tự động mở rộng kỳ đầu tiên
        if (res.data.length > 0) {
          setExpandedKeys([`${res.data[0].kyBaoCao}-${res.data[0].period}`]);
        }
      } else {
        setKyBaoCaoData([]);
      }
    } catch (err) {
      message.error("Lỗi khi tải danh sách báo cáo");
    } finally {
      setLoadingTable(false);
    }
  }, [currentCompany, selectedPlatformId, selectedContractId, selectedYear, activeTab]);

  useEffect(() => {
    if (currentCompany && selectedYear && templateList.length > 0) {
      load12MonthsStatus();
    } else {
      setKyBaoCaoData([]);
    }
  }, [currentCompany, selectedPlatformId, selectedYear, templateList, platformList, load12MonthsStatus]);

  const handlePlatformChange = (id: string) => {
    setSelectedPlatformId(id);
    const plat = platformList.find(x => x.id === id);
    setSelectedPlatform(plat || null);
  };

  const handleContractChange = (id: string) => {
    setSelectedContractId(id);
    const contract = contractList.find(x => x.id === id);
    setSelectedContract(contract || null);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setKyBaoCaoData([]);
  };

  // Mở Modal khai báo của một Mẫu báo cáo cụ thể trong 1 kỳ
  const handleOpenForm = async (period: number, kyBaoCao: string, periodName: string, templateItem: TemplateStatusItem) => {
    if (!currentCompany) return;

    const isChungThuc = templateItem.phanLoai === "CHUNG_THUC";

    dispatch(setIsLoading(true));
    try {
      setActivePeriod(period);
      setActiveKyBaoCao(kyBaoCao);
      setActivePlatformId(templateItem.platformId || templateItem.contractId || "");
      setIsReadOnly(templateItem.status === "SUBMITTED" && templateItem.isViewed);

      // 1. Tải chi tiết mẫu báo cáo (để có htmlContent)
      const resTemplate = await mauBaoCaoService.getById(templateItem.templateId);
      if (!resTemplate.status || !resTemplate.data) {
        throw new Error("Không thể tải chi tiết mẫu báo cáo");
      }
      setSelectedTemplate(resTemplate.data);

      // 2. Tải cấu hình keys của mẫu báo cáo
      const resConfig = await mauBaoCaoService.getConfigByMauBaoCaoId(templateItem.templateId);
      if (resConfig.status && resConfig.data) {
        setConfigList(resConfig.data);
      }

      // 3. Nạp dữ liệu cũ
      if (templateItem.values) {
        setFormValues(templateItem.values);
      } else {
        // Tự động gán mặc định thông tin Doanh nghiệp
        const defaultValues: Record<string, string> = {
          "{{TenDoanhNghiep}}": currentCompany?.name || "",
          "{{MaSoThue}}": currentCompany?.taxCode || "",
          "{{DiaChiDoanhNghiep}}": currentCompany?.address || "",
        };
        if (isChungThuc) {
          const contract = contractList.find(x => x.id === templateItem.contractId);
          defaultValues["{{TenHopDong}}"] = contract?.name || "";
          defaultValues["{{TenMien}}"] = contract?.domain || "";
        } else {
          const platform = platformList.find(x => x.id === templateItem.platformId);
          defaultValues["{{TenNenTang}}"] = platform?.name || "";
          defaultValues["{{TenMien}}"] = platform?.domain || "";
        }
        setFormValues(defaultValues);
      }

      setIsOpenFormModal(true);
    } catch (err: any) {
      message.error(err.message || "Lỗi khi thiết lập biểu mẫu khai báo");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  // Submit gửi báo cáo lên MongoDB (status: "DRAFT" hoặc "SUBMITTED")
  const handleSaveReport = async (status: "DRAFT" | "SUBMITTED") => {
    if (!selectedTemplate || !currentCompany || !activePlatformId) return;

    const isChungThuc = activeTab === "CHUNG_THUC";
    const periodLabel = activeKyBaoCao === "QUY" ? `Quý ${activePeriod}` : activeKyBaoCao === "NAM" ? `Năm ${selectedYear}` : `Tháng ${activePeriod}`;

    dispatch(setIsLoading(true));
    try {
      // Tính tháng lưu MongoDB: QUY lưu tháng đầu quý, NAM lưu tháng 1
      const thangSave = activeKyBaoCao === "QUY" ? (activePeriod - 1) * 3 + 1 : activeKyBaoCao === "NAM" ? 1 : activePeriod;
      const payload: SaveMauBaoCaoDataRequest = {
        mauBaoCaoId: selectedTemplate.id || "",
        companyId: currentCompany.id,
        platformId: isChungThuc ? null : activePlatformId,
        contractId: isChungThuc ? activePlatformId : null,
        thangBaoCao: thangSave,
        namBaoCao: selectedYear,
        kyBaoCao: activeKyBaoCao === "NAM" ? "HANG_NAM" : activeKyBaoCao === "QUY" ? "HANG_QUY" : "HANG_THANG",
        status: status,
        values: formValues
      };

      const res = await mauBaoCaoService.saveData(payload);
      if (res.status) {
        message.success(
          status === "SUBMITTED"
            ? `Gửi báo cáo ${periodLabel}/${selectedYear} thành công!`
            : `Đã lưu nháp báo cáo ${periodLabel}/${selectedYear} thành công!`
        );
        setIsOpenFormModal(false);
        load12MonthsStatus();
      } else {
        message.error(res.message || "Lưu báo cáo thất bại");
      }
    } catch (err) {
      message.error("Lỗi khi kết nối gửi báo cáo");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  // Xuất Word
  const handleExportDocx = async (month: number, templateItem: TemplateStatusItem) => {
    if (!currentCompany || !templateItem.platformId) return;
    dispatch(setIsLoading(true));
    try {
      const payload: SaveMauBaoCaoDataRequest = {
        mauBaoCaoId: templateItem.templateId,
        companyId: currentCompany.id,
        platformId: templateItem.platformId,
        thangBaoCao: month,
        namBaoCao: selectedYear,
        status: "SUBMITTED",
        values: templateItem.values || {}
      };
      const res = await mauBaoCaoService.exportDocx(payload);
      if (res.status && res.data) {
        window.open(`${staticUrl}/${res.data.replace(/^\//, '')}`, "_blank");
      } else {
        message.error(res.message || "Xuất file Word thất bại");
      }
    } catch (err) {
      message.error("Lỗi kết nối xuất file Word");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  // Xuất PDF
  const handleExportPdf = async (month: number, templateItem: TemplateStatusItem) => {
    if (!currentCompany || !templateItem.platformId) return;
    dispatch(setIsLoading(true));
    try {
      const payload: SaveMauBaoCaoDataRequest = {
        mauBaoCaoId: templateItem.templateId,
        companyId: currentCompany.id,
        platformId: templateItem.platformId,
        thangBaoCao: month,
        namBaoCao: selectedYear,
        status: "SUBMITTED",
        values: templateItem.values || {}
      };
      const res = await mauBaoCaoService.exportPdf(payload);
      if (res.status && res.data) {
        window.open(`${staticUrl}/${res.data.replace(/^\//, '')}`, "_blank");
      } else {
        message.error(res.message || "Xuất PDF thất bại");
      }
    } catch (err) {
      message.error("Lỗi kết nối xuất PDF");
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

  // Hàm render ra các ô nhập liệu tương ứng trên tờ A4
  const renderInputOnA4 = (key: string, cfg?: MauBaoCaoChiTietDto) => {
    const cleanKey = `{{${key}}}`;
    const currentValue = formValues[cleanKey] || "";

    // Nếu ở chế độ Chỉ đọc (Chuyên viên đã xem)
    if (isReadOnly) {
      return (
        <span style={{ color: "#096dd9", fontWeight: "bold", fontStyle: "italic", borderBottom: "1px solid #d9d9d9", padding: "0 4px", minWidth: "40px", display: "inline-block" }}>
          {currentValue || "........"}
        </span>
      );
    }

    if (!cfg) {
      return (
        <Input
          value={currentValue}
          placeholder={`[${key}]`}
          style={{ width: 150, margin: "0 4px", borderBottom: "1px solid #1890ff", borderRadius: 0 }}
          bordered={false}
          onChange={(e) => handleValueChange(cleanKey, e.target.value)}
        />
      );
    }

    const placeholder = cfg.displayName || key;
    const isRequired = cfg.isRequired;
    const borderStyle = isRequired ? "1px solid red" : "1px solid #d9d9d9";

    const optionsList = cfg.options
      ? cfg.options.split(",").map(o => ({ label: o.trim(), value: o.trim() }))
      : [];

    switch (cfg.inputType) {
      case "TextArea":
        return (
          <div style={{ margin: "8px 0" }}>
            <Input.TextArea
              value={currentValue}
              placeholder={placeholder}
              rows={3}
              style={{ border: borderStyle, width: "100%" }}
              onChange={(e) => handleValueChange(cleanKey, e.target.value)}
            />
          </div>
        );

      case "Dropdown":
        return (
          <Select
            value={currentValue || undefined}
            placeholder={placeholder}
            options={optionsList}
            allowClear
            style={{ width: 180, margin: "0 4px" }}
            onChange={(val) => handleValueChange(cleanKey, val || "")}
          />
        );

      case "Checkbox":
        const checkedValues = currentValue ? currentValue.split(",") : [];
        return (
          <div style={{ display: "inline-block", padding: "0 8px", background: "#f9f9f9", borderRadius: 4, border: "1px dashed #d9d9d9" }}>
            <Checkbox.Group
              options={optionsList}
              value={checkedValues}
              onChange={(checked) => handleValueChange(cleanKey, checked.join(","))}
            />
          </div>
        );

      case "Radio":
        return (
          <div style={{ display: "inline-block", padding: "0 8px", background: "#f9f9f9", borderRadius: 4, border: "1px dashed #d9d9d9" }}>
            <Radio.Group
              options={optionsList}
              value={currentValue}
              onChange={(e) => handleValueChange(cleanKey, e.target.value)}
            />
          </div>
        );

      case "File":
        return (
          <div style={{ display: "inline-block", margin: "0 4px" }}>
            <Input
              value={currentValue}
              placeholder="Tên file đính kèm"
              style={{ width: 180 }}
              onChange={(e) => handleValueChange(cleanKey, e.target.value)}
            />
          </div>
        );

      case "Number":
        return (
          <InputNumber
            value={currentValue ? Number(currentValue) : null}
            min={cfg.minValue ?? undefined}
            max={cfg.maxValue ?? undefined}
            placeholder={placeholder}
            style={{ width: 160, margin: "0 4px", borderBottom: "1px solid #1890ff", borderRadius: 0 }}
            bordered={false}
            onChange={(val) => handleValueChange(cleanKey, val?.toString() || "")}
          />
        );

      case "Input":
      default:
        return (
          <Input
            value={currentValue}
            placeholder={placeholder}
            style={{ width: 160, margin: "0 4px", borderBottom: borderStyle, borderRadius: 0 }}
            bordered={false}
            onChange={(e) => handleValueChange(cleanKey, e.target.value)}
          />
        );
    }
  };

  // Bộ lọc parser thay thế [[key]] thành Form Items trên tờ A4
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

                const cfg = configList.find(
                  x => x.keyName.trim() === cleanKey ||
                  x.keyName.trim() === key ||
                  x.keyName.trim().replace(/\{|\}/g, "") === key
                );

                return <span key={index}>{renderInputOnA4(key, cfg)}</span>;
              }
              return part || null;
            })}
          </>
        );
      }
    },
  };

  const renderStatusTag = (status: string) => {
    if (status === "SUBMITTED") {
      return <Tag color="green">Đã nộp</Tag>;
    }
    if (status === "DRAFT") {
      return <Tag color="gold">Đang nháp</Tag>;
    }
    return <Tag color="red">Chưa nộp</Tag>;
  };

  // Render chi tiết các biểu mẫu của kỳ đó dạng danh sách trực quan
  const expandedRowRender = (record: KyBaoCaoItem) => {
    return (
      <div style={{ padding: "4px 16px", background: "#fafafa", borderRadius: "0 0 8px 8px" }}>
        <List
          dataSource={record.templatesStatus}
          rowKey={(item) => `${item.templateId}-${item.platformId || item.contractId}`}
          size="small"
          renderItem={(item) => (
            <List.Item
              key={`${item.templateId}-${item.platformId || item.contractId}`}
              style={{ padding: "6px 0" }}
              actions={[
                <Space key="actions">
                  {item.status === "SUBMITTED" && item.isViewed ? (
                    <Button type="default"  icon={<FileOutlined />} onClick={() => handleOpenForm(record.period, record.kyBaoCao, record.periodName, item)}>
                      Xem chi tiết
                    </Button>
                  ) : (
                    <Button type="primary"  icon={<FormOutlined />} onClick={() => handleOpenForm(record.period, record.kyBaoCao, record.periodName, item)}>
                      {item.status === "SUBMITTED" ? "Sửa báo cáo" : item.status === "DRAFT" ? "Khai báo tiếp" : "Khai báo"}
                    </Button>
                  )}
                </Space>
              ]}
            >
              <List.Item.Meta
                avatar={<FileOutlined style={{ color: "#1890ff", fontSize: 16, marginTop: 4 }} />}
                title={
                  <div>
                    <Space size="middle">
                      <Tag color="cyan">{item.maMauBaoCao}</Tag>
                      <span style={{ fontWeight: 500 }}>{item.tenMauBaoCao}</span>
                      <span style={{ fontSize: 13, color: "#888" }}>| Trạng thái:</span>
                      {renderStatusTag(item.status)}
                    </Space>
                    <div style={{ fontSize: 13, color: "#555", marginTop: 4, marginLeft: 2 }}>
                      {item.phanLoai === "CHUNG_THUC" ? (
                        <>Hợp đồng chứng thực: <span style={{ fontWeight: 500 }}>{item.platformName} {item.platformDomain ? `(${item.platformDomain})` : ""}</span></>
                      ) : (
                        <>Nền tảng đáp ứng: <span style={{ fontWeight: 500 }}>{item.platformName} {item.platformDomain ? `(${item.platformDomain})` : "(Ứng dụng)"}</span></>
                      )}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );
  };

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" style={{ marginBottom: 10 }}><AutoBreadcrumb /></Flex>

      <Tabs activeKey={activeTab} onChange={handleTabChange} style={{ marginBottom: 0 }} items={[
        {
          key: "NEN_TANG",
          label: <span><ClusterOutlined /> Nền tảng TMĐT</span>,
          children: (
            <Card bodyStyle={{ padding: 16 }} style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col md={12}>
                  <Form.Item label="Chọn nền tảng TMĐT" style={{ marginBottom: 0 }}>
                    <Select
                      allowClear
                      placeholder="--- Tất cả nền tảng ---"
                      options={[
                        { label: "--- Tất cả nền tảng ---", value: "" },
                        ...platformList.map(p => ({ label: `${p.name} (${p.domain || "Ứng dụng"})`, value: p.id }))
                      ]}
                      onChange={handlePlatformChange}
                      value={selectedPlatformId || undefined}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col md={6}>
                  <Form.Item label="Năm báo cáo" style={{ marginBottom: 0 }}>
                    <DatePicker
                      picker="year"
                      placeholder="Chọn năm"
                      value={selectedYear ? dayjs().year(selectedYear) : null}
                      onChange={(date) => { if (date) setSelectedYear(date.year()); }}
                      disabledDate={(current) => current && current.year() > dayjs().year()}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col md={6} style={{ display: "flex", alignItems: "end" }}>
                  <div style={{ color: "#888", fontSize: 12, paddingBottom: 6 }}>
                    <InfoCircleOutlined /> Doanh nghiệp: <strong>{currentCompany?.name}</strong>
                  </div>
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
              <Row gutter={16}>
                <Col md={12}>
                  <Form.Item label="Chọn hợp đồng chứng thực" style={{ marginBottom: 0 }}>
                    <Select
                      allowClear
                      placeholder="--- Tất cả hợp đồng ---"
                      options={[
                        { label: "--- Tất cả hợp đồng ---", value: "" },
                        ...contractList.map(c => ({ label: `${c.name} (${c.domain || "Không có domain"})`, value: c.id }))
                      ]}
                      onChange={handleContractChange}
                      value={selectedContractId || undefined}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col md={6}>
                  <Form.Item label="Năm báo cáo" style={{ marginBottom: 0 }}>
                    <DatePicker
                      picker="year"
                      placeholder="Chọn năm"
                      value={selectedYear ? dayjs().year(selectedYear) : null}
                      onChange={(date) => { if (date) setSelectedYear(date.year()); }}
                      disabledDate={(current) => current && current.year() > dayjs().year()}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col md={6} style={{ display: "flex", alignItems: "end" }}>
                  <div style={{ color: "#888", fontSize: 12, paddingBottom: 6 }}>
                    <InfoCircleOutlined /> Doanh nghiệp: <strong>{currentCompany?.name}</strong>
                  </div>
                </Col>
              </Row>
            </Card>
          )
        }
      ]} />

      {/* Render 3 section riêng cho Tháng, Quý, Năm */}
      {["THANG", "QUY", "NAM"].map(ky => {
        const kyData = kyBaoCaoData.filter(d => d.kyBaoCao === ky);
        if (kyData.length === 0) return null;
        const kyLabel = ky === "THANG" ? "Tháng" : ky === "QUY" ? "Quý" : "Năm";
        const kyColor = ky === "THANG" ? "blue" : ky === "QUY" ? "green" : "orange";
        return (
          <Card
            key={ky}
            title={<span style={{ color: kyColor }}>Báo cáo {kyLabel} - Năm {selectedYear}</span>}
            bodyStyle={{ padding: 12 }}
            style={{ marginBottom: 16 }}
          >
            <Table<KyBaoCaoItem>
              dataSource={kyData}
              rowKey={(r) => `${r.kyBaoCao}-${r.period}`}
              pagination={false}
              loading={loadingTable}
              bordered
              onRow={(record) => ({
                onClick: () => {
                  const key = `${record.kyBaoCao}-${record.period}`;
                  setExpandedKeys(expandedKeys.includes(key) ? [] : [key]);
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
                { title: "STT", width: 60, align: "center", render: (_, __, i) => i + 1 },
                { title: "Kỳ báo cáo", dataIndex: "periodName" },
                {
                  title: "Tiến độ nộp trong kỳ",
                  width: 300,
                  align: "center",
                  render: (_, record) => {
                    const isAllSubmitted = record.submittedCount === record.totalTemplates && record.totalTemplates > 0;
                    return (
                      <div>
                        <span style={{ marginRight: 8 }}>
                          Đã nộp: <strong>{record.submittedCount} / {record.totalTemplates}</strong> biểu mẫu
                        </span>
                        {isAllSubmitted ? (
                          <Tag color="green">Hoàn thành</Tag>
                        ) : (
                          <Tag color="orange">Chưa hoàn thành</Tag>
                        )}
                      </div>
                    );
                  }
                }
              ]}
            />
          </Card>
        );
      })}

      {/* Modal Form Khai Báo (Tờ A4) */}
      <Modal
        title={`Khai báo dữ liệu - Mẫu: ${selectedTemplate?.maMauBaoCao} (${activeKyBaoCao === "QUY" ? `Quý ${activePeriod}` : activeKyBaoCao === "NAM" ? `Năm ${selectedYear}` : `Tháng ${activePeriod}`}/${selectedYear})`}
        open={isOpenFormModal}
        onCancel={() => setIsOpenFormModal(false)}
        footer={isReadOnly ? [
          <Button key="close" type="primary" onClick={() => setIsOpenFormModal(false)}>
            Đóng
          </Button>
        ] : [
          <Button key="close" onClick={() => setIsOpenFormModal(false)}>
            Hủy
          </Button>,
          <Button key="draft" type="default" icon={<SaveOutlined />} onClick={() => handleSaveReport("DRAFT")}>
            Lưu nháp
          </Button>,
          <Button key="submit" type="primary" icon={<SendOutlined />} onClick={() => handleSaveReport("SUBMITTED")}>
            Gửi báo cáo
          </Button>
        ]}
        width="90%"
        style={{ top: 30, maxWidth: 1400 }}
        bodyStyle={{ maxHeight: "calc(95vh - 120px)", overflow: "auto" }}
        destroyOnClose
      >
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 12, flexShrink: 0 }}>
            <div><strong>Đơn vị khai báo:</strong> {currentCompany?.name} (MST: {currentCompany?.taxCode})</div>
            {activeTab === "CHUNG_THUC" ? (
              <div><strong>Hợp đồng chứng thực:</strong> {selectedContract?.name} ({selectedContract?.domain || "Không có domain"})</div>
            ) : (
              <div><strong>Nền tảng báo cáo:</strong> {selectedPlatform?.name} ({selectedPlatform?.domain || "Ứng dụng"})</div>
            )}
          </div>
          <div style={{ flex: 1, padding: "30px 40px", overflowY: "auto", border: "1px solid #f0f0f0", borderRadius: "8px", background: "#ffffff" }}>
          {docxPreviewContent ? (
            <div className="docx-page-content" style={{ position: "relative" }}>
              {docxPreviewContent.style && <style>{docxPreviewContent.style}</style>}
              {parse(docxPreviewContent.body, replaceOptions)}
            </div>
          ) : (
            <Flex alignItems="center" justifyContent="center" style={{ height: "400px" }}>
              <span style={{ color: "#999" }}>Mẫu báo cáo chưa được cấu hình HTML.</span>
            </Flex>
          )}
        </div>
        </div>
      </Modal>
    </>
  );
};

export default withAuthorization(Page, "");
