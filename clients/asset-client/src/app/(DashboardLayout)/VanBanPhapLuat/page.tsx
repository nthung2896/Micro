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
import vanBanPhapLuatService from "@/services/vanBanPhapLuat/vanBanPhapLuat.service";
import { VanBanPhapLuatDto, VanBanPhapLuatSearch, VanBanPhapLuatCreateRequest } from "@/types/vanBanPhapLuat";
import { LOAI_VAN_BAN } from "@/constants/LoaiVanBanConstant";
import axios from "axios";

const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";

const Page: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [dataList, setDataList] = useState<VanBanPhapLuatDto[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [searchValues, setSearchValues] = useState<VanBanPhapLuatSearch | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [currentItem, setCurrentItem] = useState<VanBanPhapLuatDto | undefined>();
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);
  const [form] = Form.useForm<VanBanPhapLuatCreateRequest>();
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [searchForm] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [filePath, setFilePath] = useState<string>("");

  const tableColumns: TableColumnsType<VanBanPhapLuatDto> = [
    { title: "STT", width: 60, align: "center", render: (_: any, __: any, i: number) => pageSize * (pageIndex - 1) + i + 1 },
    { title: "Số hiệu", dataIndex: "soHieu", width: 150 },
    { title: "Tên văn bản", dataIndex: "tenVanBan", width: 350 },
    { title: "Đơn vị ban hành", dataIndex: "donViBanHanh", width: 160 },
    { title: "Ngày ban hành", dataIndex: "ngayBanHanh", width: 130, align: "center", render: (v: string) => v ? new Date(v).toLocaleDateString("vi-VN") : "-" },
    { title: "Loại", dataIndex: "loaiVanBan", width: 100 },
    { title: "Trạng thái", dataIndex: "trangThai", width: 110, align: "center", render: (v: number) => <Tag color={v === 1 ? "green" : v === 2 ? "red" : "default"}>{v === 1 ? "Hiệu lực" : v === 2 ? "Hết hiệu lực" : "Nháp"}</Tag> },
    {
      title: "Đính kèm", width: 150, align: "center",
      render: (_: any, record: any) => record.fileDinhKem ? (
        <a href={`${staticUrl}/${record.fileDinhKem}`} target="_blank" rel="noreferrer"><FileOutlined style={{ color: "#0355a2", fontSize: 16 }} /> Tải xuống</a>
      ) : "-",
    },
    {
      title: "Thao tác", width: 120, align: "center", fixed: "right",
      render: (_: any, record: VanBanPhapLuatDto) => {
        const items: MenuProps["items"] = [
          { label: "Chỉnh sửa", key: "edit", icon: <EditOutlined />, onClick: () => { setCurrentItem(record); setIsOpenModal(true); } },
          { label: "Xóa", key: "delete", icon: <DeleteOutlined />, danger: true, onClick: () => setOpenPopconfirmId(record.id ?? "") },
        ];
        return (<><Dropdown menu={{ items }} trigger={["click"]}><Button onClick={(e) => e.preventDefault()} color="primary"><Space>Thao tác<DownOutlined /></Space></Button></Dropdown><Popconfirm title="Xác nhận xóa" okText="Xóa" cancelText="Hủy" open={openPopconfirmId === record.id} onConfirm={() => { handleDelete(record.id || ""); setOpenPopconfirmId(null); }} onCancel={() => setOpenPopconfirmId(null)} /></>);
      },
    },
  ];

  const handleDelete = async (id: string) => { const r = await vanBanPhapLuatService.delete(id); if (r.status) { message.success("Xóa thành công"); handleFetch(); } };

  const handleFetch = useCallback(async (s?: VanBanPhapLuatSearch) => {
    dispatch(setIsLoading(true));
    try {
      const param = s || { pageIndex, pageSize, ...searchValues };
      const r = await vanBanPhapLuatService.getData(param as VanBanPhapLuatSearch);
      if (r?.data) { setDataList(r.data.items); setDataPage({ pageIndex: r.data.pageIndex, pageSize: r.data.pageSize, totalCount: r.data.totalCount, totalPage: r.data.totalPage }); }
    } finally { dispatch(setIsLoading(false)); }
  }, [pageIndex, pageSize]);

  const handleUploadFile = (file: File) => {
    const formData = new FormData();
    formData.append("Files", file);
    formData.append("FileType", "van-ban");
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

  const handleSubmit = async (values: VanBanPhapLuatCreateRequest) => {
    const payload: any = currentItem ? { ...values, id: currentItem.id } : values;
    if (filePath) payload.fileDinhKem = filePath;
    const r = await vanBanPhapLuatService.createOrUpdate(payload);
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
              <Col md={8}><Form.Item label="Từ khóa" name="keyword"><Input placeholder="Số hiệu, tên văn bản..." /></Form.Item></Col>
              <Col md={4} style={{ display: "flex", alignItems: "end" }}><Form.Item><Button type="primary" htmlType="submit">Tìm</Button></Form.Item></Col>
            </Row>
          </Form>
        </Card>
      )}
      <Card bodyStyle={{ padding: 12 }}>
        <Table<VanBanPhapLuatDto> columns={tableColumns} bordered dataSource={dataList} rowKey="id" scroll={{ x: 1300 }} pagination={false} loading={loading} />
        <Flex justifyContent="flex-end" style={{ marginTop: 16 }}>
          <Pagination total={dataPage?.totalCount || 0} current={pageIndex} pageSize={pageSize} showSizeChanger showTotal={(t, r) => `${r[0]}-${r[1]} trong ${t} văn bản`} onChange={(p, s) => { setPageIndex(p); if (s !== pageSize) setPageSize(s); }} />
        </Flex>
      </Card>
      <Modal title={currentItem ? "Chỉnh sửa văn bản" : "Thêm mới văn bản"} open={isOpenModal} onOk={() => form.submit()} onCancel={() => { setIsOpenModal(false); setCurrentItem(undefined); }} okText="Xác nhận" cancelText="Đóng" width={700} destroyOnClose>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={8}><Form.Item label="Số hiệu" name="soHieu" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item label="Tên văn bản" name="tenVanBan" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="Đơn vị ban hành" name="donViBanHanh"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="Ngày ban hành" name="ngayBanHanh"><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Loại văn bản" name="loaiVanBan"><Select allowClear placeholder="Chọn loại" options={LOAI_VAN_BAN.map((d) => ({ label: d.label, value: d.value }))} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Lĩnh vực" name="linhVuc"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="Trạng thái" name="trangThai"><Select options={[{ label: "Nháp", value: 0 }, { label: "Hiệu lực", value: 1 }, { label: "Hết hiệu lực", value: 2 }]} /></Form.Item></Col>
            <Col span={12}>
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
            <Col span={24}><Form.Item label="Trích yếu" name="trichYeu"><Input.TextArea rows={3} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default withAuthorization(Page, "");
