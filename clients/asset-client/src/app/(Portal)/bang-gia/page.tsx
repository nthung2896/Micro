"use client";

import React from "react";
import Link from "next/link";
import { Breadcrumb, Collapse, Button, Card } from "antd";
import {
  HomeOutlined,
  ThunderboltFilled,
  QuestionCircleOutlined,
  PhoneOutlined,
  SafetyCertificateFilled,
  FireFilled,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import RoomBangGiaMatrix from "@/components/room-banggia/RoomBangGiaMatrix";

export default function BangGiaPage() {
  const faqItems = [
    {
      key: "1",
      label: (
        <span className="font-semibold text-slate-800">
          Làm thế nào để đăng tin VIP và thanh toán?
        </span>
      ),
      children: (
        <p className="text-slate-600 text-sm leading-relaxed">
          Sau khi đăng nhập, quý khách truy cập vào trang <strong>Đăng tin</strong>. Tại bước chọn gói tin, quý khách có thể chọn gói VIP tương ứng với nhu cầu (VIP Nổi Bật, VIP 1, VIP 2, VIP 3 hoặc Tin thường) và thời gian đăng (5 ngày, 10 ngày, 15 ngày, 30 ngày). Hệ thống hỗ trợ thanh toán qua chuyển khoản ngân hàng, quét mã QR VietQR tự động hoặc ví điện tử.
        </p>
      ),
    },
    {
      key: "2",
      label: (
        <span className="font-semibold text-slate-800">
          Tin VIP Nổi Bật có những ưu việt gì so với các tin khác?
        </span>
      ),
      children: (
        <p className="text-slate-600 text-sm leading-relaxed">
          <strong>Tin VIP Nổi Bật</strong> được ghim ở vị trí đầu tiên trên cùng của trang chủ và tất cả các trang kết quả tìm kiếm. Tiêu đề in hoa màu đỏ cỡ lớn, có biểu tượng 5 sao vàng nổi bật và hiển thị số điện thoại gọi trực tiếp. Tin được hệ thống tự động kích hoạt hiển thị ngay lập tức mà không cần chờ duyệt. Đặc biệt khi hết hạn thời gian VIP, tin sẽ được hệ thống tặng thêm 10 ngày hiển thị tin thường hoàn toàn miễn phí.
        </p>
      ),
    },
    {
      key: "3",
      label: (
        <span className="font-semibold text-slate-800">
          Tính năng "Đẩy tin" hoạt động như thế nào?
        </span>
      ),
      children: (
        <p className="text-slate-600 text-sm leading-relaxed">
          Mỗi lần thực hiện đẩy tin, tin đăng của bạn sẽ được đưa lên đầu danh sách của nhóm gói tin tương ứng (như vừa mới đăng). Điều này giúp tiếp cận khách thuê mới nhanh chóng và gia tăng tỷ lệ liên hệ mà không cần phải tạo lại tin đăng mới.
        </p>
      ),
    },
    {
      key: "4",
      label: (
        <span className="font-semibold text-slate-800">
          Tôi có được xuất hóa đơn VAT không?
        </span>
      ),
      children: (
        <p className="text-slate-600 text-sm leading-relaxed">
          Có. Nền tảng hỗ trợ xuất hóa đơn điện tử (VAT 8%) cho các cá nhân, tổ chức, công ty có nhu cầu. Quý khách vui lòng bật tùy chọn <em>"Giá bao gồm 8% VAT"</em> hoặc liên hệ bộ phận kế toán / chăm sóc khách hàng để được xuất hóa đơn theo thông tin doanh nghiệp.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white py-8 px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto">
          <Breadcrumb
            items={[
              {
                title: (
                  <Link href="/" className="text-blue-100 hover:text-white flex items-center gap-1">
                    <HomeOutlined /> Trang chủ
                  </Link>
                ),
              },
              {
                title: <span className="text-white font-medium">Bảng giá dịch vụ</span>,
              },
            ]}
            className="mb-4"
          />
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Bảng giá dịch vụ tin đăng phòng trọ
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Giải pháp tiếp cận khách thuê nhanh chóng, tăng hiệu quả cho thuê phòng trọ và căn hộ dịch vụ với chi phí tối ưu nhất.
            </p>
          </div>
        </div>
      </div>

      {/* Main Pricing Matrix Section */}
      <div className="max-w-[1240px] mx-auto px-2 sm:px-4 mt-6">
        <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-slate-200/80">
          <RoomBangGiaMatrix />
        </div>
      </div>

      {/* Value Proposition Highlights */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg text-2xl flex-shrink-0">
              <FireFilled />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Tiếp cận tối đa khách thuê
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Các gói VIP giúp tin đăng của bạn luôn nằm trong tầm mắt của hàng chục nghìn lượt tìm kiếm mỗi ngày.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg text-2xl flex-shrink-0">
              <ThunderboltFilled />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Kích hoạt hiển thị tức thì
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Tin VIP tự động duyệt ngay lập tức sau khi đăng, không làm gián đoạn kế hoạch cho thuê của bạn.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg text-2xl flex-shrink-0">
              <CustomerServiceOutlined />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Hỗ trợ 24/7 tận tâm
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Đội ngũ chăm sóc khách hàng luôn sẵn sàng tư vấn tối ưu nội dung và lựa chọn gói tin hiệu quả nhất.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mt-12">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <QuestionCircleOutlined className="text-blue-600 text-xl" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Câu hỏi thường gặp về bảng giá
            </h2>
          </div>
          <Collapse
            items={faqItems}
            defaultActiveKey={["1", "2"]}
            bordered={false}
            className="bg-transparent"
          />
        </div>
      </div>

      {/* Bottom Call to Action */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mt-12">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center shadow-lg relative overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Bạn đã sẵn sàng tìm kiếm khách thuê nhanh chóng?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto mb-6">
            Đăng tin ngay hôm nay để nhận được lượt tiếp cận cao nhất và tối ưu hóa doanh thu phòng trọ của bạn.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dang-tin">
              <Button
                size="large"
                type="primary"
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold border-none h-11 px-8 rounded-lg shadow"
              >
                Đăng tin ngay
              </Button>
            </Link>
            <Button
              size="large"
              ghost
              icon={<PhoneOutlined />}
              className="text-white border-white hover:border-amber-300 hover:text-amber-300 h-11 px-6 rounded-lg"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "tel:0988123456";
                }
              }}
            >
              Hotline: 0988.123.456
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
