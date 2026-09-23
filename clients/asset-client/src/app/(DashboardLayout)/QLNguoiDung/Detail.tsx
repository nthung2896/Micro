import React from "react";
import { Modal, Divider, Tag } from "antd";
import {
  MobileOutlined,
  MailOutlined,
  UserOutlined,
  CalendarOutlined,
  UserSwitchOutlined,
  SafetyOutlined,
  SendOutlined,
} from "@ant-design/icons";
import formatDate from "@/utils/formatDate";
import { AppUserType } from "@/types/appUser/dto";
import { convertDateTime } from "@/utils/convertDayjsToISOString";

interface UserViewProps {
  user?: AppUserType | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetail: React.FC<UserViewProps> = ({ user, isOpen, onClose }) => {
  if (!user) return <></>;
  return (
    <>
      <Modal
        title="Thông tin người dùng"
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={600}
      >
        <div>
          <p>
            <UserOutlined />{" "}
            <span className="ml-3 text-dark">
              Tên tài khoản: {user?.userName}
            </span>
          </p>
          <p>
            <UserOutlined />{" "}
            <span className="ml-3 text-dark">Tên người dùng: {user?.name}</span>
          </p>
          <p>
            <CalendarOutlined />
            <span className="ml-3 text-dark">
              {" "}
              Ngày sinh: {convertDateTime(user?.ngaySinh) || "Chưa có"}
            </span>
          </p>
          <p>
            <UserSwitchOutlined />
            <span className="ml-3 text-dark">
              {" "}
              Giới tính: {user?.gioiTinh_txt || "Nam"}
            </span>
          </p>
          <p>
            <SendOutlined />
            <span className="ml-3 text-dark">
              {" "}
              Địa chỉ: {user?.diaChi || "Chưa có"}
            </span>
          </p>
        </div>
        <div className="mt-5">
          <h6 className="text-muted text-uppercase mb-3">Liên hệ</h6>
          <p>
            <MobileOutlined />
            <span className="ml-3 text-dark">
              {" "}
              {user?.phoneNumber || "Chưa có"}
            </span>
          </p>
          <p>
            <MailOutlined />
            <span className="ml-3 text-dark">{user?.email || "Chưa có"}</span>
          </p>
        </div>
        <div className="mt-5">
          <h6 className="text-muted text-uppercase mb-3">Vai trò</h6>
          <p>
            <SafetyOutlined />
            {user?.vaiTro_txt_response?.length ? (
              user.vaiTro_txt_response.map((e, index) => (
                <Tag className="mb-1 ml-1" color="cyan" key={index}>
                  {e}
                </Tag>
              ))
            ) : (
              <span className="ml-3 text-dark">Chưa có</span>
            )}
          </p>
        </div>
      </Modal>
    </>
  );
};

export default UserDetail;
