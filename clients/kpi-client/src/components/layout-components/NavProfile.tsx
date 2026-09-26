import Flex from "@/components/shared-components/Flex";
import {
  FONT_SIZES,
  FONT_WEIGHT,
  MEDIA_QUERIES,
  SPACER,
} from "@/constants/ThemeConstant";
import { setLogout } from "@/store/auth/AuthSlice";
import { useSelector } from "@/store/hooks";
import { resetMenuData } from "@/store/menu/MenuSlice";
import { AppDispatch } from "@/store/store";
import {
  DownOutlined,
  KeyOutlined,
  LogoutOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import styled from "@emotion/styled";
import { Avatar, Dropdown, MenuProps, message, Modal } from "antd";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import NavItem from "./NavItem";
import authService from "@/services/auth/auth.service";
import UpdatePasswordForm from "@/app/(DashboardLayout)/profile/Components/UpdatePasswordForm";
import { buildFileUrl } from "@/utils/file";

// Styled components
const Icon = styled.div(() => ({
  fontSize: FONT_SIZES.LG,
}));
const StaticFileUrl = process.env.NEXT_PUBLIC_API_URL;
const Profile = styled.div(() => ({
  display: "flex",
  alignItems: "center",
}));

const UserInfo = styled("div")`
  padding-left: ${SPACER[2]};

  @media ${MEDIA_QUERIES.MOBILE} {
    display: none;
  }
`;

const Name = styled.div(() => ({
  fontWeight: FONT_WEIGHT.SEMIBOLD,
}));

const Title = styled.span(() => ({
  opacity: 0.8,
}));

interface MenuItemProps {
  path?: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface MenuItemSignOutProps {
  label: string;
}

// const MenuItem: React.FC<MenuItemProps> = ({ label, icon }) => (
//   <Flex as="a" alignItems="center" gap={SPACER[2]}>
//     <Icon>{icon}</Icon>
//     <span>{label}</span>
//   </Flex>
// );
const MenuItem: React.FC<MenuItemProps> = ({ label, icon, path, onClick }) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (path) {
      router.push(path);
    }
  };
  return (
    <Flex
      as="a"
      alignItems="center"
      gap={2}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <Icon>{icon}</Icon>
      <span>{label}</span>
    </Flex>
  );
};

const MenuItemSignOut: React.FC<MenuItemSignOutProps> = ({ label }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSignOut = async () => {
    dispatch(setLogout());
    dispatch(resetMenuData());

    if (typeof window !== "undefined") {
      localStorage.removeItem("AccessToken");
      localStorage.removeItem("IdTokenHint");
      localStorage.removeItem("USER_INFO");
      const currentOrigin = window.location.origin;
      window.location.href = `http://localhost:3000/?action=logout&redirect_uri=${encodeURIComponent(currentOrigin + "/auth/login")}`;
    }
  };

  return (
    <div onClick={handleSignOut}>
      <Flex alignItems="center" gap={SPACER[2]}>
        <span>{label}</span>
      </Flex>
    </div>
  );
};

export const NavProfile: React.FC = () => {
  const user = useSelector((state) => state.auth.User);
  const [isOpenChangePassword, setIsOpenChangePassword] = useState(false);

  const handleSubmitChangePassword = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      console.log("values", values);

      await authService.changePassword(values);

      message.success("Đổi mật khẩu thành công");
      setIsOpenChangePassword(false);
    } catch (error) {
      message.error("Đổi mật khẩu thất bại");
    }
  };
  const handleOpenChangePassword = () => {
    setIsOpenChangePassword(true);
  };

  const handleCloseChangePassword = () => {
    setIsOpenChangePassword(false);
  };
  const items: MenuProps["items"] = [
    {
      key: "Ví tiền",
      icon: <WalletOutlined />,
      label: <MenuItem path="/quanlygiaodich" label="Nạp tiền / Quản lý ví" />,
    },
    {
      key: "Chỉnh sửa thông tin",
      icon: <UserOutlined />,
      label: <MenuItem path="/profile" label="Chỉnh sửa thông tin" />,
    },
    {
      key: "Change Password",
      icon: <KeyOutlined />,
      label: (
        <MenuItem label="Đổi mật khẩu" onClick={handleOpenChangePassword} />
      ),
    },
    {
      type: "divider",
    },
    {
      key: "Đăng xuất",
      icon: <LogoutOutlined />,
      label: <MenuItemSignOut label="Đăng xuất" />,
      danger: true,
    },
  ];

  return (
    <>
      <Dropdown
        placement="bottomRight"
        menu={{ items }}
        trigger={["click"]}
        className="shrink-0 p-0 pr-2"
      >
        <NavItem>
          <Profile>
            <Avatar
              src={
                user?.picture
                  ? buildFileUrl(user.picture)
                  : "/images/default-avatar.svg"
              }
              icon={<UserOutlined />}
              className="bg-slate-100 text-slate-500 border border-slate-200"
              onError={() => false}
            />
            <UserInfo className="profile-text flex items-center">
              <Name className="!text-gray-600">{user?.name}</Name>
              <div>
                <DownOutlined className="!text-gray-600 !text-[10px]" />
              </div>
            </UserInfo>
          </Profile>
        </NavItem>
      </Dropdown>
      <Modal
        title="Đổi mật khẩu"
        open={isOpenChangePassword}
        onCancel={handleCloseChangePassword}
        footer={null}
        destroyOnClose
      >
        <UpdatePasswordForm
          onClose={handleCloseChangePassword}
          onSubmit={handleSubmitChangePassword}
        />
      </Modal>
    </>
  );
};

export default NavProfile;
