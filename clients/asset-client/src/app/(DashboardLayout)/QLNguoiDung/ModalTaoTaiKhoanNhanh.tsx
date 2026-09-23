import React, { useState } from "react";
import { Modal, Radio, Button, Alert, message, Typography, Space, Tag, Divider, Card } from "antd";
import {
  UserAddOutlined,
  CrownOutlined,
  TeamOutlined,
  SolutionOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import userService from "@/services/user/user.service";

const { Text, Paragraph } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RoleOptionConfig {
  key: string;
  label: string;
  badge: string;
  icon: React.ReactNode;
  scope: string;
  sampleUsername: string;
  description: string;
}

const roleConfigs: RoleOptionConfig[] = [
  {
    key: "CucTruong",
    label: "Cục trưởng",
    badge: "Lãnh đạo Cục",
    icon: <CrownOutlined style={{ color: "#d97706", fontSize: 18 }} />,
    scope: "Áp dụng cho các đơn vị cấp Cục",
    sampleUsername: "cuctruong_{ma_don_vi}",
    description: "Tạo tài khoản Cục trưởng và gán quyền Lãnh đạo Cục (CucTruong)",
  },
  {
    key: "PhoCucTruong",
    label: "Phó Cục trưởng (Cục phó)",
    badge: "Lãnh đạo Cục",
    icon: <CrownOutlined style={{ color: "#0284c7", fontSize: 18 }} />,
    scope: "Áp dụng cho các đơn vị cấp Cục",
    sampleUsername: "phocuctruong_{ma_don_vi}",
    description: "Tạo tài khoản Phó Cục trưởng và gán quyền Phó Cục trưởng (PhoCucTruong)",
  },
  {
    key: "TruongPhong",
    label: "Trưởng phòng",
    badge: "Lãnh đạo Phòng",
    icon: <SolutionOutlined style={{ color: "#059669", fontSize: 18 }} />,
    scope: "Áp dụng cho tất cả các phòng ban / đơn vị",
    sampleUsername: "truongphong_{ma_phong_ban}",
    description: "Tạo tài khoản Trưởng phòng và gán quyền Trưởng phòng (TruongPhong)",
  },
  {
    key: "PhoTruongPhong",
    label: "Phó Trưởng phòng",
    badge: "Lãnh đạo Phòng",
    icon: <TeamOutlined style={{ color: "#7c3aed", fontSize: 18 }} />,
    scope: "Áp dụng cho tất cả các phòng ban / đơn vị",
    sampleUsername: "photruongphong_{ma_phong_ban}",
    description: "Tạo tài khoản Phó Trưởng phòng và gán quyền Phó Trưởng phòng (PhoTruongPhong)",
  },
  {
    key: "QLNS_DonVi",
    label: "Quản lý nhân sự (QLNS)",
    badge: "Quản lý nhân sự",
    icon: <SafetyCertificateOutlined style={{ color: "#e11d48", fontSize: 18 }} />,
    scope: "Chỉ áp dụng cho cấp Đơn vị (Bộ, Cục, Vụ, Viện, Trường...)",
    sampleUsername: "qlns_{ma_don_vi}",
    description: "Tạo tài khoản Quản lý nhân sự và gán quyền QLNS đơn vị (QLNS_DonVi) cho cấp Đơn vị (không tạo cho cấp Phòng ban)",
  },
  {
    key: "ALL_LEADERSHIP",
    label: "Tất cả các chức danh Lãnh đạo (Cục trưởng, Cục phó, Trưởng phòng, Phó TP)",
    badge: "Tạo đồng loạt",
    icon: <ThunderboltOutlined style={{ color: "#f59e0b", fontSize: 18 }} />,
    scope: "Tự động tạo toàn bộ tài khoản lãnh đạo cho tất cả các đơn vị",
    sampleUsername: "cuctruong_*, phocuctruong_*, truongphong_*, photruongphong_*",
    description: "Khởi tạo đồng loạt 4 vai trò lãnh đạo trong 1 lần thực thi",
  },
];

const ModalTaoTaiKhoanNhanh: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<string>("TruongPhong");
  const [loading, setLoading] = useState<boolean>(false);

  const currentConfig = roleConfigs.find((r) => r.key === selectedRole) || roleConfigs[0];

  const handleCreate = async () => {
    setLoading(true);
    try {
      let res: any;
      if (selectedRole === "CucTruong") {
        res = await userService.createCucTruongAccountForDepartments();
      } else if (selectedRole === "PhoCucTruong") {
        res = await userService.createPhoCucTruongAccountForDepartments();
      } else if (selectedRole === "TruongPhong") {
        res = await userService.createTruongPhongAccountForDepartments();
      } else if (selectedRole === "PhoTruongPhong") {
        res = await userService.createPhoTruongPhongAccountForDepartments();
      } else if (selectedRole === "QLNS_DonVi") {
        res = await userService.createQuickAccountForDepartments();
      } else if (selectedRole === "ALL_LEADERSHIP") {
        res = await userService.createAllLeadershipAccounts();
      }

      if (res?.status || res?.data) {
        const data = res.data;
        if (selectedRole === "ALL_LEADERSHIP") {
          message.success("Đã hoàn tất tạo tài khoản cho tất cả các chức danh Lãnh đạo!");
        } else {
          const successCount = data?.successCount ?? 0;
          const skipCount = data?.skipCount ?? 0;
          message.success(
            `Tạo tài khoản ${currentConfig.label} thành công: ${successCount} tạo mới, ${skipCount} đã tồn tại/cập nhật quyền.`
          );
        }
        onSuccess();
        onClose();
      } else {
        message.error(res?.message || "Có lỗi xảy ra khi tạo tài khoản");
      }
    } catch (error: any) {
      console.error("Lỗi khi tạo tài khoản nhanh:", error);
      message.error("Có lỗi xảy ra: " + (error?.message || error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <UserAddOutlined style={{ color: "#0355a2", fontSize: 20 }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0355a2", textTransform: "uppercase" }}>
            Tạo tài khoản nhanh theo vai trò
          </span>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      width={720}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Đóng
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<CheckCircleOutlined />}
          loading={loading}
          onClick={handleCreate}
          style={{ backgroundColor: "#0355a2", borderColor: "#0355a2" }}
        >
          Khởi tạo tài khoản
        </Button>,
      ]}
      styles={{
        header: { padding: "16px 24px", borderBottom: "1px solid #f0f0f0" },
        body: { padding: "20px 24px" },
      }}
    >
      <Alert
        type="info"
        showIcon
        className="mb-4"
        message="Khởi tạo tài khoản tự động"
        description="Hệ thống sẽ tự động rà soát danh sách phòng ban / đơn vị và tạo tài khoản tương ứng nếu chưa tồn tại. Nếu tài khoản đã có, hệ thống sẽ tự động gán bổ sung quyền vào tài khoản đó."
      />

      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ fontSize: 14, color: "#1e293b" }}>
          Chọn vai trò cần tạo tài khoản:
        </Text>
      </div>

      <Radio.Group
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        style={{ width: "100%" }}
      >
        <Space direction="vertical" style={{ width: "100%", gap: 10 }}>
          {roleConfigs.map((rc) => {
            const isSelected = selectedRole === rc.key;
            return (
              <div
                key={rc.key}
                onClick={() => setSelectedRole(rc.key)}
                style={{
                  border: isSelected ? "2px solid #0355a2" : "1px solid #e2e8f0",
                  backgroundColor: isSelected ? "#f0f7ff" : "#ffffff",
                  borderRadius: 8,
                  padding: "12px 16px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Radio value={rc.key} style={{ width: "100%" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginLeft: 6 }}>
                    {rc.icon}
                    <Text strong style={{ fontSize: 14, color: isSelected ? "#0355a2" : "#334155" }}>
                      {rc.label}
                    </Text>
                    <Tag color={isSelected ? "blue" : "default"} style={{ marginLeft: 4 }}>
                      {rc.badge}
                    </Tag>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginLeft: 32, marginTop: 2 }}>
                    {rc.description}
                  </div>
                </Radio>
              </div>
            );
          })}
        </Space>
      </Radio.Group>

      <Divider style={{ margin: "16px 0" }} />

      <Card size="small" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0", borderRadius: 8 }}>
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary">Phạm vi tạo:</Text>
            <Text strong>{currentConfig.scope}</Text>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary">Cấu trúc Tên đăng nhập:</Text>
            <Tag color="cyan" style={{ fontFamily: "monospace", margin: 0 }}>
              {currentConfig.sampleUsername}
            </Tag>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary">Mật khẩu mặc định:</Text>
            <Tag color="green" style={{ fontFamily: "monospace", margin: 0 }}>
              12345678
            </Tag>
          </div>
        </Space>
      </Card>
    </Modal>
  );
};

export default ModalTaoTaiKhoanNhanh;
