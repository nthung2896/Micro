"use client";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageInfo } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Dropdown,
  Form,
  Input,
  InputNumber,
  MenuProps,
  Modal,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  TableColumnsType,
  Tag,
  message,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import homeBlockService from "@/services/homeBlock/homeBlock.service";
import {
  DATA_SOURCE_OPTIONS,
  fetchDataSource,
} from "@/components/portal-components/dataSourceRegistry";
import DataSourceField from "@/components/portal-components/DataSourceField";
import dynamic from "next/dynamic";

// Lazy-load CodeEditor (Monaco) chỉ khi modal mở — bundle ~2MB từ CDN.
const CodeEditor = dynamic(
  () => import("@/components/portal-components/CodeEditor"),
  { ssr: false, loading: () => <div style={{ padding: 20, color: "#999" }}>Đang tải editor...</div> },
);
import { renderTemplate } from "@/components/portal-components/templateEngine";
import UsageGuideDrawer from "@/components/portal-components/UsageGuideDrawer";
import {
  HomeBlockDto,
  HomeBlockRequest,
  HomeBlockSearch,
} from "@/types/homeBlock";

const POSITION_OPTIONS = [
  { label: "Trang chủ Portal", value: "home" },
  { label: "Trang chủ Portal cho sở", value: "deptHome" },
  { label: "Trang Giới thiệu", value: "about" },
  { label: "Trang Trợ giúp", value: "help" },
];

function BlockPreview({ body, dataSource }: { body: string; dataSource: string }) {
  const [data, setData] = useState<Record<string, any>>({});
  useEffect(() => {
    let cancelled = false;
    fetchDataSource(dataSource)
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setData({}));
    return () => {
      cancelled = true;
    };
  }, [dataSource]);
  const html = body
    ? renderTemplate(body, data)
    : '<p style="color:#999">Nhập nội dung HTML ở trên để xem trước...</p>';
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

