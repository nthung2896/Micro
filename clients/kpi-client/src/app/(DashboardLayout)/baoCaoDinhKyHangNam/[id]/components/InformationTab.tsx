import React from "react";
import { Descriptions, Card, Tag } from "antd";
import dayjs from "dayjs";
import Flex from "@/components/shared-components/Flex";
import FormTemplatesTab from "./FormTemplatesTab";

interface InformationTabProps {
  data: any;
}

const InformationTab: React.FC<InformationTabProps> = ({ data }) => {
  if (!data) return <Card loading={true} />;

  return (
    <Card bordered={false} className="mb-4">
      <Flex flexDirection="column" gap={16}>
        <Descriptions title="Thông tin đợt báo cáo" bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
          <Descriptions.Item label="Tên đợt báo cáo" span={2}>
            <strong>{data.name}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Biểu mẫu báo cáo">
            {data.bieuMauBaoCao || "Đang tải..."} {/* Adjust based on actual API response */}
          </Descriptions.Item>
          <Descriptions.Item label="Gửi email thông báo">
            {data.isGuiMail ? "Gửi email" : "Không gửi email"}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian bắt đầu">
            {data.timeStart ? dayjs(data.timeStart).format("DD/MM/YYYY HH:mm") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian kết thúc">
            {data.timeEnd ? dayjs(data.timeEnd).format("DD/MM/YYYY HH:mm") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Người duyệt báo cáo" span={2}>
            {data.nameNguoiDuyetBaoCaos?.join(", ")}
          </Descriptions.Item>
          {data.description && (
            <Descriptions.Item label="Mô tả / Nội dung chi tiết" span={2}>
              <div dangerouslySetInnerHTML={{ __html: data.description }} />
            </Descriptions.Item>
          )}
        </Descriptions>
        
        {/* <FormTemplatesTab templates={data.bcFormTemplates || []} /> */}
      </Flex>
    </Card>
  );
};

export default InformationTab;
