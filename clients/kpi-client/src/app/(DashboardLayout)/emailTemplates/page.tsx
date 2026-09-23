"use client";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageInfo } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { DeleteOutlined, DownOutlined, EditOutlined, EyeOutlined, PlusCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Descriptions, Divider, Drawer, Dropdown, Form, Input, MenuProps, Modal, Pagination, Popconfirm, Row, Select, Space, Table, TableColumnsType, Tag, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import emailTemplatesService from "@/services/emailTemplates/emailTemplates.service";
import { EmailTemplatesDto, EmailTemplatesSearch, EmailTemplatesRequest } from "@/types/emailTemplates";

const Page: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [dataList, setDataList] = useState<EmailTemplatesDto[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [searchValues, setSearchValues] = useState<EmailTemplatesSearch | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [currentItem, setCurrentItem] = useState<EmailTemplatesDto | undefined>();
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);
  const [form] = Form.useForm<EmailTemplatesRequest>();
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [searchForm] = Form.useForm();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const tableColumns: TableColumnsType<EmailTemplatesDto> = [
    { title: "STT", width: 60, align: "center", render: (_: any, __: any, i: number) => pageSize * (pageIndex - 1) + i + 1 },
    { title: "Mã template", dataIndex: "code", width: 180 },
    { title: "Tiêu đề", dataIndex: "subject", width: 300 },
    { title: "Kiểu", dataIndex: "bodyType", width: 80, align: "center" },
    { title: "Trạng thái", dataIndex: "isActive", width: 130, align: "center", render: (v: boolean) => <Tag color={v ? "green" : "default"}>{v ? "Hoạt động" : "Ngừng"}</Tag> },
    { title: "Mô tả", dataIndex: "description", width: 250, render: (v: string) => v || "-" },
    {
      title: "Thao tác", width: 120, align: "center", fixed: "right",
      render: (_: any, record: EmailTemplatesDto) => {
        const items: MenuProps["items"] = [
          { label: "Chi tiết", key: "detail", icon: <EyeOutlined />, onClick: () => { setCurrentItem(record); setIsOpenDetail(true); } },
          { label: "Chỉnh sửa", key: "edit", icon: <EditOutlined />, onClick: () => { setCurrentItem(record); setIsOpenModal(true); } },
          { label: "Xóa", key: "delete", icon: <DeleteOutlined />, danger: true, onClick: () => setOpenPopconfirmId(record.id ?? "") },
        ];
        return (<><Dropdown menu={{ items }} trigger={["click"]}><Button onClick={(e) => e.preventDefault()} color="primary"><Space>Thao tác<DownOutlined /></Space></Button></Dropdown><Popconfirm title="Xác nhận xóa" okText="Xóa" cancelText="Hủy" open={openPopconfirmId === record.id} onConfirm={() => { handleDelete(record.id || ""); setOpenPopconfirmId(null); }} onCancel={() => setOpenPopconfirmId(null)} /></>);
      },
    },
  ];

  const handleDelete = async (id: string) => { const r = await emailTemplatesService.delete(id); if (r.status) { message.success("Xóa thành công"); handleFetch(); } };

  const handleFetch = useCallback(async (s?: EmailTemplatesSearch) => {
    dispatch(setIsLoading(true));
    try {
      const param = s || { pageIndex, pageSize, ...searchValues };
      const r = await emailTemplatesService.getData(param as EmailTemplatesSearch);
      if (r?.data) { setDataList(r.data.items); setDataPage({ pageIndex: r.data.pageIndex, pageSize: r.data.pageSize, totalCount: r.data.totalCount, totalPage: r.data.totalPage }); }
    } finally { dispatch(setIsLoading(false)); }
  }, [pageIndex, pageSize]);

  const handleSubmit = async (values: EmailTemplatesRequest) => {
    const payload = currentItem ? { ...values, id: currentItem.id } : values;
    const r = currentItem
      ? await emailTemplatesService.update(payload)
      : await emailTemplatesService.create(payload);
    if (r.status) { message.success(currentItem ? "Cập nhật thành công" : "Thêm mới thành công"); form.resetFields(); setIsOpenModal(false); setCurrentItem(undefined); handleFetch(); }
    else message.error(r.message || "Lưu thất bại");
  };

  useEffect(() => {
    if (isOpenModal && currentItem) {
      emailTemplatesService.getById(currentItem.id).then((r) => {
        if (r.data) {
          const d = r.data;
          form.setFieldsValue({
            code: d.code || "",
            subject: d.subject || "",
            body: d.body || "",
            bodyType: d.bodyType || "html",
            variables: d.variables || "",
            description: d.description || "",
            isActive: d.isActive ?? true,
          });
        }
      });
    } else { form.resetFields(); form.setFieldsValue({ bodyType: "html", isActive: true }); }
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
          <Form form={searchForm} layout="vertical" onFinish={(v) => { const s: EmailTemplatesSearch = { code: v.code, subject: v.subject, pageIndex: 1, pageSize: 20 }; setSearchValues(s); handleFetch(s); }}>
            <Row gutter={16}>
              <Col md={6}><Form.Item label="Mã template" name="code"><Input placeholder="VD: RESET_PASSWORD" /></Form.Item></Col>
              <Col md={6}><Form.Item label="Tiêu đề" name="subject"><Input placeholder="Tìm tiêu đề..." /></Form.Item></Col>
              <Col md={4} style={{ display: "flex", alignItems: "end" }}><Form.Item><Button type="primary" htmlType="submit">Tìm</Button></Form.Item></Col>
            </Row>
          </Form>
        </Card>
      )}
      <Card bodyStyle={{ padding: 12 }}>
        <Table<EmailTemplatesDto> columns={tableColumns} bordered dataSource={dataList} rowKey="id" scroll={{ x: 1200 }} pagination={false} loading={loading} />
        <Flex justifyContent="flex-end" style={{ marginTop: 16 }}>
          <Pagination total={dataPage?.totalCount || 0} current={pageIndex} pageSize={pageSize} showSizeChanger showTotal={(t, r) => `${r[0]}-${r[1]} trong ${t} mẫu email`} onChange={(p, s) => { setPageIndex(p); if (s !== pageSize) setPageSize(s); }} />
        </Flex>
      </Card>

      {/* Modal tạo/sửa */}
      <Modal title={currentItem ? "Chỉnh sửa mẫu email" : "Thêm mới mẫu email"} open={isOpenModal} onOk={() => form.submit()} onCancel={() => { setIsOpenModal(false); setCurrentItem(undefined); }} okText="Xác nhận" cancelText="Đóng" width={800} destroyOnClose>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Mã template" name="code" rules={[{ required: true }]}><Input placeholder="VD: WELCOME_USER" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Kiểu nội dung" name="bodyType"><Select options={[{ label: "HTML", value: "html" }, { label: "Text", value: "text" }]} /></Form.Item></Col>
            <Col span={24}><Form.Item label="Tiêu đề" name="subject" rules={[{ required: true }]}><Input placeholder="Hỗ trợ biến: {{full_name}}" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Trạng thái" name="isActive"><Select options={[{ label: "Hoạt động", value: true }, { label: "Ngừng", value: false }]} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Biến sử dụng" name="variables"><Input placeholder='["full_name","otp"]' /></Form.Item></Col>
            <Col span={24}><Form.Item label="Mô tả" name="description"><Input.TextArea rows={2} /></Form.Item></Col>
            <Col span={24}><Form.Item label="Nội dung email (HTML)" name="body" rules={[{ required: true }]}>
              <Input.TextArea rows={10} placeholder="<h1>Xin chào {{full_name}}</h1>" onChange={(e) => {
                const matches = e.target.value.match(/\{\{(\w+)\}\}/g);
                if (matches) {
                  const vars = [...new Set(matches.map((m) => m.replace(/\{|\}/g, "")))];
                  form.setFieldsValue({ variables: JSON.stringify(vars) });
                }
              }} />
            </Form.Item></Col>
            <Col span={24}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Xem trước:</div>
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: 16, minHeight: 100, maxHeight: 300, overflow: "auto", background: "#fafafa" }}>
                  <Form.Item noStyle shouldUpdate={(prev, cur) => prev.body !== cur.body}>
                    {() => <div dangerouslySetInnerHTML={{ __html: form.getFieldValue("body") || '<p style="color:#999">Nhập nội dung HTML ở trên để xem trước...</p>' }} />}
                  </Form.Item>
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Drawer chi tiết */}
      <Drawer title="Chi tiết mẫu email" width={640} open={isOpenDetail} onClose={() => { setIsOpenDetail(false); setCurrentItem(undefined); }}>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="Mã template">{currentItem?.code || "-"}</Descriptions.Item>
          <Descriptions.Item label="Tiêu đề">{currentItem?.subject || "-"}</Descriptions.Item>
          <Descriptions.Item label="Kiểu">{currentItem?.bodyType || "-"}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái"><Tag color={currentItem?.isActive ? "green" : "default"}>{currentItem?.isActive ? "Hoạt động" : "Ngừng"}</Tag></Descriptions.Item>
          <Descriptions.Item label="Biến">{currentItem?.variables || "-"}</Descriptions.Item>
          <Descriptions.Item label="Mô tả">{currentItem?.description || "-"}</Descriptions.Item>
          <Descriptions.Item label="Nội dung">
            {currentItem?.body ? <div dangerouslySetInnerHTML={{ __html: currentItem.body }} style={{ maxHeight: 400, overflow: "auto" }} /> : "-"}
          </Descriptions.Item>
        </Descriptions>
      </Drawer>

      {/* Modal preview HTML */}
      <Modal title="Xem trước nội dung email" open={isPreviewVisible} onCancel={() => setIsPreviewVisible(false)} footer={null} width={700}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 4, padding: 16, maxHeight: 500, overflow: "auto", background: "#fff" }}>
          <div dangerouslySetInnerHTML={{ __html: form.getFieldValue("body") || "<p style='color:#999'>Chưa có nội dung</p>" }} />
        </div>
      </Modal>
    </>
  );
};

export default withAuthorization(Page, "");
