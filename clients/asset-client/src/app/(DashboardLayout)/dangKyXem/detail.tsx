"use client";
import { Descriptions, Modal, Tag, Table, Space, Tooltip, Button } from "antd";
import { DangKyXemType } from "@/types/dang-ky-xem/dto";
import dayjs from "dayjs";
import DangKyXemNenTangList from "./DangKyXemNenTangList";
import { useEffect, useState } from "react";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";
import { EyeOutlined } from "@ant-design/icons";

interface Props {
  item: DangKyXemType | null;
  onClose: () => void;
}

import DangKyXemStatusConstant from "@/constants/DangKyXemStatusConstant";

const DangKyXemDetail: React.FC<Props> = ({ item, onClose }) => {
  const [attachedFiles, setAttachedFiles] = useState<TaiLieuDinhKemType[]>([]);

  useEffect(() => {
    if (item?.id) {
      taiLieuDinhKemService.getByItemId(item.id, "TepDinhKem").then((res) => {
        if (res.data) {
          setAttachedFiles(res.data);
        }
      });
    } else {
      setAttachedFiles([]);
    }
  }, [item?.id]);

  if (!item) return null;

  const getFileUrl = (record: TaiLieuDinhKemType): string => {
    if (!record.duongDanFile) return "";
    return taiLieuDinhKemService.getUrl(record.id || "", record.tenTaiLieu || "", record.duongDanFile);
  };

  return (
    <Modal
      title="Chi tiết Đăng ký xem"
      open={!!item}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Họ và tên">{item.hoTen}</Descriptions.Item>
        <Descriptions.Item label="Nội dung">{item.noiDung}</Descriptions.Item>
        <Descriptions.Item label="Nội dung khác">{item.noiDungKhac || "—"}</Descriptions.Item>
        <Descriptions.Item label="Nền tảng muốn xem">{item.nenTangMuonXem || "—"}</Descriptions.Item>
        <Descriptions.Item label="Nội dung muốn xem">{item.noiDungMuonXem || "—"}</Descriptions.Item>
        <Descriptions.Item label="Từ ngày">
          {item.tuNgay ? dayjs(item.tuNgay).format("DD/MM/YYYY") : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Đến ngày">
          {item.denNgay ? dayjs(item.denNgay).format("DD/MM/YYYY") : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={DangKyXemStatusConstant.getColor(item.trangThai!)}>
            {DangKyXemStatusConstant.getDisplayName(item.trangThai!)}
          </Tag>
        </Descriptions.Item>
        {item.trangThai === 3 && (
          <Descriptions.Item label="Lý do từ chối">
            <span style={{ color: "red" }}>{item.lyDoTuChoi}</span>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Ngày tạo">
          {item.createdDate ? dayjs(item.createdDate).format("DD/MM/YYYY HH:mm") : "—"}
        </Descriptions.Item>
      </Descriptions>

      {/* Tệp đính kèm */}
      {attachedFiles.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4 style={{ marginBottom: 8 }}>Tệp đính kèm</h4>
          <Table
            columns={[
              {
                title: "STT",
                width: 55,
                align: "center",
                render: (_: any, __: any, index: number) => index + 1,
              },
              {
                title: "Tên tài liệu",
                dataIndex: "tenTaiLieu",
                ellipsis: true,
              },
              {
                title: "Xem",
                width: 70,
                align: "center",
                render: (_: any, record: TaiLieuDinhKemType) => {
                  const url = getFileUrl(record);
                  if (!url) return "—";
                  return (
                    <Tooltip title="Xem file">
                      <Button
                        type="text"
                        
                        icon={<EyeOutlined />}
                        onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                      />
                    </Tooltip>
                  );
                },
              },
            ]}
            dataSource={attachedFiles}
            rowKey="id"
            bordered
            size="small"
            pagination={false}
            locale={{ emptyText: "Không có tài liệu đính kèm nào." }}
          />
        </div>
      )}

      {/* Component quản lý nền tảng được gắn kèm */}
      <DangKyXemNenTangList dangKyXemId={item.id!} readOnly={true} />
    </Modal>
  );
};

export default DangKyXemDetail;
