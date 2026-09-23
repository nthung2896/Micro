"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, Form, Input, message, Popconfirm, Space, Spin, Table } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import formatDate from "@/utils/formatDate";
import enterprisePlatformItemService from "@/services/enterprisePlatformItem/enterprisePlatformItem.service";
import { EnterprisePlatformItemType } from "@/types/enterprisePlatformItem/dto";

interface EnterprisePlatformItemTabProps {
  platformManageId: string;
  readOnly?: boolean;
}

type ItemFormType = {
  items: EnterprisePlatformItemType[];
};

const validateWebsiteLink = (_: unknown, value: string) => {
  if (!value || !value.trim()) {
    return Promise.reject(new Error("Vui lòng nhập link website"));
  }
  const candidate = value.includes("://") ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return Promise.reject(new Error("Link website không hợp lệ"));
    }
    return Promise.resolve();
  } catch {
    return Promise.reject(new Error("Link website không hợp lệ"));
  }
};

const EnterprisePlatformItemTab: React.FC<EnterprisePlatformItemTabProps> = ({
  platformManageId,
  readOnly = false,
}) => {
  const [form] = Form.useForm<ItemFormType>();
  const [loading, setLoading] = useState<boolean>(false);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [items, setItems] = useState<EnterprisePlatformItemType[]>([]);

  const handleLoadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await enterprisePlatformItemService.getByPlatformManageId(platformManageId);
      const data = response?.status && response.data ? response.data : [];
      form.setFieldsValue({ items: data });
      setItems(data);
    } catch {
      message.error("Không tải được danh sách nền tảng tích hợp");
    } finally {
      setLoading(false);
    }
  }, [platformManageId, form]);

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  const handleSaveRow = async (name: number) => {
    try {
      await form.validateFields([
        ["items", name, "name"],
        ["items", name, "websiteLink"],
        ["items", name, "note"],
      ]);
      const items = form.getFieldValue("items") as EnterprisePlatformItemType[];
      const current = items[name];

      setSavingIndex(name);
      const response = current?.id
        ? await enterprisePlatformItemService.update({
          id: current.id,
          platformManageId,
          name: current.name,
          websiteLink: current.websiteLink,
          note: current.note,
        })
        : await enterprisePlatformItemService.create({
          platformManageId,
          name: current.name,
          websiteLink: current.websiteLink,
          note: current.note,
        });

      if (response?.status) {
        message.success(current?.id ? "Cập nhật thành công" : "Thêm mới thành công");
        setEditingIndex(null);
        await handleLoadData();
      } else {
        message.error(response?.message ?? "Thao tác thất bại");
      }
    } catch (err: any) {
      if (err?.errorFields) return; // lỗi validate form, không cần thông báo thêm
      message.error("Có lỗi xảy ra");
    } finally {
      setSavingIndex(null);
    }
  };

  const handleCancelRow = (name: number, isNew: boolean, remove: (index: number) => void) => {
    if (isNew) {
      remove(name);
    } else {
      handleLoadData();
    }
    setEditingIndex(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await enterprisePlatformItemService.delete(id);
      if (response.status) {
        message.success("Xoá thành công");
        handleLoadData();
      } else {
        message.error(response.message ?? "Xoá thất bại");
      }
    } catch {
      message.error("Có lỗi khi xoá");
    } finally {
      setDeletingId(null);
    }
  };

  if (readOnly) {
    const readOnlyColumns = [
      {
        title: "#",
        width: 50,
        align: "center" as const,
        render: (_: unknown, __: EnterprisePlatformItemType, index: number) => index + 1,
      },
      {
        title: "Tên nền tảng",
        dataIndex: "name",
        render: (value: string) => value || "—",
      },
      {
        title: "Link website",
        dataIndex: "websiteLink",
        render: (value: string) =>
          value ? (
            <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noreferrer">
              {value}
            </a>
          ) : (
            "—"
          ),
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        render: (value: string) => value || "—",
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdDate",
        width: 140,
        render: (value: string) => (value ? formatDate(value, false) : "—"),
      },
    ];

    return (
      <Table
        columns={readOnlyColumns}
        dataSource={items}
        rowKey="id"
        bordered
        size="small"
        loading={loading}
        pagination={false}
        locale={{ emptyText: "Chưa có nền tảng tích hợp nào" }}
      />
    );
  }

  return (
    <>
      <Spin spinning={loading}>
        <Form form={form}>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "10px 12px", textAlign: "center", width: 50, color: "#475569", fontWeight: 600 }}>#</th>
                        <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 600 }}>
                          Tên nền tảng <span style={{ color: "#e53935", fontWeight: 700 }}>(*)</span>
                        </th>
                        <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 600 }}>
                          Link website <span style={{ color: "#e53935", fontWeight: 700 }}>(*)</span>
                        </th>
                        <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 600 }}>Ghi chú</th>
                        <th style={{ padding: "10px 12px", textAlign: "left", width: 140, color: "#475569", fontWeight: 600 }}>Ngày tạo</th>
                        <th style={{ padding: "10px 12px", textAlign: "center", width: 110, color: "#475569", fontWeight: 600 }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ padding: 16, textAlign: "center", color: "#94a3b8" }}>
                            Chưa có nền tảng tích hợp nào
                          </td>
                        </tr>
                      )}
                      {fields.map(({ key, name, ...restField }, index) => {
                        const rowValue: EnterprisePlatformItemType | undefined = form.getFieldValue(["items", name]);
                        const isNew = !rowValue?.id;
                        const isEditing = editingIndex === name;
                        const isSaving = savingIndex === name;

                        return (
                          <tr key={key} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: 12, textAlign: "center", fontWeight: 500, color: "#64748b" }}>{index + 1}</td>
                            <td style={{ padding: 12 }}>
                              {isEditing ? (
                                <Form.Item
                                  {...restField}
                                  name={[name, "name"]}
                                  rules={[{ required: true, whitespace: true, message: "Vui lòng nhập tên nền tảng" }]}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Input placeholder="Ví dụ: Shopee, Lazada,..." style={{ borderRadius: 6 }} />
                                </Form.Item>
                              ) : (
                                rowValue?.name || "—"
                              )}
                            </td>
                            <td style={{ padding: 12 }}>
                              {isEditing ? (
                                <Form.Item
                                  {...restField}
                                  name={[name, "websiteLink"]}
                                  rules={[{ validator: validateWebsiteLink }]}
                                  style={{ marginBottom: 0 }}
                                >
                                  <Input placeholder="https://..." style={{ borderRadius: 6 }} />
                                </Form.Item>
                              ) : rowValue?.websiteLink ? (
                                <a
                                  href={rowValue.websiteLink.startsWith("http") ? rowValue.websiteLink : `https://${rowValue.websiteLink}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {rowValue.websiteLink}
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td style={{ padding: 12 }}>
                              {isEditing ? (
                                <Form.Item {...restField} name={[name, "note"]} style={{ marginBottom: 0 }}>
                                  <Input.TextArea rows={1} autoSize style={{ borderRadius: 6 }} />
                                </Form.Item>
                              ) : (
                                rowValue?.note || "—"
                              )}
                            </td>
                            <td style={{ padding: 12, color: "#64748b" }}>
                              {rowValue?.createdDate ? formatDate(rowValue.createdDate, false) : "—"}
                            </td>
                            <td style={{ padding: 12, textAlign: "center" }}>
                              {isEditing ? (
                                <Space>
                                  <Button
                                    type="text"
                                    icon={<SaveOutlined />}
                                    loading={isSaving}
                                    onClick={() => handleSaveRow(name)}
                                  />
                                  <Button
                                    type="text"
                                    icon={<CloseOutlined />}
                                    disabled={isSaving}
                                    onClick={() => handleCancelRow(name, isNew, remove)}
                                  />
                                </Space>
                              ) : (
                                <Space>
                                  <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => setEditingIndex(name)}
                                  />
                                  <Popconfirm
                                    title="Xác nhận xoá"
                                    description="Bạn có chắc chắn muốn xoá nền tảng tích hợp này?"
                                    okText="Xoá"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }}
                                    onConfirm={() => rowValue?.id && handleDelete(rowValue.id)}
                                  >
                                    <Button
                                      type="text"
                                      danger
                                      icon={<DeleteOutlined />}
                                      loading={deletingId === rowValue?.id}
                                    />
                                  </Popconfirm>
                                </Space>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <Button
                    type="dashed"
                    icon={<PlusCircleOutlined />}
                    onClick={() => {
                      add({ platformManageId });
                      setEditingIndex(fields.length);
                    }}
                    block
                    style={{ marginTop: 12, borderRadius: 8, height: 38, fontWeight: 500 }}
                  >
                    Thêm nền tảng tích hợp
                  </Button>
                </div>
              </>
            )}
          </Form.List>
        </Form>
      </Spin>
    </>
  );
};

export default EnterprisePlatformItemTab;