const Page: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [dataList, setDataList] = useState<HomeBlockDto[]>([]);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [searchValues, setSearchValues] = useState<HomeBlockSearch | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [currentItem, setCurrentItem] = useState<HomeBlockDto | undefined>();
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);
  const [form] = Form.useForm<HomeBlockRequest>();
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [searchForm] = Form.useForm();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const tableColumns: TableColumnsType<HomeBlockDto> = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_: any, __: any, i: number) =>
        pageSize * (pageIndex - 1) + i + 1,
    },
    { title: "Mã khối", dataIndex: "code", width: 180 },
    { title: "Tiêu đề", dataIndex: "title", width: 280 },
    {
      title: "Vị trí",
      dataIndex: "position",
      width: 140,
      render: (v: string) =>
        POSITION_OPTIONS.find((p) => p.value === v)?.label || v || "-",
    },
    {
      title: "Thứ tự",
      dataIndex: "sortOrder",
      width: 90,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      width: 120,
      align: "center",
      render: (v: boolean) => (
        <Tag color={v ? "green" : "default"}>
          {v ? "Hoạt động" : "Ngừng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_: any, record: HomeBlockDto) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "detail",
            icon: <EyeOutlined />,
            onClick: () => {
              setCurrentItem(record);
              setIsOpenDetail(true);
            },
          },
          {
            label: "Chỉnh sửa",
            key: "edit",
            icon: <EditOutlined />,
            onClick: () => {
              setCurrentItem(record);
              setIsOpenModal(true);
            },
          },
          {
            label: "Xóa",
            key: "delete",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => setOpenPopconfirmId(record.id ?? ""),
          },
        ];
        return (
          <>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button onClick={(e) => e.preventDefault()} color="primary">
                <Space>
                  Thao tác
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Popconfirm
              title="Xác nhận xóa"
              okText="Xóa"
              cancelText="Hủy"
              open={openPopconfirmId === record.id}
              onConfirm={() => {
                handleDelete(record.id || "");
                setOpenPopconfirmId(null);
              }}
              onCancel={() => setOpenPopconfirmId(null)}
            />
          </>
        );
      },
    },
  ];

  const handleDelete = async (id: string) => {
    const r = await homeBlockService.delete(id);
    if (r.status) {
      message.success("Xóa thành công");
      handleFetch();
    }
  };

  const handleFetch = useCallback(
    async (s?: HomeBlockSearch) => {
      dispatch(setIsLoading(true));
      try {
        const param = s || { pageIndex, pageSize, ...searchValues };
        const r = await homeBlockService.getData(param as HomeBlockSearch);
        if (r?.data) {
          setDataList(r.data.items);
          setDataPage({
            pageIndex: r.data.pageIndex,
            pageSize: r.data.pageSize,
            totalCount: r.data.totalCount,
            totalPage: r.data.totalPage,
          });
        }
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [pageIndex, pageSize],
  );

  const handleSubmit = async (values: HomeBlockRequest) => {
    const payload = currentItem ? { ...values, id: currentItem.id } : values;
    const r = currentItem
      ? await homeBlockService.update(payload)
      : await homeBlockService.create(payload);
    if (r.status) {
      message.success(
        currentItem ? "Cập nhật thành công" : "Thêm mới thành công",
      );
      form.resetFields();
      setIsOpenModal(false);
      setCurrentItem(undefined);
      handleFetch();
    } else message.error(r.message || "Lưu thất bại");
  };

  useEffect(() => {
    if (isOpenModal && currentItem) {
      homeBlockService.getById(currentItem.id).then((r) => {
        if (r.data) {
          const d = r.data;
          form.setFieldsValue({
            code: d.code || "",
            title: d.title || "",
            body: d.body || "",
            variables: d.variables || "",
            position: d.position || "home",
            sortOrder: d.sortOrder ?? 0,
            dataSource: d.dataSource || "",
            description: d.description || "",
            isActive: d.isActive ?? true,
          });
        }
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        position: "home",
        sortOrder: 0,
        dataSource: "",
      });
    }
  }, [isOpenModal, currentItem]);
  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ marginBottom: 10 }}
      >
        <AutoBreadcrumb />
      </Flex>
      <Flex
        justifyContent="flex-end"
        style={{ marginBottom: 10, gap: 8 }}
      >
        <Button
          icon={<QuestionCircleOutlined />}
          onClick={() => setIsGuideOpen(true)}
        >
          Hướng dẫn
        </Button>
        <Button
          icon={<SearchOutlined />}
          onClick={() => setIsPanelVisible(!isPanelVisible)}
        >
          Tìm kiếm
        </Button>
        <Button
          color="green" variant="solid"
          icon={<PlusCircleOutlined />}
          onClick={() => {
            setCurrentItem(undefined);
            setIsOpenModal(true);
          }}
        >
          Thêm mới
        </Button>
      </Flex>
      {isPanelVisible && (
        <Card bodyStyle={{ padding: 16 }} style={{ marginBottom: 12 }}>
          <Form
            form={searchForm}
            layout="vertical"
            onFinish={(v) => {
              const s: HomeBlockSearch = {
                code: v.code,
                title: v.title,
                position: v.position,
                pageIndex: 1,
                pageSize: 20,
              };
              setSearchValues(s);
              handleFetch(s);
            }}
          >
            <Row gutter={16}>
              <Col md={6}>
                <Form.Item label="Mã khối" name="code">
                  <Input placeholder="VD: HOME_HERO" />
                </Form.Item>
              </Col>
              <Col md={6}>
                <Form.Item label="Tiêu đề" name="title">
                  <Input placeholder="Tìm tiêu đề..." />
                </Form.Item>
              </Col>
              <Col md={6}>
                <Form.Item label="Vị trí" name="position">
                  <Select
                    allowClear
                    options={POSITION_OPTIONS}
                    placeholder="Chọn vị trí"
                  />
                </Form.Item>
              </Col>
              <Col
                md={4}
                style={{ display: "flex", alignItems: "end" }}
              >
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Tìm
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      )}
      <Card bodyStyle={{ padding: 12 }}>
        <Table<HomeBlockDto>
          columns={tableColumns}
          bordered
          dataSource={dataList}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={false}
          loading={loading}
        />
        <Flex justifyContent="flex-end" style={{ marginTop: 16 }}>
          <Pagination
            total={dataPage?.totalCount || 0}
            current={pageIndex}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(t, r) => `${r[0]}-${r[1]} trong ${t} khối`}
            onChange={(p, s) => {
              setPageIndex(p);
              if (s !== pageSize) setPageSize(s);
            }}
          />
        </Flex>
      </Card>

      {/* Modal tạo/sửa */}
      <Modal
        title={currentItem ? "Chỉnh sửa khối giao diện" : "Thêm mới khối giao diện"}
        open={isOpenModal}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsOpenModal(false);
          setCurrentItem(undefined);
        }}
        okText="Xác nhận"
        cancelText="Đóng"
        width="98vw"
        style={{ top: 10, maxWidth: "98vw", paddingBottom: 0 }}
        styles={{ body: { maxHeight: "calc(100vh - 160px)", overflow: "auto" } }}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Mã khối" name="code" rules={[{ required: true }]}>
                <Input placeholder="VD: HOME_HERO" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Vị trí" name="position" rules={[{ required: true }]}>
                <Select options={POSITION_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Thứ tự" name="sortOrder">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Trạng thái" name="isActive">
                <Select
                  options={[
                    { label: "Hoạt động", value: true },
                    { label: "Ngừng", value: false },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Tiêu đề" name="title" rules={[{ required: true }]}>
                <Input placeholder="Hỗ trợ biến: {{ten_bien}}" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span>
                    Nguồn dữ liệu{" "}
                    <a
                      onClick={() => setIsGuideOpen(true)}
                      style={{ fontSize: 12, marginLeft: 8 }}
                    >
                      <QuestionCircleOutlined /> Xem hướng dẫn
                    </a>
                  </span>
                }
                name="dataSource"
                tooltip="Chọn nguồn có sẵn hoặc 'Tùy chọn' để gõ thẳng URL API. Trong body dùng {{#each items}}...{{/each}} để lặp danh sách."
              >
                <DataSourceField />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Biến sử dụng" name="variables">
                <Input placeholder='Tự sinh từ body, VD: ["title","count"]' />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Mô tả" name="description">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Nội dung khối (JSX + Tailwind CSS)"
                name="body"
                rules={[{ required: true }]}
                tooltip="Viết JSX/HTML sử dụng class Tailwind. Hỗ trợ {{var}} và {{#each items}}...{{/each}}. Phím tắt: Shift+Alt+F để format."
              >
                <CodeEditor
                  language="html"
                  height="calc(100vh - 460px)"
                  onChange={(v) => {
                    form.setFieldsValue({ body: v });
                    const matches = v.match(/\{\{(\w+)\}\}/g);
                    if (matches) {
                      const vars = [
                        ...new Set(matches.map((m) => m.replace(/\{|\}/g, ""))),
                      ];
                      form.setFieldsValue({ variables: JSON.stringify(vars) });
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                Xem trước:
              </div>
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 4,
                  padding: 16,
                  height: "calc(100vh - 430px)",
                  minHeight: 330,
                  overflow: "auto",
                  background: "#fafafa",
                }}
              >
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, cur) =>
                    prev.body !== cur.body ||
                    prev.dataSource !== cur.dataSource
                  }
                >
                  {() => (
                    <BlockPreview
                      body={form.getFieldValue("body") || ""}
                      dataSource={form.getFieldValue("dataSource") || ""}
                    />
                  )}
                </Form.Item>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>

      <UsageGuideDrawer open={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Drawer chi tiết */}
      <Drawer
        title="Chi tiết khối giao diện"
        width={720}
        open={isOpenDetail}
        onClose={() => {
          setIsOpenDetail(false);
          setCurrentItem(undefined);
        }}
      >
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="Mã khối">
            {currentItem?.code || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Tiêu đề">
            {currentItem?.title || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Vị trí">
            {POSITION_OPTIONS.find((p) => p.value === currentItem?.position)
              ?.label ||
              currentItem?.position ||
              "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Thứ tự">
            {currentItem?.sortOrder ?? "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={currentItem?.isActive ? "green" : "default"}>
              {currentItem?.isActive ? "Hoạt động" : "Ngừng"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Nguồn dữ liệu">
            {DATA_SOURCE_OPTIONS.find(
              (o) => o.value === currentItem?.dataSource,
            )?.label ||
              currentItem?.dataSource ||
              "(Không có)"}
          </Descriptions.Item>
          <Descriptions.Item label="Biến">
            {currentItem?.variables || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả">
            {currentItem?.description || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Nội dung">
            {currentItem?.body ? (
              <div
                dangerouslySetInnerHTML={{ __html: currentItem.body }}
                style={{ maxHeight: 400, overflow: "auto" }}
              />
            ) : (
              "-"
            )}
          </Descriptions.Item>
        </Descriptions>
      </Drawer>
    </>
  );
};

export default withAuthorization(Page, "");
