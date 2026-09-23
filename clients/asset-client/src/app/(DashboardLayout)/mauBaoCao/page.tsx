"use client";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageInfo } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { DeleteOutlined, DownOutlined, EditOutlined, PlusCircleOutlined, SearchOutlined, UploadOutlined, FileOutlined, SettingOutlined, BorderOutlined, FileTextOutlined, UnorderedListOutlined, CheckSquareOutlined, CheckCircleOutlined, PaperClipOutlined, NumberOutlined } from "@ant-design/icons";
import { Button, Card, Col, Dropdown, Form, Input, InputNumber, MenuProps, Modal, Pagination, Popconfirm, Row, Select, Space, Table, TableColumnsType, Tag, Upload, message, Switch } from "antd";
import type { UploadFile } from "antd";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import mauBaoCaoService from "@/services/mauBaoCao/mauBaoCao.service";
import { MauBaoCaoDto, MauBaoCaoSearch, MauBaoCaoCreateRequest, MauBaoCaoChiTietDto } from "@/types/mauBaoCao";
import PlatformManageTypeConstant from "@/constants/PlatformManageTypeConstant";
import PlatformTypeConstant from "@/constants/PlatformTypeConstant";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import ConstractStatusConstant from "@/constants/ConstractStatusConstant";
import axios from "axios";
import parse, { DOMNode } from "html-react-parser";

const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";

const INPUT_TYPES = [
  { label: "Ô nhập văn bản ngắn (Input)", value: "Input" },
  { label: "Ô nhập văn bản dài (TextArea)", value: "TextArea" },
  { label: "Ô nhập số (Number)", value: "Number" },
  { label: "Hộp chọn dropdown (Dropdown)", value: "Dropdown" },
  { label: "Hộp kiểm nhiều lựa chọn (Checkbox)", value: "Checkbox" },
  { label: "Nút chọn một lựa chọn (Radio)", value: "Radio" },
  { label: "File đính kèm (File)", value: "File" },
];

