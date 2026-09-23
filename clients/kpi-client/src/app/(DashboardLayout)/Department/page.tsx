"use client";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import withAuthorization from "@/libs/authentication";
import departmentService from "@/services/department/department.service";
import {
  DepartmentHierarchyType,
  DepartmentType,
} from "@/types/department/dto";
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  StopOutlined,
  UploadOutlined,
  BarsOutlined,
  NodeIndexOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  ConfigProvider,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
  Segmented,
  Tree,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import CreateOrUpdate from "./createOrUpdate";
import ImportModal from "./importModal";

// Backend trả về DepartmentHierarchyType với field `title` (không phải `name`).
// Mình normalize về dạng có `name` để dùng đồng nhất.
type DepartmentRow = {
  id: string;
  stt: string;
  name: string;
  shortName?: string;
  code: string;
  parentId?: string;
  priority?: number;
  level: number;
  loai: string;
  isActive: boolean;
  diaDanh?: string;
  maTinh?: string;
  children?: DepartmentRow[];
};

function normalizeNode(
  n: DepartmentHierarchyType,
  prefix = "",
  idx = 1,
): DepartmentRow {
  const stt = prefix ? `${prefix}.${idx}` : `${idx}`;
  return {
    id: n.id,
    stt,
    name: n.title,
    shortName: n.shortName,
    code: n.code,
    parentId: n.parentId,
    priority: n.priority,
    level: n.level,
    loai: n.loai,
    isActive: n.isActive,
    diaDanh: n.diaDanh,
    maTinh: n.maTinh,
    children: n.children?.length
      ? [...n.children]
          .sort((a, b) => (a.priority ?? 9999) - (b.priority ?? 9999))
          .map((c, i) => normalizeNode(c, stt, i + 1))
      : undefined,
  };
}

