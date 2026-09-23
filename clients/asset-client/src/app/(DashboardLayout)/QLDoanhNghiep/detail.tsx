import React from "react";
import { Descriptions, Drawer, Tag } from "antd";
import { CompanyInfoType } from "@/types/companyInfo/dto";
import CompanyInfoStatusConstant from "@/constants/CompanyInfoStatusConstant";
import TypeOrganizationConstant from "@/constants/TypeOrganizationConstant";

interface Props {
  item?: CompanyInfoType | null;
  onClose: () => void;
}

const CompanyInfoDetail: React.FC<Props> = ({ item, onClose }) => {
  if (!item) return null;
  const statusColor = CompanyInfoStatusConstant.getColor(item.status);
  const statusName = CompanyInfoStatusConstant.getDisplayName(item.status);

  return (
    <Drawer
      title={`Chi tiết doanh nghiệp: ${item.name ?? ""}`}
      width={720}
      placement="right"
      onClose={onClose}
      open={true}
    >
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Trạng thái">
          <Tag color={statusColor}>{statusName}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Tên doanh nghiệp">{item.name}</Descriptions.Item>
        <Descriptions.Item label="Tên tiếng Anh">{item.englishName}</Descriptions.Item>
        <Descriptions.Item label="Tên viết tắt">{item.shortName}</Descriptions.Item>
        <Descriptions.Item label="Mã số thuế">{item.taxCode}</Descriptions.Item>
        <Descriptions.Item label="Loại tổ chức">
          {TypeOrganizationConstant.getDisplayName(item.typeOrganization ?? "")}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">{item.address}</Descriptions.Item>
        <Descriptions.Item label="Tỉnh/TP (cổng DVC)">
          {item.cityName} ({item.cityId})
        </Descriptions.Item>
        <Descriptions.Item label="Điện thoại">{item.phone}</Descriptions.Item>
        <Descriptions.Item label="Email">{item.email}</Descriptions.Item>
        <Descriptions.Item label="Fax">{item.fax}</Descriptions.Item>
        <Descriptions.Item label="Người đại diện">
          {item.representerName}
        </Descriptions.Item>
        <Descriptions.Item label="CCCD/Hộ chiếu">
          {item.representerCCCD}
        </Descriptions.Item>
        <Descriptions.Item label="SĐT người đại diện">
          {item.representerMobile}
        </Descriptions.Item>
        <Descriptions.Item label="Email người đại diện">
          {item.representerEmail}
        </Descriptions.Item>
        <Descriptions.Item label="Yếu tố nước ngoài">
          {item.isNuocNgoai ? "Có" : "Không"}
        </Descriptions.Item>
        <Descriptions.Item label="Vốn đầu tư nước ngoài">
          {item.isVonDauTuNuocNgoai ? "Có" : "Không"}
        </Descriptions.Item>
        <Descriptions.Item label="File ĐKKD">
          {item.dKKD ? (
            <a href={item.dKKD} target="_blank" rel="noreferrer">
              Xem file
            </a>
          ) : (
            "-"
          )}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default CompanyInfoDetail;
