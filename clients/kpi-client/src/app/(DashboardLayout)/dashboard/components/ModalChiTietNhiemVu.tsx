import React, { useEffect, useState } from "react";
import { Modal, Table, Spin } from "antd";
import kPI_NhiemVuService from "@/services/kPI_NhiemVu/kPI_NhiemVuService";


interface Props {
  visible: boolean;
  onClose: () => void;
  idLyLich: string;
  idDotDanhGia: string;
  month: number;
}

const formatScore = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "0";
  return Number(value)
    .toFixed(2)
    .replace(/\.?(0+)$/, "");
};

const ModalChiTietNhiemVu: React.FC<Props> = ({ visible, onClose, idLyLich, idDotDanhGia, month }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (visible && idLyLich && idDotDanhGia) {
      fetchData();
    }
  }, [visible, idLyLich, idDotDanhGia]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await kPI_NhiemVuService.getChiTietNhiemVuThang(idLyLich, idDotDanhGia);
      if (res?.status && res.data) {
        const heThong = res.data.heThong || res.data.HeThong || [];
        const phatSinh = res.data.phatSinh || res.data.PhatSinh || [];
        
        let tableData: any[] = [];
        
        let sumHeThong = 0;
        let sumPhatSinh = 0;

        // Nhóm nhiệm vụ hệ thống
        if (heThong.length > 0) {
          tableData.push({ isGroup: true, key: 'group-he-thong', stt: 'I', name: 'Nhiệm vụ đã có trong kế hoạch/ phân công' });
          heThong.forEach((task: any, index: number) => {
            let taskSum = 0;
            const products = task.sanPham && task.sanPham.length > 0 ? task.sanPham : [{}];
            products.forEach((sp: any, i: number) => {
              const score = sp.diemBoTieuChi ?? (i === 0 ? task.diemBoTieuChi : null);
              if (score != null) taskSum += Number(score);
              tableData.push({
                key: `hethong-${task.id}-${i}`,
                stt: i === 0 ? (index + 1).toString() : '',
                mieuTa: i === 0 ? task.mieuTa : '',
                sanPham: sp.tenSanPham || '',
                tenTieuChi: sp.tenTieuChi || '',
                diemBoTieuChi: score != null ? formatScore(score) : '',
                rowSpan: i === 0 ? products.length : 0
              });
            });
            sumHeThong += taskSum;
          });
          tableData.push({ isTotal: true, key: 'total-he-thong', name: 'Tổng (1)', diemBoTieuChi: formatScore(sumHeThong) });
        }

        // Nhóm nhiệm vụ phát sinh
        if (phatSinh.length > 0) {
          tableData.push({ isGroup: true, key: 'group-phat-sinh', stt: 'II', name: 'Nhiệm vụ đảm nhận thêm hoặc đột xuất, phát sinh (*)' });
          phatSinh.forEach((task: any, index: number) => {
            let taskSum = 0;
            const products = task.sanPham && task.sanPham.length > 0 ? task.sanPham : [{}];
            products.forEach((sp: any, i: number) => {
              const score = sp.diemBoTieuChi ?? (i === 0 ? task.diemBoTieuChi : null);
              if (score != null) taskSum += Number(score);
              tableData.push({
                key: `phatsinh-${task.id}-${i}`,
                stt: i === 0 ? (index + 1).toString() : '',
                mieuTa: i === 0 ? task.mieuTa : '',
                sanPham: sp.tenSanPham || '',
                tenTieuChi: sp.tenTieuChi || '',
                diemBoTieuChi: score != null ? formatScore(score) : '',
                rowSpan: i === 0 ? products.length : 0
              });
            });
            sumPhatSinh += taskSum;
          });
          tableData.push({ isTotal: true, key: 'total-phat-sinh', name: 'Tổng (2)', diemBoTieuChi: formatScore(sumPhatSinh) });
        }
        
        tableData.push({ isGrandTotal: true, key: 'grand-total', name: 'Tổng điểm (3) = Tổng (1) + Tổng (2)', diemBoTieuChi: formatScore(sumHeThong + sumPhatSinh) });

        setData(tableData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 60,
      align: 'center' as const,
      render: (text: string, record: any) => {
        if (record.isGroup) return <strong>{text}</strong>;
        if (record.isTotal || record.isGrandTotal) return { children: <strong>{record.name}</strong>, props: { colSpan: 4 } };
        return { children: text, props: { rowSpan: record.rowSpan } };
      }
    },
    {
      title: 'Miêu tả công việc',
      dataIndex: 'mieuTa',
      key: 'mieuTa',
      width: 250,
      render: (text: string, record: any) => {
        if (record.isGroup) return { children: <strong>{record.name}</strong>, props: { colSpan: 3 } };
        if (record.isTotal || record.isGrandTotal) return { props: { colSpan: 0 } };
        return { children: text, props: { rowSpan: record.rowSpan } };
      }
    },
    {
      title: 'Sản phẩm đầu ra',
      dataIndex: 'sanPham',
      key: 'sanPham',
      width: 250,
      render: (text: string, record: any) => {
        if (record.isGroup || record.isTotal || record.isGrandTotal) return { props: { colSpan: 0 } };
        return <span style={{ color: '#1677ff' }}>{text}</span>;
      }
    },
    {
      title: 'Căn cứ chấm theo Bộ tiêu chí',
      dataIndex: 'tenTieuChi',
      key: 'tenTieuChi',
      width: 300,
      render: (text: string, record: any) => {
        if (record.isGroup || record.isTotal || record.isGrandTotal) return { props: { colSpan: 0 } };
        return text;
      }
    },
    {
      title: 'Điểm Bộ tiêu chí',
      dataIndex: 'diemBoTieuChi',
      key: 'diemBoTieuChi',
      align: 'center' as const,
      width: 100,
      render: (text: string, record: any) => {
        if (record.isGroup) return { props: { colSpan: 1 } }; // Để trống ô điểm của Group header
        if (record.isTotal || record.isGrandTotal) return <strong>{text}</strong>;
        return text;
      }
    }
  ];

  return (
    <Modal
      title={`CHI TIẾT NHIỆM VỤ THÁNG ${month}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1100}
      style={{ top: 30 }}
      styles={{ body: { padding: 0, maxHeight: '75vh', overflowY: 'auto' } }}
    >
      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={false} 
          bordered 
          size="middle"
          rowClassName={(record) => {
            if (record.isGroup) return 'bg-blue-50';
            if (record.isTotal || record.isGrandTotal) return 'bg-gray-100 font-bold';
            return '';
          }}
          components={{
            header: {
              cell: (props: any) => (
                <th {...props} style={{ ...props.style, textAlign: 'center', background: '#00539f', color: '#fff' }}>
                  {props.children}
                </th>
              ),
            }
          }}
        />
      </Spin>
    </Modal>
  );
};

export default ModalChiTietNhiemVu;
