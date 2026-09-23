"use client";
import Flex from "@/components/shared-components/Flex";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { AppDispatch } from "@/store/store";
import { FileOutlined, FileWordOutlined, FilePdfOutlined, SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, message, Checkbox, Radio, Upload } from "antd";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import mauBaoCaoService from "@/services/mauBaoCao/mauBaoCao.service";
import platformManageService from "@/services/platformManage/platformManage.service";
import { MauBaoCaoDto, MauBaoCaoChiTietDto, SaveMauBaoCaoDataRequest } from "@/types/mauBaoCao";
import { PlatformManageType } from "@/types/platformManage/dto";
import parse, { DOMNode } from "html-react-parser";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";

const INPUT_TYPES = [
  { label: "Ô nhập văn bản ngắn (Input)", value: "Input" },
  { label: "Ô nhập văn bản dài (TextArea)", value: "TextArea" },
  { label: "Hộp chọn dropdown (Dropdown)", value: "Dropdown" },
  { label: "Hộp kiểm nhiều lựa chọn (Checkbox)", value: "Checkbox" },
  { label: "Nút chọn một lựa chọn (Radio)", value: "Radio" },
  { label: "File đính kèm (File)", value: "File" },
];

const KY_BAO_CAO = [
  { label: "Báo cáo Hàng tháng", value: "HANG_THANG" },
  { label: "Báo cáo Hàng quý", value: "HANG_QUY" },
  { label: "Báo cáo Hàng năm", value: "HANG_NAM" },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ label: `Tháng ${i + 1}`, value: i + 1 }));
const YEARS = Array.from({ length: 11 }, (_, i) => ({ label: `Năm ${2020 + i}`, value: 2020 + i }));

