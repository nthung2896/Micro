import React from "react";
import { ORG_INFO } from "@/configs/AppConfig";
import { useSelector } from "@/store/hooks";
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const Footer: React.FC = () => {
  const appConfig = useSelector((state) => state.general.appConfig);

  const orgName = appConfig?.tenDoanhNghiep || ORG_INFO.name;
  const address = appConfig?.diaChi || ORG_INFO.address;
  const phone = appConfig?.soDienThoai || ORG_INFO.hotlineHoSo;
  const email = appConfig?.email || ORG_INFO.email;

  return (
    <footer className="bg-transparent text-gray-600 text-xs px-4 py-2 mt-2 border-t border-gray-200">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
        <div>
          <div className="font-semibold uppercase tracking-wide text-gray-800">
            {orgName}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <EnvironmentOutlined />
            <span>Địa chỉ: {address}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <PhoneOutlined />
            <span>
              Hỗ trợ (Hồ sơ & Tài khoản), Hotline:{" "}
              <strong className="text-gray-800">{phone}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MailOutlined />
            <span>
              Email:{" "}
              <a
                href={`mailto:${email}`}
                className="text-gray-800 underline"
              >
                {email}
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
