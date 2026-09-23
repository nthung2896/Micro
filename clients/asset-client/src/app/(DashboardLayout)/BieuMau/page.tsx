"use client";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageInfo } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { DeleteOutlined, DownOutlined, EditOutlined, PlusCircleOutlined, SearchOutlined, UploadOutlined, FileOutlined } from "@ant-design/icons";
import { Button, Card, Col, Dropdown, Form, Input, MenuProps, Modal, Pagination, Popconfirm, Row, Select, Space, Table, TableColumnsType, Tag, Upload, message } from "antd";
import type { UploadFile } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import bieuMauService from "@/services/bieuMau/bieuMau.service";
import { BieuMauDto, BieuMauSearch, BieuMauCreateRequest } from "@/types/bieuMau";
import { LOAI_BIEU_MAU } from "@/constants/LoaiBieuMauConstant";
import axios from "axios";

const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";

const Page: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [dataList, setDataList] = useState<BieuMauDto[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [searchValues, setSearchValues] = useState<BieuMauSearch | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [currentItem, setCurrentItem] = useState<BieuMauDto | undefined>();
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);
  const [form] = Form.useForm<BieuMauCreateRequest>();
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [searchForm] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [filePath, setFilePath] = useState<string>("");

  const tableColumns: TableColumnsType<BieuMauDto> = [
    { title: "STT", width: 60, align: "center", render: (_: any, __: any, i: number) => pageSize * (pageIndex - 1) + i + 1 },
    { title: "Tên tài liệu", dataIndex: "tenTaiLieu", width: 350 },
    { title: "Mô tả", dataIndex: "moTa", width: 300 },
    { title: "Loại", dataIndex: "loaiBieuMau", width: 120 },
    { title: "Trạng thái", dataIndex: "trangThai", width: 110, align: "center", render: (v: number) => <Tag color={v === 1 ? "green" : v === 2 ? "red" : "default"}>{v === 1 ? "Hiển thị" : v === 2 ? "Ẩn" : "Nháp"}</Tag> },
    {
      title: "Đính kèm", width: 150, align: "center",
      render: (_: any, record: any) => record.fileDinhKem ? (
        <a href={`${staticUrl}/${record.fileDinhKem}`} target="_blank" rel="noreferrer"><FileOutlined style={{ color: "#0355a2", fontSize: 16 }} /> Tải xuống</a>
      ) : "-",
    },
    {
      title: "Thao tác", width: 120, align: "center", fixed: "right",
      render: (_: any, record: BieuMauDto) => {
        const items: MenuProps["items"] = [
          { label: "Chỉnh sửa", key: "edit", icon: <EditOutlined />, onClick: () => { setCurrentItem(record); setIsOpenModal(true); } },
          { label: "Xóa", key: "delete", icon: <DeleteOutlined />, danger: true, onClick: () => setOpenPopconfirmId(record.id ?? "") },
        ];
        return (<><Dropdown menu={{ items }} trigger={["click"]}><Button onClick={(e) => e.preventDefault()} color="primary"><Space>Thao tác<DownOutlined /></Space></Button></Dropdown><Popconfirm title="Xác nhận xóa" okText="Xóa" cancelText="Hủy" open={openPopconfirmId === record.id} onConfirm={() => { handleDelete(record.id || ""); setOpenPopconfirmId(null); }} onCancel={() => setOpenPopconfirmId(null)} /></>);
      },
    },
  ];

  const handleDelete = async (id: string) => { const r = await bieuMauService.delete(id); if (r.status) { message.success("Xóa thành công"); handleFetch(); } };

  const handleFetch = useCallback(async (s?: BieuMauSearch) => {
    dispatch(setIsLoading(true));
    try {
      const param = s || { pageIndex, pageSize, ...searchValues };
      const r = await bieuMauService.getData(param as BieuMauSearch);
      if (r?.data) { setDataList(r.data.items); setDataPage({ pageIndex: r.data.pageIndex, pageSize: r.data.pageSize, totalCount: r.data.totalCount, totalPage: r.data.totalPage }); }
    } finally { dispatch(setIsLoading(false)); }
  }, [pageIndex, pageSize]);

  const handleUploadFile = (file: File) => {
    const formData = new FormData();
    formData.append("Files", file);
    formData.append("FileType", "bieu-mau");
    const token = localStorage.getItem("AccessToken");
    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/api/TaiLieuDinhKem/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const uploaded = res.data?.data?.[0];
        if (uploaded?.duongDanFile) {
          setFilePath(uploaded.duongDanFile);
          setFileList([{ uid: uploaded.id, name: uploaded.tenTaiLieu, status: "done", url: `${staticUrl}/${uploaded.duongDanFile}` }]);
          message.success("Upload file thành công");
        }
      })
      .catch(() => message.error("Upload file thất bại"));
  };

  const handleSubmit = async (values: BieuMauCreateRequest) => {
    const payload: any = currentItem ? { ...values, id: currentItem.id } : values;
    if (filePath) payload.fileDinhKem = filePath;
    const r = await bieuMauService.createOrUpdate(payload);
    if (r.status) { message.success(currentItem ? "Cập nhật thành công" : "Thêm mới thành công"); form.resetFields(); setIsOpenModal(false); setCurrentItem(undefined); setFileList([]); setFilePath(""); handleFetch(); }
    else message.error(r.message || "Lưu thất bại");
  };

  useEffect(() => {
    if (isOpenModal && currentItem) {
      form.setFieldsValue({ ...currentItem });
      const item = currentItem as any;
      if (item.fileDinhKem) {
        setFileList([{ uid: "-1", name: "File đính kèm", status: "done", url: `${staticUrl}/${item.fileDinhKem}` }]);
        setFilePath(item.fileDinhKem);
      } else {
        setFileList([]); setFilePath("");
      }
    } else {
      form.resetFields(); form.setFieldsValue({ trangThai: 1 });
      setFileList([]); setFilePath("");
    }
  }, [isOpenModal, currentItem]);
  useEffect(() => { handleFetch(); }, [handleFetch]);

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" style={{ marginBottom: 10 }}><AutoBreadcrumb /></Flex>
      <Flex justifyContent="flex-end" style={{ marginBottom: 10, gap: 8 }}>
        <Button icon={<SearchOutlined />} onClick={() => setIsPanelVisible(!isPanelVisible)}>Tìm kiếm</Button>
        <Button color="green" variant="solid" icon={<PlusCircleOutlined />} onClick={() => { setCurrentItem(undefined); setIsOpenModal(true); }}>Thêm mới</Button>
      </Flex>
      {isPanelVisible && (
        <Card bodyStyle={{ padding: 16 }} style={{ marginBottom: 12 }}>
          <Form form={searchForm} layout="vertical" onFinish={(v) => { setSearchValues({ keyword: v.keyword, pageIndex: 1, pageSize: 20 }); handleFetch({ keyword: v.keyword, pageIndex: 1, pageSize: 20 }); }}>
            <Row gutter={16}>
              <Col md={8}><Form.Item label="Từ khóa" name="keyword"><Input placeholder="Tên tài liệu, mô tả..." /></Form.Item></Col>
              <Col md={4} style={{ display: "flex", alignItems: "end" }}><Form.Item><Button type="primary" htmlType="submit">Tìm</Button></Form.Item></Col>
            </Row>
          </Form>
        </Card>
      )}
      <Card bodyStyle={{ padding: 12 }}>
        <Table<BieuMauDto> columns={tableColumns} bordered dataSource={dataList} rowKey="id" scroll={{ x: 1100 }} pagination={false} loading={loading} />
        <Flex justifyContent="flex-end" style={{ marginTop: 16 }}>
          <Pagination total={dataPage?.totalCount || 0} current={pageIndex} pageSize={pageSize} showSizeChanger showTotal={(t, r) => `${r[0]}-${r[1]} trong ${t} biểu mẫu`} onChange={(p, s) => { setPageIndex(p); if (s !== pageSize) setPageSize(s); }} />
        </Flex>
      </Card>
      <Modal title={currentItem ? "Chỉnh sửa biểu mẫu" : "Thêm mới biểu mẫu"} open={isOpenModal} onOk={() => form.submit()} onCancel={() => { setIsOpenModal(false); setCurrentItem(undefined); }} okText="Xác nhận" cancelText="Đóng" width={600} destroyOnClose>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={24}><Form.Item label="Tên tài liệu" name="tenTaiLieu" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={24}><Form.Item label="Mô tả" name="moTa"><Input.TextArea rows={3} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Loại biểu mẫu" name="loaiBieuMau"><Select allowClear placeholder="Chọn loại" options={LOAI_BIEU_MAU.map((d) => ({ label: d.label, value: d.value }))} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Trạng thái" name="trangThai"><Select options={[{ label: "Nháp", value: 0 }, { label: "Hiển thị", value: 1 }, { label: "Ẩn", value: 2 }]} /></Form.Item></Col>
            <Col span={24}>
              <Form.Item label="File đính kèm">
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
    </>
  );
};

export default withAuthorization(Page, "");
