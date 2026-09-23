import React, { useEffect, useState } from "react";
import { Modal, Spin, Button, Tabs, Table, Switch, Space } from "antd";
import { KPI_NhomTieuChiTreeView } from "../kPI_NhomTieuChi/KPI_NhomTieuChiTreeViewComponent";
import kPI_NhomTieuChiService from "@/services/kPI_NhomTieuChi/kPI_NhomTieuChiService";
import kPI_TieuChiChungService from "@/services/kPI_TieuChiChung/kPI_TieuChiChungService";

import { isRomanNumeral } from "@/utils/string";

interface ModalXemToanBoTieuChiProps {
  visible: boolean;
  onClose: () => void;
  idDotDanhGia: string | null;
  idLyLich?: string | null;
  donViId?: string | null;
}

const ModalXemToanBoTieuChi: React.FC<ModalXemToanBoTieuChiProps> = ({
  visible,
  onClose,
  idDotDanhGia,
  idLyLich,
  donViId,
}) => {
  const [activeIdBoTieuChiDonVi, setActiveIdBoTieuChiDonVi] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [chungData, setChungData] = useState<any[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly React.Key[]>([]);
  const [isExpandAll, setIsExpandAll] = useState(true);

  const getAllKeys = (data: any[]): React.Key[] => {
    let keys: React.Key[] = [];
    data.forEach((item) => {
      if (item.id) keys.push(item.id);
      if (item.children && item.children.length > 0) {
        keys = keys.concat(getAllKeys(item.children));
      }
    });
    return keys;
  };

  useEffect(() => {
    if (!visible || !idDotDanhGia) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy bộ tiêu chí chung
        const resChung = await kPI_TieuChiChungService.getTreeDataForDot(idDotDanhGia, idLyLich, null, donViId);
        if (resChung && resChung.status) {
          const dataChung = resChung.data || [];
          setChungData(dataChung);
          setExpandedRowKeys(getAllKeys(dataChung));
          setIsExpandAll(true);
        }

        // Lấy bộ tiêu chí đơn vị (để lấy idBoTieuChiDonVi cho KPI_NhomTieuChiTreeView)
        const resDonVi = await kPI_NhomTieuChiService.getTieuChiForCurrentUser(
          donViId || undefined,
          idDotDanhGia
        );
        if (resDonVi && resDonVi.status && resDonVi.data && resDonVi.data.length > 0) {
          const foundId = resDonVi.data.find((x) => !!x.idBoTieuChiDonVi)?.idBoTieuChiDonVi;
          if (foundId) {
            setActiveIdBoTieuChiDonVi(foundId);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu bộ tiêu chí:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [visible, idDotDanhGia, idLyLich, donViId]);

  if (!visible) return null;

  const chungColumns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 120,
      align: "center" as const,
      render: (stt: any) => {
        const isRoman = isRomanNumeral(stt);
        return (
          <span style={{ fontWeight: isRoman ? "bold" : "normal" }}>
            {stt}
          </span>
        );
      },
    },
    {
      title: "Tiêu chí",
      dataIndex: "ten",
      key: "ten",
    },
    {
      title: "Điểm tối đa",
      dataIndex: "myProperty",
      key: "myProperty",
      width: 150,
      align: "center" as const,
    }
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
          BỘ TIÊU CHÍ ĐANG ÁP DỤNG
        </span>
      }
      closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", lineHeight: "1" }}>✕</span>}
      styles={{
        header: { padding: "16px 24px", overflow: "hidden", borderRadius: "8px 8px 0 0", margin: 0, background: "#0355a2" },
        body: { padding: 0, maxHeight: "80vh", overflowY: "auto" }
      }}
      open={visible}
      onCancel={onClose}
      width="90%"
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
          <Spin tip="Đang tải thông tin bộ tiêu chí..." size="large" />
        </div>
      ) : (
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: <span style={{ fontWeight: 600, paddingLeft: 16 }}>Bộ tiêu chí chung</span>,
              children: (
                <div style={{ padding: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
                    <Space>
                      <span style={{ fontWeight: 500, color: "#333" }}>Mở rộng tất cả</span>
                      <Switch 
                        checked={isExpandAll} 
                        onChange={(checked) => {
                          setIsExpandAll(checked);
                          setExpandedRowKeys(checked ? getAllKeys(chungData) : []);
                        }} 
                        checkedChildren="Bật" 
                        unCheckedChildren="Tắt" 
                      />
                    </Space>
                  </div>
                  <Table
                    columns={chungColumns}
                    dataSource={chungData}
                    pagination={false}
                    bordered
                    rowKey="id"
                    size="middle"
                    expandable={{
                      expandedRowKeys,
                      onExpandedRowsChange: (keys) => {
                        setExpandedRowKeys(keys);
                        if (keys.length === 0) setIsExpandAll(false);
                      }
                    }}
                  />
                </div>
              )
            },
            {
              key: "2",
              label: <span style={{ fontWeight: 600 }}>Bộ tiêu chí nhiệm vụ</span>,
              children: (
                activeIdBoTieuChiDonVi ? (
                  <div style={{ padding: 0 }}>
                    <KPI_NhomTieuChiTreeView isModal={true} idBoTieuChiDonVi={activeIdBoTieuChiDonVi} />
                  </div>
                ) : (
                  <div style={{ padding: 20, textAlign: 'center' }}>Chưa cấu hình bộ tiêu chí nhiệm vụ cho đợt này.</div>
                )
              )
            }
          ]}
        />
      )}
    </Modal>
  );
};

export default ModalXemToanBoTieuChi;
