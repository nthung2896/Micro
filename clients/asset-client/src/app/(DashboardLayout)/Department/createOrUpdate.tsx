"use client";
import departmentService from "@/services/department/department.service";
import tinhService from "@/services/tinh/tinh.service";
import { DepartmentType } from "@/types/department/dto";
import {
  ConfigProvider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
  TreeSelect,
  message,
} from "antd";
import { useEffect, useState } from "react";

type TreeNode = {
  id: string;
  title: string;
  children?: TreeNode[];
};

interface Props {
  isOpen: boolean;
  data?: DepartmentType | null;
  parent?: DepartmentType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const LOAI_OPTIONS = [
  { label: "Bộ / Cục", value: "BO_CUC" },
  { label: "Sở / Ban", value: "SO_BAN" },
  { label: "Phòng / Ban", value: "PHONG_BAN" },
  { label: "Vụ", value: "VU" },
  { label: "Đơn vị khác", value: "KHAC" },
];

const CreateOrUpdate: React.FC<Props> = ({
  isOpen,
  data,
  parent,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [tinhOptions, setTinhOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingTinh, setLoadingTinh] = useState(false);

  const isEdit = !!data;

  // Load tree & provinces mỗi khi mở modal
  useEffect(() => {
    if (!isOpen) return;
    departmentService.getDepartmentsWithHierarchy().then((r) => {
      const data = Array.isArray(r?.data) ? (r.data as unknown as any[]) : [];
      
      const sortTree = (nodes: any[]) => {
        nodes.sort((a, b) => (a.priority ?? 9999) - (b.priority ?? 9999));
        nodes.forEach(n => {
          if (n.children && n.children.length > 0) {
            sortTree(n.children);
          }
        });
        return nodes;
      };

      setTree(sortTree([...data]));
    });

    const fetchTinh = async () => {
      setLoadingTinh(true);
      try {
        const res = await tinhService.getData({ pageIndex: 1, pageSize: 200 });
        const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
        setTinhOptions(
          items.map((x: any) => ({
            label: x.tenDv ?? x.tenTinh ?? x.name,
            value: x.maTinh ?? x.code,
          }))
        );
      } catch (e) {
        message.error("Không tải được danh sách tỉnh/thành");
      } finally {
        setLoadingTinh(false);
      }
    };
    fetchTinh();
  }, [isOpen]);

  // Reset form mỗi khi đổi sang record khác (data.id thay đổi)
  // Phải resetFields TRƯỚC setFieldsValue để clear value cũ
  useEffect(() => {
    if (!isOpen) return;
    form.resetFields();
    if (data) {
      form.setFieldsValue({
        id: data.id,
        name: data.name,
        shortName: data.shortName,
        code: data.code,
        parentId: data.parentId,
        loai: data.loai,
        diaDanh: data.diaDanh,
        maTinh: data.maTinh,
        address: data.address,
        hotline: data.hotline,
        email: data.email,
        priority: data.priority ?? 1,
        level: data.level ?? 1,
        isActive: data.isActive ?? true,
      });
    } else {
      form.setFieldsValue({
        parentId: parent?.id,
        level: parent ? (parent.level ?? 0) + 1 : 1,
        priority: 1,
        isActive: true,
        loai: parent ? "PHONG_BAN" : "BO_CUC",
        maTinh: undefined,
      });
    }
  }, [isOpen, data?.id, parent?.id, form, data, parent]);

  // AntD TreeSelect: convert DepartmentTree → TreeData
  const treeData = (nodes: TreeNode[]): unknown[] =>
    nodes.map((n) => ({
      title: n.title,
      value: n.id,
      key: n.id,
      // Không cho chọn chính nó hoặc con của nó làm parent (chống cycle)
      disabled: data?.id === n.id,
      children: n.children?.length ? treeData(n.children) : undefined,
    }));

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload = {
        ...values,
        id: data?.id || undefined,
        level: values.level ?? 1,
        isActive: values.isActive ?? true,
        loai: values.loai || "KHAC",
        idcha: values.parentId || "",
        idchinhno: data?.id || "",
      };
      if (isEdit) {
        await departmentService.update(payload);
        message.success("Cập nhật đơn vị thành công");
      } else {
        await departmentService.create(payload);
        message.success("Thêm đơn vị thành công");
      }
      onSuccess();
    } catch (err) {
      if (typeof err === "string") message.error(err);
      else if (err && typeof err === "object" && "errorFields" in err) {
        // form validation error — AntD đã hiện inline
      } else {
        message.error("Lưu thất bại");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            headerBg: "#0355a2",
            titleColor: "#ffffff",
            footerBg: "#f5f5f5",
          },
        },
      }}
    >
      <Modal
        open={isOpen}
        title={
          <span style={{ color: "#ffffff", fontWeight: 600, fontSize: "16px" }}>
            {isEdit ? "Chỉnh sửa đơn vị" : "Thêm đơn vị mới"}
          </span>
        }
        styles={{
          header: {
            padding: "16px 24px",
          },
          footer: {
            padding: "12px 24px",
            borderTop: "1px solid #e8e8e8",
          },
        }}
        closeIcon={<span style={{ color: "#ffffff", fontSize: "20px" }}>×</span>}
        onCancel={onClose}
        onOk={handleOk}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={submitting}
        width={620}
        forceRender
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên đơn vị"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên đơn vị" }]}
          >
            <Input placeholder="VD: Sở Công Thương Hà Nội" maxLength={250} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Tên ngắn" name="shortName">
              <Input placeholder="VD: SCT Hà Nội" maxLength={100} />
            </Form.Item>
            <Form.Item
              label="Mã"
              name="code"
              rules={[{ required: true, message: "Vui lòng nhập mã" }]}
            >
              <Input placeholder="VD: SCT_HN" maxLength={50} />
            </Form.Item>
          </div>

          <Form.Item label="Đơn vị cha" name="parentId">
            <TreeSelect
              allowClear
              showSearch
              treeNodeFilterProp="title"
              placeholder="Chọn đơn vị cha (để trống = cấp gốc)"
              treeData={treeData(tree) as never}
              treeDefaultExpandAll={false}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Loại đơn vị" name="loai">
              <Select options={LOAI_OPTIONS} placeholder="Chọn loại" />
            </Form.Item>
            <Form.Item label="Địa danh" name="diaDanh">
              <Input placeholder="VD: Hà Nội" maxLength={100} />
            </Form.Item>
          </div>

          <Form.Item label="Mã tỉnh" name="maTinh">
            <Select
              allowClear
              showSearch
              placeholder="Chọn tỉnh/thành phố (nếu có)"
              loading={loadingTinh}
              optionFilterProp="label"
              options={tinhOptions}
              filterOption={(input, option) =>
                ((option?.label as string) ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase()) ||
                ((option?.value as string) ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item label="Địa chỉ" name="address">
            <Input placeholder="VD: 25 Ngô Quyền - Hoàn Kiếm - Hà Nội" maxLength={250} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Hotline" name="hotline">
              <Input placeholder="VD: 024 222 05 512" maxLength={50} />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ type: "email", message: "Email không hợp lệ" }]}
            >
              <Input placeholder="VD: lienhe@congthuong.gov.vn" maxLength={100} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Form.Item label="Cấp" name="level">
              <InputNumber min={1} max={10} className="w-full!" />
            </Form.Item>
            <Form.Item label="Thứ tự" name="priority">
              <InputNumber min={1} className="w-full!" />
            </Form.Item>
            <Form.Item
              label="Đang dùng"
              name="isActive"
              valuePropName="checked"
            >
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default CreateOrUpdate;
