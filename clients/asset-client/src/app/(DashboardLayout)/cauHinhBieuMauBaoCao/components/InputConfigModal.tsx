"use client";

import { BCInputConfigType } from "@/types/bcFormTemplate/dto";
import { EditOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Form, Input, Modal, Row, Select, Space, Radio } from "antd";
import { useEffect, useState } from "react";
import nhomDanhMucService from "@/services/nhomDanhMuc/nhomDanhMuc.service";

/** Static data type options */
export const DATA_TYPE_OPTIONS = [
  { label: "Văn bản", value: "TEXT" },
  { label: "Số", value: "NUMBER" },
  { label: "Ngày tháng", value: "DATE" },
  { label: "Văn bản dài", value: "TEXTAREA" },
  { label: "Danh sách chọn", value: "COMBOBOX" },
  { label: "Checkbox", value: "CHECKBOX" },
  { label: "Radio button", value: "RADIO" },
  { label: "File đính kèm", value: "FILE" },
];

interface InputConfigModalProps {
  visible: boolean;
  input: BCInputConfigType | null;
  onCancel: () => void;
  onSave: (inputKey: string, updatedValues: Partial<BCInputConfigType>) => void;
}

export default function InputConfigModal({
  visible,
  input,
  onCancel,
  onSave,
}: InputConfigModalProps) {
  const [editForm] = Form.useForm();
  const isCombobox = Form.useWatch("isCombobox", editForm);
  const [dataSourceMode, setDataSourceMode] = useState<"LOCAL" | "GLOBAL">("LOCAL");
  const [globalCategories, setGlobalCategories] = useState<{label: string, value: string}[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (visible && input) {
      editForm.setFieldsValue({
        displayName: input.displayName || input.inputKey,
        dataType: input.dataType || "TEXT",
        required: input.required || false,
        isCombobox: input.isCombobox || false,
        placeHolder: input.placeHolder || "",
        localOptions: input.localOptions || [],
        globalCategoryCode: input.globalCategoryCode || undefined,
      });
      setDataSourceMode(input.globalCategoryCode ? "GLOBAL" : "LOCAL");
    } else {
      editForm.resetFields();
      setDataSourceMode("LOCAL");
    }
  }, [visible, input, editForm]);

  useEffect(() => {
    if (visible && isCombobox && globalCategories.length === 0) {
      const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
          const res = await nhomDanhMucService.getDanhSachDanhMuc();
          if (res.data) {
            setGlobalCategories(res.data.map(x => ({ label: x.groupName || "", value: x.groupCode || "" })));
          }
        } catch (error) {
          console.error("Lỗi tải danh mục:", error);
        } finally {
          setLoadingCategories(false);
        }
      };
      fetchCategories();
    }
  }, [visible, isCombobox, globalCategories.length]);

  const handleSave = () => {
    editForm.validateFields().then((values) => {
      if (input) {
        // Prepare correct payload
        const updatedValues = { ...values };
        if (!values.isCombobox) {
          updatedValues.localOptions = [];
          updatedValues.globalCategoryCode = null;
        } else {
          if (dataSourceMode === "LOCAL") {
            updatedValues.globalCategoryCode = null;
          } else {
            updatedValues.localOptions = [];
          }
        }
        onSave(input.inputKey, updatedValues);
      }
    });
  };

  return (
    <Modal
      open={visible}
      title={
        <Space>
          <EditOutlined />
          {`Cấu hình trường: ${input?.inputKey || ""}`}
        </Space>
      }
      onCancel={onCancel}
      onOk={handleSave}
      okText="Lưu"
      cancelText="Hủy"
      width={700}
      destroyOnClose
    >
      <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="displayName"
              label="Tên hiển thị"
              rules={[{ required: true, message: "Vui lòng nhập tên hiển thị" }]}
            >
              <Input placeholder="Nhập tên hiển thị cho trường" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dataType"
              label="Kiểu dữ liệu"
              rules={[{ required: true, message: "Vui lòng chọn kiểu dữ liệu" }]}
            >
              <Select
                options={DATA_TYPE_OPTIONS}
                placeholder="Chọn kiểu dữ liệu"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="placeHolder" label="Gợi ý nhập (Placeholder)">
              <Input placeholder="Gợi ý nhập..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="required" valuePropName="checked">
              <Checkbox>Bắt buộc nhập</Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isCombobox" valuePropName="checked">
              <Checkbox>Là Combobox</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {isCombobox && (
          <div style={{ marginTop: 16, padding: 16, border: "1px dashed #d9d9d9", borderRadius: 8 }}>
            <div style={{ marginBottom: 16 }}>
              <Radio.Group 
                value={dataSourceMode} 
                onChange={(e) => setDataSourceMode(e.target.value)}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="LOCAL">Tùy chỉnh (Nhập thủ công)</Radio.Button>
                <Radio.Button value="GLOBAL">Danh mục hệ thống</Radio.Button>
              </Radio.Group>
            </div>

            {dataSourceMode === "LOCAL" && (
              <Form.List name="localOptions">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                        <Col span={11}>
                          <Form.Item
                            {...restField}
                            name={[name, 'value']}
                            rules={[{ required: true, message: 'Nhập giá trị' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="Giá trị (Value)" />
                          </Form.Item>
                        </Col>
                        <Col span={11}>
                          <Form.Item
                            {...restField}
                            name={[name, 'label']}
                            rules={[{ required: true, message: 'Nhập nhãn' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="Nhãn hiển thị (Label)" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red', cursor: 'pointer' }} />
                        </Col>
                      </Row>
                    ))}
                    <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Thêm lựa chọn
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            )}

            {dataSourceMode === "GLOBAL" && (
              <Form.Item 
                name="globalCategoryCode" 
                label="Chọn danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục hệ thống' }]}
                style={{ marginBottom: 0 }}
              >
                <Select
                  placeholder="--- Chọn danh mục hệ thống ---"
                  options={globalCategories}
                  loading={loadingCategories}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            )}
          </div>
        )}
      </Form>
    </Modal>
  );
}
