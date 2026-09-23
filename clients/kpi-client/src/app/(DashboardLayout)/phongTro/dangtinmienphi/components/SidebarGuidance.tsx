import React from "react";
import { Tag } from "antd";
import { InfoCircleOutlined, PhoneOutlined } from "@ant-design/icons";

export const SidebarGuidance: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Card Gói tin */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
            Gói tin áp dụng
          </span>
          <Tag color="green" className="font-bold border-none m-0">
            Đang hoạt động
          </Tag>
        </div>
        <h3 className="text-xl font-black text-white m-0">Gói Tin Miễn Phí</h3>
        <div className="text-3xl font-black mt-2 mb-3">0 VNĐ</div>
        <ul className="text-xs space-y-2 text-white/90 list-disc pl-4 mb-0">
          <li>
            Thời hạn hiển thị tin: <strong>60 ngày</strong>
          </li>
          <li>Tự động hiển thị trên bản đồ và danh sách tìm kiếm</li>
          <li>Tiếp cận hàng nghìn khách tìm phòng mỗi ngày</li>
          <li>Không giới hạn số lượt liên hệ từ khách thuê</li>
        </ul>
      </div>

      {/* Card Lưu ý khi đăng tin (Phong cách phongtro123) */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <InfoCircleOutlined className="text-amber-500" />
          Lưu ý khi đăng tin
        </h3>
        <ul className="text-xs text-gray-600 space-y-2.5 pl-4 list-disc mb-0 leading-relaxed">
          <li>
            <strong>Tiêu đề tin:</strong> Nên ghi rõ loại phòng + diện tích + vị trí (VD:{" "}
            <em>Phòng trọ khép kín full đồ ngõ 68 Cầu Giấy</em>).
          </li>
          <li>
            <strong>Giá cả & Chi phí:</strong> Ghi rõ giá thuê, giá điện nước, phí dịch vụ để người
            thuê dễ đưa ra quyết định.
          </li>
          <li>
            <strong>Hình ảnh thật:</strong> Đăng từ 3 - 5 ảnh chụp thực tế rõ nét giúp tăng{" "}
            <strong>80%</strong> tỷ lệ khách gọi điện xem phòng.
          </li>
          <li>
            <strong>Địa chỉ chính xác:</strong> Điền đúng số nhà và tên đường để tin hiển thị chuẩn trên
            bản đồ tìm kiếm.
          </li>
        </ul>
      </div>

      {/* Card Hỗ trợ khách hàng */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
        <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
          <PhoneOutlined className="text-[#0355a2]" />
          Hỗ trợ chủ trọ đăng tin
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Nếu bạn gặp khó khăn trong quá trình đăng tin, hãy liên hệ ngay với chúng tôi:
        </p>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Hotline hỗ trợ:</span>
            <a href="tel:0988123456" className="font-bold text-[#0355a2]">
              0988.123.456
            </a>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Zalo tư vấn:</span>
            <a
              href="https://zalo.me/0869590916"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-blue-600"
            >
              0869.590.916
            </a>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Thời gian làm việc:</span>
            <span className="font-medium text-gray-700">8:00 - 21:00 (T2 - CN)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
