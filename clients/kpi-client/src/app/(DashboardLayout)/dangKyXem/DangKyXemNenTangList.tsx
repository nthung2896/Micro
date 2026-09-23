import React, { useEffect, useState, useRef } from "react";
import { Button, Table, Modal, Form, Select, DatePicker, message, Popconfirm, Tag, Tooltip } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { DangKyXemNenTangType } from "@/types/dang-ky-xem-nen-tang/dto";
import dangKyXemNenTangService from "@/services/dangKyXemNenTang/dangKyXemNenTang.service";
import dangKyXemService from "@/services/dangKyXem/dangKyXem.service";
import dayjs from "dayjs";

interface Props {
  dangKyXemId: string;
  readOnly?: boolean;
  onChange?: () => void;
}

const DangKyXemNenTangList: React.FC<Props> = ({ dangKyXemId, readOnly = false, onChange }) => {
  const [data, setData] = useState<DangKyXemNenTangType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [tabs, setTabs] = useState<any[]>([]);
  const [form] = Form.useForm();
  const searchTimeoutRef = useRef<any>(null);

  const handleSearchPlatform = (value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const pRes = await dangKyXemNenTangService.getDropdownPlatform(value);
        if (pRes.data) {
          setPlatforms(pRes.data);
        }
      } catch (error) {
        console.error(error);
      }
    }, 400);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await dangKyXemNenTangService.getData({
        dangKyXemIdFilter: dangKyXemId,
        pageIndex: 1,
        pageSize: 100,
      });
      if (res.data) {
        setData(res.data.items || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlatformsAndTabs = async () => {
    try {
      const pRes = await dangKyXemNenTangService.getDropdownPlatform();
      if (pRes.data) {
        setPlatforms(pRes.data);
      }
      const tRes = await dangKyXemService.getDropdowns();
      if (tRes.data && tRes.data.TABDANGKYXEM) {
        setTabs(tRes.data.TABDANGKYXEM);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (dangKyXemId) {
      loadData();
      loadPlatformsAndTabs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dangKyXemId]);

  const handleAdd = () => {
    form.resetFields();
    setIsModalOpen(true);
    loadPlatformsAndTabs();
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await dangKyXemNenTangService.delete(id);
      if (res.status) {
        message.success("Xóa thành công");
        loadData();
        if (onChange) onChange();
      } else {
        message.error(res.message || "Lỗi khi xóa");
      }
    } catch (error) {
      console.error(error);
      message.error("Đã xảy ra lỗi");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        dangKyXemId,
        platformId: values.platformId,
        noiDungXem: values.noiDungXem ? values.noiDungXem.join(",") : "",
        tuNgay: values.tuNgay
          ? values.tuNgay.format('YYYY-MM-DD')
          : undefined,
        denNgay: values.denNgay
          ? values.denNgay.format('YYYY-MM-DD')
          : undefined,

      };

      const res = await dangKyXemNenTangService.create(payload);
      if (res.status) {
        message.success("Thêm thành công");
        setIsModalOpen(false);
        loadData();
        if (onChange) onChange();
      } else {
        message.error(res.message || "Lỗi khi thêm");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderTabs = (noiDungXem: string) => {
    if (!noiDungXem) return "—";
    const selectedTabs = noiDungXem.split(",").filter(Boolean);
    return selectedTabs.map(t => {
      const tabOption = tabs.find(x => x.value === t);
      return <Tag key={t} color="blue">{tabOption?.label || t}</Tag>;
    });
  };

  const columns = [
    {
      title: "Nền tảng",
      dataIndex: "platformName",
      key: "platformName",
    },
    {
      title: "Nội dung xem (Tabs)",
      dataIndex: "noiDungXem",
      key: "noiDungXem",
      render: (text: string) => renderTabs(text),
    },
    {
      title: "Từ ngày",
      dataIndex: "tuNgay",
      key: "tuNgay",
      render: (val: string) => val ? dayjs(val).format("DD/MM/YYYY") : "—",
    },
    {
      title: "Đến ngày",
      dataIndex: "denNgay",
      key: "denNgay",
      render: (val: string) => val ? dayjs(val).format("DD/MM/YYYY") : "—",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      render: (_: any, record: DangKyXemNenTangType) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa?"
          onConfirm={() => handleDelete(record.id!)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Tooltip title="Xóa">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ].filter(col => {
    if (readOnly && col.key === "action") return false;
    return true;
  });

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontWeight: 600 }}>Danh sách nền tảng gắn kèm</h4>
        {!readOnly && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Gắn nền tảng
          </Button>
        )}
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={false}
        loading={loading}
        size="small"
        bordered
      />

      <Modal
        title="Gắn nền tảng"
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="platformId"
            label="Chọn nền tảng"
            rules={[{ required: true, message: "Vui lòng chọn nền tảng" }]}
          >
            <Select
              showSearch
              placeholder="Chọn nền tảng"
              options={platforms}
              filterOption={false}
              onSearch={handleSearchPlatform}
              notFoundContent={null}
            />
          </Form.Item>

          <Form.Item
            name="noiDungXem"
            label="Nội dung xem (Tabs)"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 tab" }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn tab cho phép xem"
              options={tabs}
            />
          </Form.Item>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item name="tuNgay" label="Từ ngày" style={{ flex: 1 }}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
            </Form.Item>
            <Form.Item name="denNgay" label="Đến ngày" style={{ flex: 1 }}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default DangKyXemNenTangList;