const Page: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [dataList, setDataList] = useState<MauBaoCaoDto[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [searchValues, setSearchValues] = useState<MauBaoCaoSearch | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [localLoading, setLocalLoading] = useState({ saveConfig: false, saveKey: false });
  const [currentItem, setCurrentItem] = useState<MauBaoCaoDto | undefined>();
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);
  const [form] = Form.useForm<MauBaoCaoCreateRequest>();
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [searchForm] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [filePath, setFilePath] = useState<string>("");

  // Cấu hình keys chi tiết (Tờ A4)
  const [isOpenConfigModal, setIsOpenConfigModal] = useState(false);
  const [configList, setConfigList] = useState<MauBaoCaoChiTietDto[]>([]);
  const [selectedMauBaoCaoId, setSelectedMauBaoCaoId] = useState<string>("");
  const [selectedMauBaoCao, setSelectedMauBaoCao] = useState<MauBaoCaoDto | null>(null);
  const [activeKeyHighlight, setActiveKeyHighlight] = useState<string | null>(null);

  // Modal con chỉnh sửa từng key
  const [isOpenEditKeyModal, setIsOpenEditKeyModal] = useState(false);
  const [editingKeyData, setEditingKeyData] = useState<MauBaoCaoChiTietDto | null>(null);
  const [editingKeyIndex, setEditingKeyIndex] = useState<number | null>(null);
  const [editKeyForm] = Form.useForm();
  const editKeyInputType = Form.useWatch("inputType", editKeyForm);
  const formPhanLoai = Form.useWatch("phanLoai", form);

  const tableColumns: TableColumnsType<MauBaoCaoDto> = [
    { title: "STT", width: 60, align: "center", render: (_: any, __: any, i: number) => pageSize * (pageIndex - 1) + i + 1 },
    { title: "Mã mẫu báo cáo", dataIndex: "maMauBaoCao", width: 150 },
    { title: "Tên mẫu báo cáo", dataIndex: "tenMauBaoCao", width: 300 },
    {
      title: "Loại nền tảng", dataIndex: "loaiNenTangName", width: 250,
      render: (text: string) => {
        if (!text) return "";
        const items = text.split(", ");
        return (
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            {items.map((item, index) => (
              <li key={index} style={{ marginBottom: 4 }}>{item}</li>
            ))}
          </ul>
        );
      }
    },
    { title: "Loại hình nền tảng", dataIndex: "loaiHinhNenTangName", width: 200 },
    {
      title: "Kỳ báo cáo", width: 150,
      render: (_: any, record: MauBaoCaoDto) => {
        const map: Record<string, string> = { THANG: "Tháng", QUY: "Quý", NAM: "Năm" };
        const ky = record.kyBaoCao ? map[record.kyBaoCao] : "--";
        const han = record.kyBaoCao ? `Hạn: ngày ${record.hanNopNgay ?? 15} tháng ${record.hanNopThang ?? "kế tiếp"}` : "";
        return (
          <div>
            <Tag color={record.kyBaoCao === "NAM" ? "blue" : record.kyBaoCao === "QUY" ? "green" : "default"}>{ky}</Tag>
            {han ? <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{han}</div> : null}
          </div>
        );
      }
    },
    {
      title: "Phân loại", width: 130,
      render: (_: any, record: MauBaoCaoDto) => {
        const map: Record<string, string> = { NEN_TANG: "Nền tảng TMĐT", CHUNG_THUC: "Chứng thực HĐĐT" };
        const colorMap: Record<string, string> = { NEN_TANG: "geekblue", CHUNG_THUC: "purple" };
        return record.phanLoai ? <Tag color={colorMap[record.phanLoai] || "default"}>{map[record.phanLoai] || record.phanLoai}</Tag> : <Tag>--</Tag>;
      }
    },
    {
      title: "Trạng thái nền tảng", width: 220,
      render: (_: any, record: MauBaoCaoDto) => {
        if (!record.trangThaiNenTang) return <Tag>Mặc định (Đã xác nhận)</Tag>;
        const statusIds = record.trangThaiNenTang.split(",").map(s => s.trim()).filter(Boolean);
        return (
          <Space wrap size={[2, 2]}>
            {statusIds.map(id => {
              const numericId = Number(id);
              const label = PlatformStatusConstant.getDisplayName(numericId) || id;
              const color = PlatformStatusConstant.getColor(numericId);
              return <Tag key={id} color={color} style={{ margin: 0 }}>{label}</Tag>;
            })}
          </Space>
        );
      }
    },
    {
      title: "Đính kèm", width: 130, align: "center",
      render: (_: any, record: any) => record.fileDinhKem ? (
        <a href={`${staticUrl}/${record.fileDinhKem}`} target="_blank" rel="noreferrer"><FileOutlined style={{ color: "#0355a2", fontSize: 16 }} /> Tải xuống</a>
      ) : "-",
    },
    {
      title: "Thao tác", width: 120, align: "center", fixed: "right",
      render: (_: any, record: MauBaoCaoDto) => {
        const items: MenuProps["items"] = [
          { label: "Chỉnh sửa", key: "edit", icon: <EditOutlined />, onClick: () => { setCurrentItem(record); setIsOpenModal(true); } },
          { label: "Cấu hình Keys", key: "config", icon: <SettingOutlined />, onClick: () => handleOpenConfig(record) },
          { label: "Xóa", key: "delete", icon: <DeleteOutlined />, danger: true, onClick: () => setOpenPopconfirmId(record.id ?? "") },
        ];
        return (<><Dropdown menu={{ items }} trigger={["click"]}><Button onClick={(e) => e.preventDefault()} color="primary"><Space>Thao tác<DownOutlined /></Space></Button></Dropdown><Popconfirm title="Xác nhận xóa" okText="Xóa" cancelText="Hủy" open={openPopconfirmId === record.id} onConfirm={() => { handleDelete(record.id || ""); setOpenPopconfirmId(null); }} onCancel={() => setOpenPopconfirmId(null)} /></>);
      },
    },
  ];

  const handleDelete = async (id: string) => { const r = await mauBaoCaoService.delete(id); if (r.status) { message.success("Xóa thành công"); handleFetch(); } };

  const handleFetch = useCallback(async (s?: MauBaoCaoSearch) => {
    dispatch(setIsLoading(true));
    try {
      const param = s || { pageIndex, pageSize, ...searchValues };
      const r = await mauBaoCaoService.getData(param as MauBaoCaoSearch);
      if (r?.data) { setDataList(r.data.items); setDataPage({ pageIndex: r.data.pageIndex, pageSize: r.data.pageSize, totalCount: r.data.totalCount, totalPage: r.data.totalPage }); }
    } finally { dispatch(setIsLoading(false)); }
  }, [pageIndex, pageSize, searchValues]);

  const handleUploadFile = (file: File) => {
    const formData = new FormData();
    formData.append("Files", file);
    formData.append("FileType", "mau-bao-cao");
    const token = localStorage.getItem("AccessToken");
    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/api/TaiLieuDinhKem/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (res) => {
        const uploaded = res.data?.data?.[0];
        if (uploaded?.duongDanFile) {
          const path = uploaded.duongDanFile;
          setFilePath(path);
          setFileList([{ uid: uploaded.id, name: uploaded.tenTaiLieu, status: "done", url: `${staticUrl}/${path}` }]);
          message.success("Upload file thành công");

          // Tự động phân tích trích xuất các keys nếu là file word (.docx)
          const fileExtension = path.split('.').pop()?.toLowerCase();
          if (fileExtension === 'docx') {
            try {
              const resExtract = await mauBaoCaoService.extractKeys(path);
              if (resExtract.status && resExtract.data) {
                form.setFieldsValue({ keys: resExtract.data });
                message.success("Tự động trích xuất các keys cấu hình thành công!");
              }
            } catch (err) {
              console.error("Lỗi khi trích xuất keys:", err);
            }
          }
        }
      })
      .catch(() => message.error("Upload file thất bại"));
  };

  const handleSubmit = async (values: MauBaoCaoCreateRequest) => {
    const payload: any = currentItem ? { ...values, id: currentItem.id } : values;
    payload.fileDinhKem = filePath || null;
    // Chuyển mảng trạng thái thành chuỗi phân cách bằng dấu phẩy
    if (Array.isArray(payload.trangThaiNenTang)) {
      payload.trangThaiNenTang = payload.trangThaiNenTang.join(",");
    }
    const r = await mauBaoCaoService.createOrUpdate(payload);
    if (r.status) { message.success(currentItem ? "Cập nhật thành công" : "Thêm mới thành công"); form.resetFields(); setIsOpenModal(false); setCurrentItem(undefined); setFileList([]); setFilePath(""); handleFetch(); }
    else message.error(r.message || "Lưu thất bại");
  };

  // Cấu hình keys
  const handleOpenConfig = async (record: MauBaoCaoDto) => {
    setSelectedMauBaoCaoId(record.id || "");
    setSelectedMauBaoCao(record);
    dispatch(setIsLoading(true));
    try {
      const res = await mauBaoCaoService.getConfigByMauBaoCaoId(record.id || "");
      if (res.status && res.data) {
        setConfigList(res.data);
        setIsOpenConfigModal(true);
      } else {
        message.error(res.message || "Không thể tải cấu hình keys");
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleSaveConfig = async () => {
    // Validate
    const invalidItem = configList.find(x => !x.keyName || !x.displayName);
    if (invalidItem) {
      message.error("Vui lòng điền đầy đủ Tên key và Nhãn hiển thị");
      return;
    }

    setLocalLoading(prev => ({ ...prev, saveConfig: true }));
    try {
      const res = await mauBaoCaoService.saveConfig(selectedMauBaoCaoId, configList);
      if (res.status) {
        message.success("Lưu cấu hình thành công");
        setIsOpenConfigModal(false);
        setSelectedMauBaoCao(null);
        handleFetch();
      } else {
        message.error(res.message || "Lưu cấu hình thất bại");
      }
    } finally {
      setLocalLoading(prev => ({ ...prev, saveConfig: false }));
    }
  };

  // Logic click vào Key trên giao diện A4 -> Mở Modal chỉnh sửa key cụ thể đó
  const handleKeyClickOnA4 = (keyName: string) => {
    const cleanKeyName = keyName.trim();
    const matchedIndex = configList.findIndex(
      x => x.keyName.trim() === cleanKeyName ||
      x.keyName.trim() === `{{${cleanKeyName}}}` ||
      x.keyName.trim().replace(/\{|\}/g, "") === cleanKeyName.replace(/\{|\}/g, "")
    );

    if (matchedIndex !== -1) {
      const matchedKey = configList[matchedIndex];
      setEditingKeyIndex(matchedIndex);
      setEditingKeyData(matchedKey);
      setActiveKeyHighlight(matchedKey.keyName);

      // Điền thông tin vào Form Modal Con
      editKeyForm.setFieldsValue({
        keyName: matchedKey.keyName,
        displayName: matchedKey.displayName,
        inputType: matchedKey.inputType,
        isRequired: matchedKey.isRequired,
        options: matchedKey.options || "",
        layout: matchedKey.layout || "Horizontal",
        minValue: matchedKey.minValue,
        maxValue: matchedKey.maxValue,
      });

      setIsOpenEditKeyModal(true);
    } else {
      // Nếu key chưa có trong DB (ví dụ mới sửa trong file Word trực tiếp), đề xuất tạo mới
      Modal.confirm({
        title: "Key chưa được đăng ký",
        content: `Key "${keyName}" chưa có trong danh sách cấu hình. Bạn có muốn thêm mới Key này không?`,
        okText: "Đăng ký",
        cancelText: "Hủy",
        onOk: () => {
          const newRow = {
            mauBaoCaoId: selectedMauBaoCaoId,
            keyName: `{{${cleanKeyName.replace("{", "").replace("}", "")}}}`,
            displayName: cleanKeyName.replace("{", "").replace("}", "").trim(),
            inputType: "Input",
            isRequired: false,
            options: "",
          } as any;
          const newList = [...configList, newRow];
          setConfigList(newList);

          // Sau khi thêm, mở luôn modal để sửa
          const newIndex = newList.length - 1;
          setEditingKeyIndex(newIndex);
          setEditingKeyData(newRow);
          setActiveKeyHighlight(newRow.keyName);

          editKeyForm.setFieldsValue({
            keyName: newRow.keyName,
            displayName: newRow.displayName,
            inputType: newRow.inputType,
            isRequired: newRow.isRequired,
            options: "",
            layout: "Horizontal",
          });
          setIsOpenEditKeyModal(true);
        }
      });
    }
  };

  // Xác nhận sửa key trong Modal Con
  const handleSaveEditKey = () => {
    editKeyForm.validateFields().then((values) => {
      if (editingKeyIndex !== null) {
        setLocalLoading(prev => ({ ...prev, saveKey: true }));
        const newList = [...configList];
        const choiceTypes = ["Dropdown", "Checkbox", "Radio"];
        newList[editingKeyIndex] = {
          ...newList[editingKeyIndex],
          displayName: values.displayName.trim(),
          inputType: values.inputType,
          isRequired: values.isRequired,
          options: choiceTypes.includes(values.inputType) ? values.options?.trim() : null,
          layout: ["Checkbox", "Radio"].includes(values.inputType) ? values.layout : "Horizontal",
          minValue: values.inputType === "Number" ? values.minValue ?? null : null,
          maxValue: values.inputType === "Number" ? values.maxValue ?? null : null,
        };
        setConfigList(newList);
        setIsOpenEditKeyModal(false);
        setActiveKeyHighlight(null);
        setLocalLoading(prev => ({ ...prev, saveKey: false }));
        message.success(`Đã ghi nhận cấu hình cho key: ${values.keyName}`);
      }
    });
  };

  // Tách style và body từ HtmlContent để render
  const docxPreviewContent = useMemo(() => {
    if (!selectedMauBaoCao?.htmlContent) return null;

    const html = selectedMauBaoCao.htmlContent;
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
  }, [selectedMauBaoCao]);

  // Hàm lấy Icon tương ứng với loại dữ liệu
  const getKeyIcon = (inputType?: string) => {
    switch (inputType) {
      case "Input":
        return <BorderOutlined style={{ marginRight: 4 }} />;
      case "TextArea":
        return <FileTextOutlined style={{ marginRight: 4 }} />;
      case "Number":
        return <NumberOutlined style={{ marginRight: 4 }} />;
      case "Dropdown":
        return <UnorderedListOutlined style={{ marginRight: 4 }} />;
      case "Checkbox":
        return <CheckSquareOutlined style={{ marginRight: 4 }} />;
      case "Radio":
        return <CheckCircleOutlined style={{ marginRight: 4 }} />;
      case "File":
        return <PaperClipOutlined style={{ marginRight: 4 }} />;
      default:
        return <BorderOutlined style={{ marginRight: 4 }} />;
    }
  };

  // Bộ lọc parse HTML thay thế [[key]] thành Tag tương tác
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

                // Tìm cấu hình của key này trong danh sách
                const cfg = configList.find(
                  x => x.keyName.trim() === cleanKey ||
                  x.keyName.trim() === key ||
                  x.keyName.trim().replace(/\{|\}/g, "") === key
                );

                const isHighlighted = activeKeyHighlight === cleanKey || activeKeyHighlight === key || activeKeyHighlight?.replace(/\{|\}/g, "") === key;
                const isConfigured = !!cfg;
                return (
                  <Tag
                    key={index}
                    color={isHighlighted ? "red" : isConfigured ? "orange" : "default"}
                    icon={!isConfigured ? <BorderOutlined /> : undefined}
                    style={{
                      cursor: "pointer",
                      fontWeight: "bold",
                      border: isHighlighted ? "2px solid red" : isConfigured ? "1px solid orange" : "1px dashed #bbb",
                      padding: "2px 6px",
                      margin: "0 2px"
                    }}
                    onClick={() => handleKeyClickOnA4(key)}
                  >
                    {isConfigured ? getKeyIcon(cfg.inputType) : undefined}
                    {key}
                    {cfg?.isRequired && <span style={{ color: "red", marginLeft: 4 }}>*</span>}
                  </Tag>
                );
              }
              return part || null;
            })}
          </>
        );
      }
    },
  };

  useEffect(() => {
    if (isOpenModal && currentItem) {
      const values: any = { ...currentItem };
      // Chuyển chuỗi trạng thái thành mảng cho Select mode="multiple"
      if (typeof values.trangThaiNenTang === "string" && values.trangThaiNenTang) {
        values.trangThaiNenTang = values.trangThaiNenTang.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
      // Chuyển chuỗi loại nền tảng thành mảng int cho Select mode="multiple"
      if (typeof values.loaiNenTang === "string" && values.loaiNenTang) {
        values.loaiNenTang = values.loaiNenTang.split(",").map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
      }
      form.setFieldsValue(values);
      const item = currentItem as any;
      if (item.fileDinhKem) {
        setFileList([{ uid: "-1", name: "File đính kèm", status: "done", url: `${staticUrl}/${item.fileDinhKem}` }]);
        setFilePath(item.fileDinhKem);
      } else {
        setFileList([]); setFilePath("");
      }
    } else {
      form.resetFields();
      form.setFieldsValue({ trangThaiNenTang: ["5"] as any, kyBaoCao: "THANG", hanNopThang: 1, hanNopNgay: 15, phanLoai: "NEN_TANG" });
      setFileList([]); setFilePath("");
    }
  }, [isOpenModal, currentItem]);
  useEffect(() => { handleFetch(); }, [handleFetch]);

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" style={{ marginBottom: 10 }}><AutoBreadcrumb /></Flex>
      <Flex justifyContent="flex-end" style={{ marginBottom: 10, gap: 8 }}>
        <Button icon={<SearchOutlined />} onClick={() => setIsPanelVisible(!isPanelVisible)}>Tìm kiếm</Button>
        <Button color="green" variant="solid" icon={<PlusCircleOutlined />} onClick={() => { setCurrentItem(undefined); form.resetFields(); form.setFieldsValue({ trangThaiNenTang: ["5"] as any, kyBaoCao: "THANG", hanNopThang: 1, hanNopNgay: 15, phanLoai: "NEN_TANG" }); setIsOpenModal(true); }}>Thêm mới</Button>
      </Flex>
      {isPanelVisible && (
        <Card bodyStyle={{ padding: 16 }} style={{ marginBottom: 12 }}>
          <Form form={searchForm} layout="vertical" onFinish={(v) => { setSearchValues({ keyword: v.keyword, loaiNenTang: v.loaiNenTang, loaiHinhNenTang: v.loaiHinhNenTang, pageIndex: 1, pageSize: 20 }); handleFetch({ keyword: v.keyword, loaiNenTang: v.loaiNenTang, loaiHinhNenTang: v.loaiHinhNenTang, pageIndex: 1, pageSize: 20 }); }}>
            <Row gutter={16}>
              <Col md={6}><Form.Item label="Từ khóa" name="keyword"><Input placeholder="Mã mẫu, tên mẫu, keys..." /></Form.Item></Col>
              <Col md={8}>
                <Form.Item label="Loại nền tảng" name="loaiNenTang">
                  <Select
                    allowClear
                    placeholder="Tất cả loại nền tảng"
                    options={[
                      { value: 1, label: "Nền tảng TMĐT kinh doanh trực tiếp có chức năng đặt hàng trực tuyến" },
                      { value: 2, label: "Nền tảng TMĐT kinh doanh trực tiếp nước ngoài có chức năng đặt hàng trực tuyến có hoạt động TMĐT tại Việt Nam" },
                      { value: 3, label: "Nền tảng TMĐT trung gian, mạng xã hội hoạt động TMĐT, nền tảng TMĐT tích hợp" },
                      { value: 4, label: "Nền tảng TMĐT trung gian nước ngoài, mạng xã hội hoạt động TMĐT nước ngoài, nền tảng TMĐT tích hợp nước ngoài" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col md={6}><Form.Item label="Loại hình nền tảng" name="loaiHinhNenTang"><Select allowClear placeholder="Tất cả loại hình" options={PlatformTypeConstant.getDropdownList()} /></Form.Item></Col>
              <Col md={4} style={{ display: "flex", alignItems: "end" }}>
                <Form.Item style={{ width: "100%" }}>
                  <Button color="cyan" variant="solid" htmlType="submit" icon={<SearchOutlined />} style={{ width: "100%" }}>
                    Tìm kiếm
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      )}
      <Card bodyStyle={{ padding: 12 }}>
        <Table<MauBaoCaoDto> columns={tableColumns} bordered dataSource={dataList} rowKey="id" scroll={{ x: 1200 }} pagination={false} loading={loading} />
        <Flex justifyContent="flex-end" style={{ marginTop: 16 }}>
          <Pagination total={dataPage?.totalCount || 0} current={pageIndex} pageSize={pageSize} showSizeChanger showTotal={(t, r) => `${r[0]}-${r[1]} trong ${t} mẫu báo cáo`} onChange={(p, s) => { setPageIndex(p); if (s !== pageSize) setPageSize(s); }} />
        </Flex>
      </Card>

      {/* Modal Thêm Mới / Cập Nhật Mẫu Báo Cáo */}
      <Modal title={currentItem ? "Chỉnh sửa mẫu báo cáo" : "Thêm mới mẫu báo cáo"} open={isOpenModal} onOk={() => form.submit()} onCancel={() => { setIsOpenModal(false); setCurrentItem(undefined); }} okText="Xác nhận" cancelText="Đóng" width={650} destroyOnClose>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Mã mẫu báo cáo" name="maMauBaoCao" rules={[{ required: true, message: "Vui lòng nhập mã mẫu báo cáo" }]}><Input placeholder="Ví dụ: BC_01" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Tên mẫu báo cáo" name="tenMauBaoCao" rules={[{ required: true, message: "Vui lòng nhập tên mẫu báo cáo" }]}><Input placeholder="Ví dụ: Báo cáo định kỳ năm" /></Form.Item></Col>
            <Col span={6}>
              <Form.Item label="Phân loại" name="phanLoai" rules={[{ required: true, message: "Vui lòng chọn phân loại" }]}>
                <Select placeholder="Chọn phân loại" options={[
                  { value: 'NEN_TANG', label: 'Nền tảng TMĐT' },
                  { value: 'CHUNG_THUC', label: 'Chứng thực HĐĐT' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Kỳ báo cáo" name="kyBaoCao">
                <Select placeholder="Chọn kỳ báo cáo" options={[
                  { value: 'THANG', label: 'Tháng' },
                  { value: 'QUY', label: 'Quý' },
                  { value: 'NAM', label: 'Năm' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Tháng hết hạn nộp" name="hanNopThang">
                <InputNumber min={1} max={12} style={{ width: '100%' }} placeholder="Tháng kế tiếp" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Ngày hết hạn nộp" name="hanNopNgay">
                <InputNumber min={1} max={31} style={{ width: '100%' }} placeholder="Ngày 15" />
              </Form.Item>
            </Col>
            {formPhanLoai === "NEN_TANG" && (
              <>
                <Col span={14}>
                  <Form.Item label="Loại nền tảng" name="loaiNenTang">
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="Chọn loại nền tảng"
                      options={[
                        { value: 1, label: "Nền tảng TMĐT kinh doanh trực tiếp có chức năng đặt hàng trực tuyến" },
                        { value: 2, label: "Nền tảng TMĐT kinh doanh trực tiếp nước ngoài có chức năng đặt hàng trực tuyến có hoạt động TMĐT tại Việt Nam" },
                        { value: 3, label: "Nền tảng TMĐT trung gian, mạng xã hội hoạt động TMĐT, nền tảng TMĐT tích hợp" },
                        { value: 4, label: "Nền tảng TMĐT trung gian nước ngoài, mạng xã hội hoạt động TMĐT nước ngoài, nền tảng TMĐT tích hợp nước ngoài" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={10}><Form.Item label="Loại hình nền tảng" name="loaiHinhNenTang"><Select allowClear placeholder="Chọn loại hình nền tảng" options={PlatformTypeConstant.getDropdownList()} /></Form.Item></Col>
              </>
            )}
            <Col span={24}>
  {formPhanLoai === "CHUNG_THUC" ? (
    <Form.Item label="Trạng thái hợp đồng áp dụng" name="trangThaiNenTang" rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}>
      <Select mode="multiple" allowClear placeholder="Chọn trạng thái" options={ConstractStatusConstant.getDropdownList()} />
    </Form.Item>
  ) : (
    <Form.Item label="Trạng thái nền tảng áp dụng" name="trangThaiNenTang" rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}>
      <Select mode="multiple" allowClear placeholder="Chọn trạng thái" options={PlatformStatusConstant.getDropdownList()} />
    </Form.Item>
  )}
</Col>
            <Col span={24}><Form.Item label="Các keys cấu hình (Không bắt buộc nhập, tự động trích xuất từ file đính kèm)" name="keys"><Input.TextArea placeholder="Ví dụ: {{TenDoanhNghiep}},{{NamBaoCao}},{{SoLieu}}" rows={2} /></Form.Item></Col>
            <Col span={24}>
              <Form.Item label="File đính kèm mẫu (.docx để tự động phân tích keys)">
                <Upload
                  fileList={fileList}
                  maxCount={1}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  beforeUpload={(file) => { handleUploadFile(file); return false; }}
                  onRemove={() => { setFileList([]); setFilePath(""); }}
                >
                  <Button icon={<UploadOutlined />}>Tải file</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal Cấu Hình Chi Tiết Keys - Giao diện trực quan tờ A4 */}
      <Modal title={`Cấu hình các Keys - Mẫu: ${selectedMauBaoCao?.maMauBaoCao || ""}`} open={isOpenConfigModal} onOk={handleSaveConfig} onCancel={() => { setIsOpenConfigModal(false); setSelectedMauBaoCao(null); }} okText="Lưu cấu hình mẫu" cancelText="Đóng" width={1000} style={{ top: 30 }} destroyOnClose confirmLoading={localLoading.saveConfig}>
        <div style={{ padding: "30px 40px", overflowY: "auto", maxHeight: "650px", border: "1px solid #f0f0f0", borderRadius: "8px", background: "#ffffff" }}>
          {docxPreviewContent ? (
            <div className="docx-page-content" style={{ position: "relative" }}>
              {docxPreviewContent.style && <style>{docxPreviewContent.style}</style>}
              {parse(docxPreviewContent.body, replaceOptions)}
            </div>
          ) : (
            <Flex alignItems="center" justifyContent="center" style={{ height: "400px" }}>
              <span style={{ color: "#999" }}>Không tìm thấy tài liệu định dạng Word (.docx) hoặc mẫu chưa được phân tích HTML.</span>
            </Flex>
          )}
        </div>
      </Modal>

      {/* Modal Con: Chỉnh sửa thuộc tính của key được chọn */}
      <Modal title={`Thiết lập thuộc tính Key: ${editingKeyData?.keyName}`} open={isOpenEditKeyModal} onOk={handleSaveEditKey} onCancel={() => { setIsOpenEditKeyModal(false); setActiveKeyHighlight(null); }} okText="Xác nhận" cancelText="Hủy" width={500} destroyOnClose confirmLoading={localLoading.saveKey}>
        <Form layout="vertical" form={editKeyForm}>
          <Form.Item label="Mã Key" name="keyName">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Nhãn hiển thị (Label)" name="displayName" rules={[{ required: true, message: "Vui lòng nhập nhãn hiển thị" }]}>
            <Input placeholder="Ví dụ: Tên doanh nghiệp" />
          </Form.Item>
          <Form.Item label="Loại dữ liệu" name="inputType" rules={[{ required: true }]}>
            <Select options={INPUT_TYPES} />
          </Form.Item>
          <Form.Item label="Bắt buộc nhập" name="isRequired" valuePropName="checked">
            <Switch />
          </Form.Item>
          {editKeyInputType === "Number" && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Giá trị tối thiểu (Min)" name="minValue">
                  <InputNumber style={{ width: "100%" }} placeholder="Không giới hạn" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Giá trị tối đa (Max)" name="maxValue">
                  <InputNumber style={{ width: "100%" }} placeholder="Không giới hạn" />
                </Form.Item>
              </Col>
            </Row>
          )}
          {["Dropdown", "Checkbox", "Radio"].includes(editKeyInputType) && (
            <Form.Item label="Danh sách lựa chọn (Phân cách bằng dấu phẩy)" name="options" rules={[{ required: true, message: "Vui lòng nhập danh sách lựa chọn" }]}>
              <Input placeholder="Lựa chọn A, Lựa chọn B, Lựa chọn C" />
            </Form.Item>
          )}
          {["Checkbox", "Radio"].includes(editKeyInputType) && (
            <Form.Item label="Bố trí hiển thị" name="layout">
              <Select>
                <Select.Option value="Horizontal">Ngang (Horizontal)</Select.Option>
                <Select.Option value="Vertical">Dọc (Vertical)</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default withAuthorization(Page, "");
