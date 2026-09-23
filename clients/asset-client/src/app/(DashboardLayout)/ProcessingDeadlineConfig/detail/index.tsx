import React, { useEffect, useState } from "react";
import { Modal, Descriptions, Button, Spin, Tag, message } from "antd";
import processingDeadlineConfigService from "@/services/processingDeadlineConfig/processingDeadlineConfig.service";
import PlatformManageTypeConstant from "@/constants/PlatformManageTypeConstant";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import { ProcessingDeadlineConfigDto } from "@/types/processingDeadlineConfig";
import formatDate from "@/utils/formatDate";

interface DetailModalProps {
  isOpen: boolean;
  id: string | null;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, id, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<ProcessingDeadlineConfigDto | null>(null);

  useEffect(() => {
    if (isOpen && id) {
      setLoading(true);
      processingDeadlineConfigService
        .getById(id)
        .then((res) => {
          if (res.status && res.data) {
            setData(res.data);
          } else {
            message.error(res.message || "Không thể tải chi tiết cấu hình");
            onClose();
          }
        })
        .catch(() => {
          message.error("Lỗi khi tải chi tiết cấu hình");
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setData(null);
    }
  }, [isOpen, id, onClose]);

  const renderType = (config: ProcessingDeadlineConfigDto) => {
    if (!config.type) return "-";
    if (config.isNenTang) {
      return (
        <Tag color={PlatformManageTypeConstant.getColor(config.type)}>
          {PlatformManageTypeConstant.getDisplayName(config.type)}
        </Tag>
      );
    }
    return config.type;
  };

  const renderStatus = (val: number | null | undefined, isNenTang: boolean) => {
    if (val === null || val === undefined) return "-";
    if (isNenTang) {
      const name = PlatformStatusConstant.getDisplayName(val);
      const color = PlatformStatusConstant.getColor(val);
      return name ? <Tag color={color}>{name}</Tag> : val;
    }
    return val;
  };

  return (
    <Modal
      title="Chi tiết cấu hình số ngày hạn xử lý"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={1200}
    >
      <Spin spinning={loading}>
        {data && (
          <Descriptions
            bordered
            column={2}
            size="middle"
            style={{ marginTop: 20 }}
            labelStyle={{ whiteSpace: "nowrap" }}
            contentStyle={{ wordBreak: "break-all" }}
          >
            <Descriptions.Item label="Tên cấu hình" span={2}>
              <strong>{data.name}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Mã module">
              <code>{data.code}</code>
            </Descriptions.Item>
            <Descriptions.Item label="Số thứ tự (STT)">
              {data.stt !== null && data.stt !== undefined ? data.stt : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Cấu hình nền tảng">
              {data.isNenTang ? <Tag color="blue">Có</Tag> : <Tag color="default">Không</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Bỏ qua ngày lễ/Tết">
              {data.isCheckHoliday ? <Tag color="green">Có</Tag> : <Tag color="default">Không</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="Loại hình" span={2}>
              {renderType(data)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái trước">
              {renderStatus(data.statusBefore, data.isNenTang)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái sau">
              {renderStatus(data.statusAfter, data.isNenTang)}
            </Descriptions.Item>
            <Descriptions.Item label="Số ngày hạn xử lý" span={2}>
              <strong style={{ color: "#1e3b8b", fontSize: "15px" }}>{data.limitDays} ngày</strong>
            </Descriptions.Item>

          </Descriptions>
        )}
      </Spin>
    </Modal>
  );
};

export default DetailModal;