const Page: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [templateList, setTemplateList] = useState<MauBaoCaoDto[]>([]);
  const [platformList, setPlatformList] = useState<PlatformManageType[]>([]);

  // State bộ lọc báo cáo
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<MauBaoCaoDto | null>(null);
  const [companyId, setCompanyId] = useState<string>("");
  const [platformId, setPlatformId] = useState<string>("");
  const [thangBaoCao, setThangBaoCao] = useState<number>(dayjs().month() + 1);
  const [namBaoCao, setNamBaoCao] = useState<number>(dayjs().year());
  const [kyBaoCao, setKyBaoCao] = useState<string>("HANG_THANG");

  const [configList, setConfigList] = useState<MauBaoCaoChiTietDto[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // 1. Tải danh sách mẫu báo cáo và danh sách nền tảng khi vào trang
  const fetchData = async () => {
    try {
      const resTemplates = await mauBaoCaoService.getData({ pageIndex: 1, pageSize: 100 });
      if (resTemplates.status && resTemplates.data) {
        setTemplateList(resTemplates.data.items);
      }

      const resPlatforms = await platformManageService.getPlatformData({ pageIndex: 1, pageSize: 100 });
      if (resPlatforms.status && resPlatforms.data) {
        setPlatformList(resPlatforms.data.items);
      }
    } catch (err) {
      message.error("Lỗi khi tải danh sách mẫu báo cáo hoặc nền tảng");
    }
  };

  useEffect(() => {
    fetchData();
    // Tạo ngẫu nhiên 1 CompanyId dạng GUID để test
    setCompanyId(uuidv4());
  }, []);

  // 2. Load cấu hình keys và dữ liệu điền cũ khi các bộ lọc thay đổi
  const handleLoadTemplateData = useCallback(async (
    templateId: string,
    cId: string,
    pId: string,
    thang: number,
    nam: number
  ) => {
    if (!templateId || !cId || !pId) return;

    dispatch(setIsLoading(true));
    try {
      // Lấy chi tiết template (để có htmlContent)
      const resTemplate = await mauBaoCaoService.getById(templateId);
      if (resTemplate.status && resTemplate.data) {
        setSelectedTemplate(resTemplate.data);
      }

      // Lấy cấu hình các keys
      const resConfig = await mauBaoCaoService.getConfigByMauBaoCaoId(templateId);
      if (resConfig.status && resConfig.data) {
        setConfigList(resConfig.data);
      }

      // Lấy dữ liệu điền cũ từ MongoDB
      const resValues = await mauBaoCaoService.getDataValues(templateId, cId, pId, thang, nam);
      if (resValues.status && resValues.data) {
        setFormValues(resValues.data);
      } else {
        setFormValues({});
      }
    } catch (err) {
      message.error("Lỗi khi tải thông tin cấu hình hoặc dữ liệu cũ");
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    if (selectedTemplateId && companyId && platformId) {
      handleLoadTemplateData(selectedTemplateId, companyId, platformId, thangBaoCao, namBaoCao);
    } else {
      setSelectedTemplate(null);
      setConfigList([]);
      setFormValues({});
    }
  }, [selectedTemplateId, companyId, platformId, thangBaoCao, namBaoCao, handleLoadTemplateData]);

  // Cập nhật giá trị một key khi điền form
  const handleValueChange = (keyName: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [keyName]: value
    }));
  };

  // Hành động Lưu dữ liệu lên MongoDB
  const handleSaveData = async () => {
    if (!selectedTemplateId) {
      message.error("Vui lòng chọn mẫu báo cáo");
      return;
    }
    if (!companyId) {
      message.error("Vui lòng nhập hoặc sinh mã Doanh nghiệp Id");
      return;
    }
    if (!platformId) {
      message.error("Vui lòng chọn nền tảng TMĐT");
      return;
    }

    dispatch(setIsLoading(true));
    try {
      const payload: SaveMauBaoCaoDataRequest = {
        mauBaoCaoId: selectedTemplateId,
        companyId: companyId,
        platformId: platformId,
        thangBaoCao: thangBaoCao,
        namBaoCao: namBaoCao,
        kyBaoCao: kyBaoCao,
        values: formValues
      };

      const res = await mauBaoCaoService.saveData(payload);
      if (res.status) {
        message.success("Lưu dữ liệu điền vào MongoDB thành công!");
      } else {
        message.error(res.message || "Lưu dữ liệu thất bại");
      }
    } catch (err) {
      message.error("Lỗi kết nối lưu dữ liệu");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  // Hành động Xuất file Word (.docx)
  const handleExportDocx = async () => {
    if (!selectedTemplateId || !companyId || !platformId) return;

    dispatch(setIsLoading(true));
    try {
      const payload: SaveMauBaoCaoDataRequest = {
        mauBaoCaoId: selectedTemplateId,
        companyId: companyId,
        platformId: platformId,
        thangBaoCao: thangBaoCao,
        namBaoCao: namBaoCao,
        kyBaoCao: kyBaoCao,
        values: formValues
      };

      const res = await mauBaoCaoService.exportDocx(payload);
      if (res.status && res.data) {
        message.success("Xuất file Word thành công!");
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

  // Hành động Xuất file PDF (.pdf)
  const handleExportPdf = async () => {
    if (!selectedTemplateId || !companyId || !platformId) return;

    dispatch(setIsLoading(true));
    try {
      const payload: SaveMauBaoCaoDataRequest = {
        mauBaoCaoId: selectedTemplateId,
        companyId: companyId,
        platformId: platformId,
        thangBaoCao: thangBaoCao,
        namBaoCao: namBaoCao,
        kyBaoCao: kyBaoCao,
        values: formValues
      };

      const res = await mauBaoCaoService.exportPdf(payload);
      if (res.status && res.data) {
        message.success("Xuất file PDF thành công!");
        window.open(`${staticUrl}/${res.data.replace(/^\//, '')}`, "_blank");
      } else {
        message.error(res.message || "Xuất file PDF thất bại");
      }
    } catch (err) {
      message.error("Lỗi khi kết nối xuất file PDF");
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

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" style={{ marginBottom: 10 }}><AutoBreadcrumb /></Flex>

      <Card title="Cấu hình thông tin Kỳ khai báo & Test Form" bodyStyle={{ padding: 16 }} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col md={8}>
            <Form.Item label="Chọn mẫu báo cáo" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Chọn một mẫu báo cáo"
                options={templateList.map(t => ({ label: `${t.maMauBaoCao} - ${t.tenMauBaoCao}`, value: t.id }))}
                onChange={(val) => setSelectedTemplateId(val)}
                value={selectedTemplateId || undefined}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col md={8}>
            <Form.Item label="Chọn Nền tảng TMĐT cần báo cáo" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Chọn nền tảng"
                options={platformList.map(p => ({ label: `${p.name} (${p.domain || "App"})`, value: p.id }))}
                onChange={(val) => setSelectedTemplateId(prev => {
                  setPlatformId(val);
                  return prev;
                })}
                value={platformId || undefined}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col md={8}>
            <Form.Item label="Mã Doanh nghiệp Id (CompanyId)" style={{ marginBottom: 0 }}>
              <Input
                value={companyId}
                placeholder="Mã GUID doanh nghiệp"
                onChange={(e) => setCompanyId(e.target.value)}
                addonAfter={
                  <Button type="link"  icon={<ReloadOutlined />} onClick={() => setCompanyId(uuidv4())} style={{ padding: 0, height: "auto" }}>
                    Sinh mã
                  </Button>
                }
              />
            </Form.Item>
          </Col>

          <Col md={6}>
            <Form.Item label="Kỳ báo cáo" style={{ marginBottom: 0 }}>
              <Select options={KY_BAO_CAO} value={kyBaoCao} onChange={(val) => setKyBaoCao(val)} />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item label="Tháng báo cáo" style={{ marginBottom: 0 }}>
              <Select options={MONTHS} value={thangBaoCao} onChange={(val) => setThangBaoCao(val)} />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item label="Năm báo cáo" style={{ marginBottom: 0 }}>
              <Select options={YEARS} value={namBaoCao} onChange={(val) => setNamBaoCao(val)} />
            </Form.Item>
          </Col>
          <Col md={6} style={{ display: "flex", alignItems: "end" }}>
            <Button type="primary" style={{ width: "100%" }} icon={<SaveOutlined />} onClick={handleSaveData} disabled={!selectedTemplateId || !platformId}>
              Lưu dữ liệu
            </Button>
          </Col>
        </Row>
      </Card>

      {selectedTemplate ? (
        <Card
          title={
            <Space>
              <FileOutlined />
              <span>Giao diện điền Form trực quan (A4)</span>
            </Space>
          }
          extra={
            <Space>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveData}>
                Lưu vào MongoDB
              </Button>
              <Button type="default" style={{ color: "#237804", borderColor: "#b7eb8f" }} icon={<FileWordOutlined />} onClick={handleExportDocx}>
                Xuất file Word (.docx)
              </Button>
              <Button type="primary" danger icon={<FilePdfOutlined />} onClick={handleExportPdf}>
                Xuất file PDF (.pdf)
              </Button>
            </Space>
          }
        >
          <div style={{ padding: "30px 40px", border: "1px solid #f0f0f0", borderRadius: "8px", background: "#ffffff", maxWidth: "900px", margin: "0 auto" }}>
            {docxPreviewContent ? (
              <div className="docx-page-content" style={{ position: "relative" }}>
                {docxPreviewContent.style && <style>{docxPreviewContent.style}</style>}
                {parse(docxPreviewContent.body, replaceOptions)}
              </div>
            ) : (
              <Flex alignItems="center" justifyContent="center" style={{ height: "400px" }}>
                <span style={{ color: "#999" }}>Mẫu báo cáo chưa được phân tích HTML cấu trúc.</span>
              </Flex>
            )}
          </div>
        </Card>
      ) : (
        <Card style={{ textAlign: "center", padding: "40px 0" }}>
          <span style={{ color: "#999", fontSize: 16 }}>Vui lòng chọn Mẫu báo cáo và Nền tảng TMĐT phía trên để bắt đầu điền form thử nghiệm.</span>
        </Card>
      )}
    </>
  );
};

export default withAuthorization(Page, "");