function DepartmentPage() {
  const [items, setItems] = useState<DepartmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [editing, setEditing] = useState<DepartmentType | null>(null);
  const [parentForNew, setParentForNew] = useState<DepartmentType | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "tree">("tree");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await departmentService.getDepartmentsWithHierarchy();
      const data = Array.isArray(r?.data) ? [...r.data] : [];
      data.sort((a, b) => (a.priority ?? 9999) - (b.priority ?? 9999));
      setItems(data.map((n, i) => normalizeNode(n, "", i + 1)));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter recursively: keep parent if any child matches keyword
  const filterTree = useCallback(
    (nodes: DepartmentRow[], k: string): DepartmentRow[] => {
      if (!k) return nodes;
      const kw = k.toLowerCase();
      return nodes
        .map((n): DepartmentRow | null => {
          const children = n.children ? filterTree(n.children, k) : [];
          const selfMatch =
            (n.name || "").toLowerCase().includes(kw) ||
            (n.code || "").toLowerCase().includes(kw) ||
            (n.shortName || "").toLowerCase().includes(kw);
          if (selfMatch || children.length) {
            return { ...n, children: children.length ? children : undefined };
          }
          return null;
        })
        .filter(Boolean) as DepartmentRow[];
    },
    [],
  );

  const filtered = useMemo(
    () => filterTree(items, keyword.trim()),
    [items, keyword, filterTree],
  );

  const handleAddRoot = () => {
    setParentForNew(null);
    setEditing(null);
    setOpenForm(true);
  };

  const handleAddChild = (parent: DepartmentRow) => {
    setParentForNew(parent as unknown as DepartmentType);
    setEditing(null);
    setOpenForm(true);
  };

  const handleEdit = (row: DepartmentRow) => {
    setEditing(row as unknown as DepartmentType);
    setParentForNew(null);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await departmentService.delete(id);
      message.success("Đã xoá đơn vị");
      fetchData();
    } catch {
      message.error("Xoá thất bại");
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await departmentService.deactive(id);
      message.success("Đã đổi trạng thái");
      fetchData();
    } catch {
      message.error("Đổi trạng thái thất bại");
    }
  };

  const columns: ColumnsType<DepartmentRow> = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 90,
      align: "center",
      render: (v: string) => (
        <span className="font-mono text-xs text-gray-700 font-medium whitespace-nowrap">{v}</span>
      ),
    },
    {
      title: "Tên đơn vị",
      dataIndex: "name",
      key: "name",
      render: (v: string, row) => (
        <div>
          <div className="font-semibold text-gray-900">{v}</div>
          {row.shortName && (
            <div className="text-xs text-gray-500">{row.shortName}</div>
          )}
        </div>
      ),
    },
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      width: 160,
      render: (v: string) => (
        <code className="text-xs font-mono text-[#0143DF]">{v}</code>
      ),
    },
    {
      title: "Loại",
      dataIndex: "loai",
      key: "loai",
      width: 190,
      render: (v: string) => {
        if (!v) return "-";
        const label =
          v === "KhoiCoQuanChiNhanh"
            ? "Khối Cơ Quan / Chi nhánh"
            : v === "Phong"
            ? "Phòng / Ban"
            : v;
        const color =
          v === "KhoiCoQuanChiNhanh" ? "purple" : v === "Phong" ? "blue" : "cyan";
        return (
          <Tag
            color={color}
            style={{
              whiteSpace: "normal",
              height: "auto",
              padding: "2px 8px",
              wordBreak: "break-word",
              display: "inline-block",
            }}
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: "Địa danh",
      dataIndex: "diaDanh",
      key: "diaDanh",
      width: 150,
      render: (v: string) => v || "-",
    },
    {
      title: "Cấp",
      dataIndex: "level",
      key: "level",
      width: 70,
      align: "center",
      render: (v: number) => v ?? "-",
    },
    {
      title: "Thứ tự",
      dataIndex: "priority",
      key: "priority",
      width: 80,
      align: "center",
      render: (v: number) => v ?? "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 110,
      align: "center",
      render: (v: boolean) =>
        v ? (
          <Tag color="green">Đang dùng</Tag>
        ) : (
          <Tag color="default">Khóa</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      align: "center",
      fixed: "right",
      render: (_: unknown, row) => (
        <Space size="small">
          <Button
            
            type="text"
            icon={<PlusCircleOutlined />}
            onClick={() => handleAddChild(row)}
            title="Thêm đơn vị con"
          />
          <Button
            
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(row)}
            title="Sửa"
          />
          <Popconfirm
            title="Đổi trạng thái đơn vị này?"
            okText="Có"
            cancelText="Không"
            onConfirm={() => handleDeactivate(row.id)}
          >
            <Button
              
              type="text"
              icon={<StopOutlined />}
              title={row.isActive ? "Khóa" : "Mở khóa"}
            />
          </Popconfirm>
          <Popconfirm
            title="Xoá đơn vị này?"
            description="Đơn vị con (nếu có) sẽ bị ảnh hưởng."
            okText="Xoá"
            okButtonProps={{ danger: true }}
            cancelText="Hủy"
            onConfirm={() => handleDelete(row.id)}
          >
            <Button
              
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Xoá"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderTreeNodes = (data: DepartmentRow[]): any[] =>
    data.map((item) => {
      const title = (
        <div className="flex items-center justify-between w-full group">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
            {item.shortName && (
              <span className="text-xs text-gray-500">({item.shortName})</span>
            )}
            <code className="text-xs font-mono text-[#0143DF] bg-blue-50 px-1 py-0.5 rounded border border-blue-100">
              {item.code}
            </code>
            {!item.isActive && <Tag color="default" className="ml-2">Khóa</Tag>}
          </div>
          <Space size="small" onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="text"
              size="small"
              icon={<PlusCircleOutlined />}
              onClick={() => handleAddChild(item)}
              title="Thêm đơn vị con"
            />
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(item)}
              title="Sửa"
            />
            <Popconfirm
              title="Xoá đơn vị này?"
              okText="Xoá"
              okButtonProps={{ danger: true }}
              cancelText="Hủy"
              onConfirm={() => handleDelete(item.id)}
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} title="Xoá" />
            </Popconfirm>
          </Space>
        </div>
      );

      return {
        title,
        key: item.id,
        children: item.children ? renderTreeNodes(item.children) : undefined,
      };
    });

  const styledColumns = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#0355a2",
            color: "#ffffff",
            fontWeight: 600,
          },
        }),
      })),
    [columns]
  );

  return (
    <>
      <AutoBreadcrumb />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-bold text-gray-800 m-0">
            Quản lý đơn vị / phòng ban
          </h2>
          <Space>
            <Input
              placeholder="Tìm tên, mã, tên ngắn..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              style={{ width: 260 }}
            />
            <Segmented
              options={[
                { label: 'Bảng', value: 'table', icon: <BarsOutlined /> },
                { label: 'Cây', value: 'tree', icon: <NodeIndexOutlined /> },
              ]}
              value={viewMode}
              onChange={(value) => setViewMode(value as "table" | "tree")}
            />
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={handleAddRoot}
            >
              Thêm đơn vị
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => setOpenImportModal(true)}
            >
              Import Excel
            </Button>
          </Space>
        </div>

        <ConfigProvider
          theme={{
            components: {
              Table: {
                headerBg: "#0355a2",
                headerColor: "#ffffff",
              },
            },
          }}
        >
          {viewMode === "table" ? (
            <Table<DepartmentRow>
              columns={styledColumns}
              dataSource={filtered}
              rowKey="id"
              loading={loading}
              bordered
              pagination={false}
              expandable={{
                defaultExpandAllRows: false,
                indentSize: 24,
                expandIconColumnIndex: 1,
              }}
              scroll={{ x: 1100 }}
              size="middle"
            />
          ) : (
            <div className="p-4 border rounded bg-white overflow-auto" style={{ minHeight: 400 }}>
              {filtered.length > 0 ? (
                <Tree
                  showLine
                  blockNode
                  treeData={renderTreeNodes(filtered)}
                  defaultExpandAll
                  className="bg-transparent"
                />
              ) : (
                <div className="text-center text-gray-500 mt-10">Không có dữ liệu</div>
              )}
            </div>
          )}
        </ConfigProvider>
      </Card>

      <CreateOrUpdate
        isOpen={openForm}
        data={editing}
        parent={parentForNew}
        onClose={() => setOpenForm(false)}
        onSuccess={() => {
          setOpenForm(false);
          fetchData();
        }}
      />

      <ImportModal
        isOpen={openImportModal}
        onClose={() => setOpenImportModal(false)}
        onSuccess={() => {
          setOpenImportModal(false);
          fetchData();
        }}
      />
    </>
  );
}

export default withAuthorization(DepartmentPage, "");
