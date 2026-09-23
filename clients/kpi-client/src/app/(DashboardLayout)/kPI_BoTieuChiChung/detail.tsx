import React, { useEffect, useState, useMemo } from "react";
import { Modal, Descriptions, Tag, Table, Typography, ConfigProvider } from "antd";
import { KPI_BoTieuChiChungType } from "@/types/kPI_BoTieuChiChung/kPI_BoTieuChiChung";
import kPI_TieuChiChungService from "@/services/kPI_TieuChiChung/kPI_TieuChiChungService";
import dayjs from "dayjs";
import { getKPI_BoTieuChiChungTypeLabel } from "@/constants/KPI_BoTieuChiChungTypeConstant";
import { isRomanNumeral } from "@/utils/string";

const { Title } = Typography;

interface Props {
  item: KPI_BoTieuChiChungType | null;
  onClose: () => void;
}

const KPI_BoTieuChiChungDetail: React.FC<Props> = ({ item, onClose }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item?.id) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await kPI_TieuChiChungService.getData({ idBoTieuChiChung: item.id, pageIndex: 1, pageSize: 1000 } as any);
          if (res?.data?.items) {
            setData(res.data.items);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [item]);

  const treeData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const itemMap: Record<string, any> = {};
    data.forEach((d) => {
      itemMap[d.id] = { ...d, children: [] };
    });

    const tree: any[] = [];
    data.forEach((d) => {
      if (d.parentId && itemMap[d.parentId]) {
        itemMap[d.parentId].children.push(itemMap[d.id]);
      } else {
        tree.push(itemMap[d.id]);
      }
    });

    const toRoman = (num: number): string => {
      const romanMap: [number, string][] = [
        [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
        [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
        [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
      ];
      let res = "";
      for (const [val, char] of romanMap) {
        while (num >= val) { res += char; num -= val; }
      }
      return res || "I";
    };

    const assignStt = (nodes: any[], parentStt = "", level = 0) => {
      nodes.forEach((node, index) => {
        if (level === 0) node.stt = toRoman(index + 1);
        else if (level === 1) node.stt = `${index + 1}`;
        else node.stt = parentStt ? `${parentStt}.${index + 1}` : `${index + 1}`;
        if (node.children && node.children.length > 0) assignStt(node.children, node.stt, level + 1);
      });
    };

    assignStt(tree);

    const cleanEmptyChildren = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node.children.length === 0) delete node.children;
        else cleanEmptyChildren(node.children);
      });
    };
    cleanEmptyChildren(tree);
    return tree;
  }, [data]);

  const columns = [
    {
      title: "STT", dataIndex: "stt", key: "stt", width: 120, align: "center" as const,
      render: (stt: any) => {
        const isBold = isRomanNumeral(stt);
        return <span style={{ fontWeight: isBold ? "bold" : "normal" }}>{stt}</span>;
      }
    },
    {
      title: "Tên tiêu chí chung", dataIndex: "ten", key: "ten",
      render: (ten: any, record: any) => {
        const isBold = !record.parentId || (record.children && record.children.length > 0);
        return <span style={{ fontWeight: isBold ? "bold" : "normal" }}>{ten}</span>;
      }
    },
    { title: "Điểm / Trọng số", dataIndex: "myProperty", key: "myProperty", width: 150 },
    { title: "Sắp xếp", dataIndex: "priority", key: "priority", width: 100 }
  ];

  if (!item) return null;
  return (
    <Modal title="Chi tiết bộ tiêu chí chung" open={true} onCancel={onClose} footer={null} width={"80vw"} style={{ top: 20 }} styles={{ body: { maxHeight: "calc(100vh - 120px)", overflowY: "auto", padding: "24px" } }}>
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Số quyết định">{item.soQuyetDinh}</Descriptions.Item>
        <Descriptions.Item label="Tên bộ tiêu chí">{item.tenBoTieuChiDonVi}</Descriptions.Item>
        <Descriptions.Item label="Loại bộ tiêu chí">{getKPI_BoTieuChiChungTypeLabel(item.type)}</Descriptions.Item>
        <Descriptions.Item label="Đơn vị áp dụng">{item.tenDonVi || "---"}</Descriptions.Item>

        <Descriptions.Item label="Ngày quyết định">{item.ngayQuyetDinh ? dayjs(item.ngayQuyetDinh).format("DD/MM/YYYY") : "---"}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          {item.isActive ? (
            <Tag color="success">Đang kích hoạt</Tag>
          ) : (
            <Tag color="default">Chưa kích hoạt</Tag>
          )}
        </Descriptions.Item>

      </Descriptions>
      
      <div style={{ marginTop: 24 }}>
        <Title level={5} style={{ color: "#002766", marginBottom: 16 }}>Danh sách Tiêu chí chung</Title>
        <ConfigProvider theme={{ components: { Table: { headerBg: "#0355a2", headerColor: "#ffffff" } } }}>
          <Table
            bordered
            size="small"
            columns={columns}
            dataSource={treeData}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ y: "calc(70vh - 200px)" }}
            defaultExpandAllRows
          />
        </ConfigProvider>
      </div>
    </Modal>
  );
};
export default KPI_BoTieuChiChungDetail;

