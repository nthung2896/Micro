import React from "react";
import { Avatar, Drawer, Divider, Tag } from "antd";
import {
  MobileOutlined,
  MailOutlined,
  UserOutlined,
  CalendarOutlined,
  UserSwitchOutlined,
  SafetyOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { AppUserType } from "@/types/appUser/dto";
import { convertDateTime } from "@/utils/convertDayjsToISOString";

interface UserViewProps {
  user?: AppUserType | null;
  isOpen: boolean;
  onClose: () => void;
}

const QLModuleDetail: React.FC<UserViewProps> = ({ user, isOpen, onClose }) => {
  return (
    <Drawer
      title={`Thông tin người module`}
      width="20%"
      placement="right"
      onClose={onClose}
      closable={true}
      open={isOpen}
    >
      <div className="text-center mt-3">
        {/* <Avatar size={80} src={user?.img} /> */}
        <h4 className="mt-2 mb-0">{user?.name}</h4>
        <span className="text-muted">{user?.userName}</span>
      </div>
      <Divider dashed />
      <div>
        <h6 className="text-muted text-uppercase mb-3">Thông tin chi tiết</h6>
        <p>
          <UserOutlined />
          <span className="ml-3 text-dark">ID: {user?.id}</span>
        </p>
        <p>
          <CalendarOutlined />
          <span className="ml-3 text-dark">
            Ngày sinh: {convertDateTime(user?.ngaySinh) || "Chưa có"}
          </span>
        </p>
        <p>
          <UserSwitchOutlined />
          <span className="ml-3 text-dark">
            Giới tính: {user?.gioiTinh_txt || "Nam"}
          </span>
        </p>
        <p>
          <SendOutlined />
          <span className="ml-3 text-dark">
            Địa chỉ: {user?.diaChi || "Chưa có"}
          </span>
        </p>
      </div>
      <div className="mt-5">
        <h6 className="text-muted text-uppercase mb-3">Liên hệ</h6>
        <p>
          <MobileOutlined />
          <span className="ml-3 text-dark">
            {user?.phoneNumber || "Chưa có"}
          </span>
        </p>
        <p>
          <MailOutlined />
          <span className="ml-3 text-dark">{user?.email || "Chưa có"}</span>
        </p>
      </div>
      <div className="mt-5">
        <h6 className="text-muted text-uppercase mb-3">Nhóm Quyền</h6>
        <p>
          <SafetyOutlined />
          {user?.vaiTro_txt_response != null &&
            user?.vaiTro_txt_response.length > 0 &&
            user?.vaiTro_txt_response.map((e, index) => (
              <Tag className="mb-1 ml-1" color="cyan" key={index}>
                {e}
              </Tag>
            ))}
        </p>
      </div>
    </Drawer>
  );
};

export default QLModuleDetail;
