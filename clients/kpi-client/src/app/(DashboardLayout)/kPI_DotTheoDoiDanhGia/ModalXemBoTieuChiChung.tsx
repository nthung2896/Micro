"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Modal, Spin, Button, Table, TableProps, ConfigProvider } from "antd";
import kPI_TieuChiChungService from "@/services/kPI_TieuChiChung/kPI_TieuChiChungService";
import { isRomanNumeral } from "@/utils/string";

interface ModalXemBoTieuChiChungProps {
  visible: boolean;
  onClose: () => void;
  idBoTieuChiChung?: string | null;
  tenBoTieuChiChung?: string | null;
}

const ModalXemBoTieuChiChung: React.FC<ModalXemBoTieuChiChungProps> = ({
  visible,
  onClose,
  idBoTieuChiChung,
  tenBoTieuChiChung,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<readonly React.Key[]>([]);

  const fetchTieuChiChung = useCallback(async () => {
    if (!idBoTieuChiChung) return;
    setLoading(true);
    try {
      const res = await kPI_TieuChiChungService.getData({
        idBoTieuChiChung,
        pageSize: 1000,
        pageIndex: 1,
      });
      if (res?.data?.items) {
        const items = res.data.items;
        const itemMap: Record<string, any> = {};
        const allIds: string[] = [];

        items.forEach((item) => {
          allIds.push(item.id);
          itemMap[item.id] = { ...item, children: [] };
        });

        const tree: any[] = [];
        items.forEach((item) => {
          if (item.parentId && itemMap[item.parentId]) {
            itemMap[item.parentId].children.push(itemMap[item.id]);
          } else {
            tree.push(itemMap[item.id]);
          }
        });

        const cleanEmptyChildren = (nodes: any[]) => {
          nodes.forEach((node) => {
            if (node.children.length === 0) {
              delete node.children;
            } else {
              cleanEmptyChildren(node.children);
            }
          });
        };
        cleanEmptyChildren(tree);

        setTreeData(tree);
        setExpandedKeys(allIds);
      } else {
        setTreeData([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải bộ tiêu chí chung:", err);
    } finally {
      setLoading(false);
    }
  }, [idBoTieuChiChung]);

  useEffect(() => {
    if (visible && idBoTieuChiChung) {
      fetchTieuChiChung();
    }
  }, [visible, idBoTieuChiChung, fetchTieuChiChung]);

  if (!visible) return null;

  const columns: TableProps<any>["columns"] = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      align: "center",
      width: 80,
      render: (_: any, record: any, idx: number) => {
        const val = record.stt ?? record.priority ?? idx + 1;
        const isRoman = isRomanNumeral(val);
        return (
          <span style={{ fontWeight: isRoman ? "bold" : "normal" }}>
            {val}
          </span>
        );
      },
    },
    {
      title: "Tên tiêu chí chung",
      dataIndex: "ten",
      key: "ten",
      render: (text: string, record: any) => {
        const hasChildren = record.children && record.children.length > 0;
        return (
          <span style={{
            fontWeight: hasChildren ? "700" : "normal",
            color: hasChildren ? "#0355a2" : "#1f2937",
            fontSize: hasChildren ? "14px" : "13.5px"
          }}>
            {text}
          </span>
        );
      },
    },
    {
      title: "Điểm tối đa / Trọng số",
      dataIndex: "myProperty",
      key: "myProperty",
      align: "center",
      width: 180,
      render: (val: any, record: any) => {
        const hasChildren = record.children && record.children.length > 0;
        return (
          <span style={{ fontWeight: hasChildren ? "bold" : 600, color: hasChildren ? "#0355a2" : "#111827" }}>
            {val ?? "—"}
          </span>
        );
      },
    },
  ];

  return (
    <Modal
      title={
        <span style={{
          color: "#ffffff",
          fontSize: "16px",
          fontWeight: "bold",
          letterSpacing: "0.5px"
        }}>
          {tenBoTieuChiChung ? `BỘ TIÊU CHÍ CHUNG: ${tenBoTieuChiChung.toUpperCase()}` : "BỘ TIÊU CHÍ CHUNG ĐANG ÁP DỤNG"}
        </span>
      }
      closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", lineHeight: "1" }}>✕</span>}
      styles={{
        header: { padding: "16px 24px", overflow: "hidden", borderRadius: "8px 8px 0 0", margin: 0, background: "#0355a2" },
        body: { padding: 0, maxHeight: "80vh", overflowY: "auto" }
      }}
      open={visible}
      onCancel={onClose}
      width="85%"
      style={{ top: 20 }}
      footer={[
        <Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: "#0355a2", borderColor: "#0355a2" }}>
          Đóng
        </Button>,
      ]}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin tip="Đang tải danh sách tiêu chí chung..." size="large" />
        </div>
      ) : (
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
          <Table
            columns={columns}
            dataSource={treeData}
            rowKey="id"
            pagination={false}
            bordered
            size="small"
            expandable={{
              expandedRowKeys: expandedKeys,
              onExpandedRowsChange: (keys) => setExpandedKeys(keys),
            }}
          />
        </ConfigProvider>
      )}
    </Modal>
  );
};

export default ModalXemBoTieuChiChung;
