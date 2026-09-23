import { Form, FormProps, Input, InputNumber, Modal, Row, Col, Select, TreeSelect, message } from "antd";
import React, { useEffect, useState } from "react";
import { NavMenuDto, NavMenuRequest } from "@/types/navMenu";
import navMenuService from "@/services/navMenu/navMenu.service";

interface Props {
  isOpen: boolean;
  menuItem?: NavMenuDto | null;
  initialParentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState<boolean>(props.isOpen);
  const [parentOptions, setParentOptions] = useState<NavMenuDto[]>([]);

  const loadParentOptions = async () => {
    try {
      const r = await navMenuService.getData({ pageIndex: 1, pageSize: 1000, menuType: "MEGA" });
      if (r.status && r.data) {
        setParentOptions(r.data.items || []);
      }
    } catch (e) {
      console.error("Lỗi khi load danh sách menu cha:", e);
    }
  };

  const handleOnFinish: FormProps<NavMenuRequest>["onFinish"] = async (
    formData: NavMenuRequest,
  ) => {
    try {
      if (props.menuItem) {
        const response = await navMenuService.update({ ...formData, id: props.menuItem.id, menuType: "MEGA" });
        if (response.status) {
          message.success("Chỉnh sửa menu thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          message.error(response.message || "Chỉnh sửa menu thất bại");
        }
      } else {
        const response = await navMenuService.create({ ...formData, menuType: "MEGA" });
        if (response.status) {
          message.success("Thêm mới menu thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          message.error(response.message || "Thêm mới menu thất bại");
        }
      }
    } catch (error: any) {
      message.error("Có lỗi xảy ra: " + (error.message || error));
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    form.resetFields();
    props.onClose();
  };

  useEffect(() => {
    setIsOpen(props.isOpen);
    if (props.isOpen) {
      loadParentOptions();
      if (props.menuItem) {
        form.setFieldsValue({
          id: props.menuItem.id,
          label: props.menuItem.label,
          href: props.menuItem.href,
          parentId: props.menuItem.parentId || undefined,
          sortOrder: props.menuItem.sortOrder,
          isActive: props.menuItem.isActive,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          isActive: true,
          sortOrder: 1,
          parentId: props.initialParentId || undefined,
        });
      }
    }
  }, [props.isOpen, props.menuItem, props.initialParentId]);

  const buildTreeSelectData = (items: NavMenuDto[]): any[] => {
    const itemMap: { [key: string]: any } = {};
    items.forEach((item) => {
      itemMap[item.id] = {
        title: item.label,
        value: item.id,
        key: item.id,
        parentId: item.parentId,
        sortOrder: item.sortOrder,
        children: [],
      };
    });

    const roots: any[] = [];
    items.forEach((item) => {
      const mappedItem = itemMap[item.id];
      if (item.parentId && itemMap[item.parentId]) {
        itemMap[item.parentId].children.push(mappedItem);
      } else {
        roots.push(mappedItem);
      }
    });

    const filterSelfAndDescendants = (nodes?: any[]): any[] => {
      if (!nodes) return [];
      return nodes
        .filter((node) => !props.menuItem || node.value !== props.menuItem.id)
        .map((node) => {
          const filteredChildren = filterSelfAndDescendants(node.children);
          const mappedNode = { ...node };
          if (filteredChildren.length > 0) {
            mappedNode.children = filteredChildren.sort((a, b) => a.sortOrder - b.sortOrder);
          } else {
            delete mappedNode.children;
          }
          return mappedNode;
        });
    };

    const cleanChildren = (node: any) => {
      if (node.children && node.children.length > 0) {
        node.children.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
        node.children.forEach(cleanChildren);
      } else {
        delete node.children;
      }
    };

    roots.forEach(cleanChildren);
    const filteredRoots = filterSelfAndDescendants(roots);
    return filteredRoots.sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const treeSelectData = buildTreeSelectData(parentOptions);

  return (
    <Modal
      title={
        props.menuItem != null ? "Chỉnh sửa menu phụ" : "Thêm mới menu phụ"
      }
      open={isOpen}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Xác nhận"
      cancelText="Đóng"
      width={600}
    >
      <Form
        layout="vertical"
        form={form}
        name="formCreateUpdateNavMenuPhu"
        onFinish={handleOnFinish}
        autoComplete="off"
        style={{ marginTop: 16 }}
      >
        {props.menuItem && (
          <Form.Item<NavMenuRequest> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        
        <Form.Item<NavMenuRequest>
          label="Nhãn hiển thị"
          name="label"
          rules={[{ required: true, message: "Vui lòng nhập nhãn hiển thị" }]}
        >
          <Input placeholder="Ví dụ: Dịch vụ công trực tuyến, Tin tức & Sự kiện..." maxLength={250} />
        </Form.Item>

        <Form.Item<NavMenuRequest>
          label="Đường dẫn (Href)"
          name="href"
          rules={[{ required: true, message: "Vui lòng nhập đường dẫn" }]}
        >
          <Input placeholder="Ví dụ: /, /dich-vu-cong, /tin-tuc..." maxLength={500} />
        </Form.Item>

        <Form.Item<NavMenuRequest>
          label="Menu cha"
          name="parentId"
        >
          <TreeSelect
            placeholder="Chọn menu cha (nếu có)"
            allowClear
            treeData={treeSelectData}
            treeDefaultExpandAll
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<NavMenuRequest>
              label="Thứ tự hiển thị"
              name="sortOrder"
              rules={[{ required: true, message: "Vui lòng nhập thứ tự" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<NavMenuRequest>
              label="Trạng thái"
              name="isActive"
              rules={[{ required: true }]}
            >
              <Select style={{ width: "100%" }}>
                <Select.Option value={true}>Hoạt động</Select.Option>
                <Select.Option value={false}>Tạm ngưng</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateOrUpdate;
