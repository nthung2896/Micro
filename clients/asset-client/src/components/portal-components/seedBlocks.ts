// Seed blocks mẫu — dùng làm fallback khi API HomeBlock chưa có data.
// Khi backend đã có dữ liệu thật, list này sẽ tự động bị thay thế.
// Body dùng JSX (className) + Tailwind. Template engine sẽ tự convert className → class.

import { HomeBlockDto } from "@/types/homeBlock";

const HERO_BODY = `
<section
  className="relative overflow-hidden pt-14 pb-40"
  style={{
    backgroundImage: "url('/images/bg-hero.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  <div className="absolute inset-0 bg-white/40"></div>

  <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
    <div>
      <div className="text-xl md:text-2xl font-bold text-[#0143DF] tracking-wide mb-1">
        QUẢN LÝ HOẠT ĐỘNG
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-[#0143DF] leading-tight mb-3">
        THƯƠNG MẠI ĐIỆN TỬ
      </h1>
      <div className="text-[#0143DF]/80 text-sm mb-6">
        Minh bạch – An toàn – Phát triển bền vững
      </div>

      <form className="flex gap-2 max-w-xl mb-4">
        <div className="flex-1 flex items-center gap-2 px-5 h-12 rounded-full bg-white border border-[#bcdcff] shadow-[0_2px_8px_rgba(15,67,143,0.06)]">
          <Icon name="SearchOutlined" className="text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Tìm kiếm thông tin, nền tảng, doanh nghiệp..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <button
          type="submit"
          className="px-7 h-12 rounded-full bg-linear-to-r from-[#1067c4] to-[#3b8df0] text-white font-semibold text-sm shadow-[0_4px_14px_rgba(15,103,196,0.35)] hover:opacity-95 transition"
        >
          Tìm kiếm
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-600 font-medium">Tìm kiếm phổ biến:</span>
        <a className="px-4 py-1 rounded-full bg-white border border-[#bcdcff] text-[#0143DF] hover:bg-[#e8f1ff] transition cursor-pointer">Shopee</a>
        <a className="px-4 py-1 rounded-full bg-white border border-[#bcdcff] text-[#0143DF] hover:bg-[#e8f1ff] transition cursor-pointer">Lazada</a>
        <a className="px-4 py-1 rounded-full bg-white border border-[#bcdcff] text-[#0143DF] hover:bg-[#e8f1ff] transition cursor-pointer">Tiki</a>
        <a className="px-4 py-1 rounded-full bg-white border border-[#bcdcff] text-[#0143DF] hover:bg-[#e8f1ff] transition cursor-pointer">TikTok Shop</a>
      </div>
    </div>

    <div className="hidden md:flex justify-center items-center">
      <Icon name="ShoppingCartOutlined" className="text-[220px] text-[#3b8df0]/70 leading-none" />
    </div>
  </div>

  <div className="max-w-[1280px] mx-auto px-6 -mt-14 relative z-20">
    <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(15,67,143,0.08)] border border-gray-100 px-6 py-8 grid grid-cols-2 md:grid-cols-5 gap-6">
      <a className="flex flex-col items-center text-center cursor-pointer group">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#4f7bf0] to-[#3b8df0] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(59,141,240,0.35)] mb-3 group-hover:scale-105 transition">
          <Icon name="AppstoreOutlined" className="text-2xl" />
        </div>
        <div className="font-semibold text-gray-800 text-sm mb-2">Khai báo nền tảng</div>
        <div className="text-xs text-gray-500 leading-relaxed">Đăng ký và khai báo thông tin nền tảng thương mại điện tử</div>
      </a>

      <a className="flex flex-col items-center text-center cursor-pointer group">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#34d399] to-[#10b981] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(16,185,129,0.35)] mb-3 group-hover:scale-105 transition">
          <Icon name="AuditOutlined" className="text-2xl" />
        </div>
        <div className="font-semibold text-gray-800 text-sm mb-2">Khai báo HĐ TMĐT<br/>dịch vụ hỗ trợ</div>
        <div className="text-xs text-gray-500 leading-relaxed">Đăng ký và khai báo hoạt động dịch vụ hỗ trợ thương mại điện tử</div>
      </a>

      <a className="flex flex-col items-center text-center cursor-pointer group">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#a78bfa] to-[#8b5cf6] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)] mb-3 group-hover:scale-105 transition">
          <Icon name="BellOutlined" className="text-2xl" />
        </div>
        <div className="font-semibold text-gray-800 text-sm mb-2">Thông báo hệ thống</div>
        <div className="text-xs text-gray-500 leading-relaxed">Cập nhật thông báo và thông tin quan trọng từ hệ thống</div>
      </a>

      <a className="flex flex-col items-center text-center cursor-pointer group">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#60a5fa] to-[#2563eb] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(37,99,235,0.35)] mb-3 group-hover:scale-105 transition">
          <Icon name="FileSearchOutlined" className="text-2xl" />
        </div>
        <div className="font-semibold text-gray-800 text-sm mb-2">Tra cứu chứng thực<br/>hợp đồng điện tử</div>
        <div className="text-xs text-gray-500 leading-relaxed">Xác thực và tra cứu thông tin hợp đồng điện tử</div>
      </a>

      <a className="flex flex-col items-center text-center cursor-pointer group">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#fb923c] to-[#f97316] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(249,115,22,0.35)] mb-3 group-hover:scale-105 transition">
          <Icon name="MessageOutlined" className="text-2xl" />
        </div>
        <div className="font-semibold text-gray-800 text-sm mb-2">Phản ánh – Khiếu nại</div>
        <div className="text-xs text-gray-500 leading-relaxed">Gửi phản ánh, khiếu nại và theo dõi kết quả xử lý</div>
      </a>
    </div>
  </div>
</section>`.trim();

export const SEED_HOME_BLOCKS: HomeBlockDto[] = [
  {
    id: "seed-hero",
    code: "HOME_HERO",
    title: "Banner trang chủ",
    position: "home",
    sortOrder: 10,
    isActive: true,
    bodyType: "html",
    dataSource: "",
    body: HERO_BODY,
  },

  {
    id: "seed-search",
    code: "HOME_SEARCH",
    title: "Khối tra cứu nhanh",
    position: "home",
    sortOrder: 20,
    isActive: true,
    bodyType: "html",
    dataSource: "",
    body: `
<section className="bg-[#f4f8ff] py-10">
  <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="text-[#0143DF] font-bold uppercase mb-3">
        Tra cứu nền tảng, chứng thực HĐĐT
      </div>
      <div className="flex gap-2 mb-3">
        <input placeholder="Nhập tên doanh nghiệp, nền tảng..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"/>
        <button className="bg-[#0143DF] text-white px-4 py-2 rounded-md hover:bg-[#0136B5] transition">
          Tìm kiếm
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">Shopee</span>
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">Lazada</span>
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">Tiki</span>
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">Tiktok Shop</span>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-blue-50 rounded-xl p-4 text-center cursor-pointer hover:shadow-md transition">
        <div className="text-3xl mb-2">📦</div>
        <div className="text-sm font-semibold text-[#0143DF]">Khai báo nền tảng</div>
        <div className="text-[11px] text-gray-500 mt-1">Khai báo nền tảng TMĐT</div>
      </div>
      <div className="bg-green-50 rounded-xl p-4 text-center cursor-pointer hover:shadow-md transition">
        <div className="text-3xl mb-2">✅</div>
        <div className="text-sm font-semibold text-[#0143DF]">Khai báo chứng thực</div>
        <div className="text-[11px] text-gray-500 mt-1">Dịch vụ chứng thực HĐĐT</div>
      </div>
      <div className="bg-red-50 rounded-xl p-4 text-center cursor-pointer hover:shadow-md transition">
        <div className="text-3xl mb-2">⚠️</div>
        <div className="text-sm font-semibold text-[#0143DF]">Phản ánh khiếu nại</div>
        <div className="text-[11px] text-gray-500 mt-1">Tiếp nhận phản ánh</div>
      </div>
    </div>
  </div>
</section>`.trim(),
  },

  {
    id: "seed-platforms",
    code: "HOME_PLATFORMS",
    title: "Nền tảng đã duyệt",
    position: "home",
    sortOrder: 30,
    isActive: true,
    bodyType: "html",
    dataSource: "platforms.all",
    body: `
<section className="bg-[#f4f8ff] py-8">
  <div className="max-w-[1280px] mx-auto px-4">
    <h2 className="text-center text-2xl font-bold text-[#0143DF] mb-5">
      NỀN TẢNG ĐƯỢC DUYỆT
    </h2>
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {{#each items}}
        <div className="group border border-gray-200 rounded-xl p-4 bg-white flex flex-col items-center text-center hover:shadow-md transition cursor-pointer">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-3 overflow-hidden shadow-[0_6px_16px_rgba(15,67,143,0.15)] group-hover:scale-105 transition">
            {{#if logo}}<img src="{{logo}}" alt="{{name}}" className="w-full h-full object-cover" />{{/if}}
          </div>
          <div className="font-semibold text-sm text-gray-800 truncate w-full">{{name}}</div>
          <div className="text-[11px] text-gray-500 truncate w-full mb-3">{{domain}}</div>
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-0.5 rounded-full text-[11px] font-medium">
            <Icon name="CheckCircleOutlined" />
            Đã duyệt
          </span>
        </div>
        {{/each}}
      </div>
    </div>
  </div>
</section>`.trim(),
  },

  {
    id: "seed-stats",
    code: "HOME_STATS",
    title: "Thống kê tăng trưởng",
    position: "home",
    sortOrder: 50,
    isActive: true,
    bodyType: "html",
    dataSource: "stats.growth",
    body: `
<section className="bg-linear-to-b from-[#0a2540] to-[#0a3a6e] text-white py-10">
  <div className="max-w-[1200px] mx-auto px-4">
    <h2 className="text-center text-yellow-300 text-xl font-bold uppercase">
      Thống kê tăng trưởng
    </h2>
    <div className="text-center text-white/80 mb-6">
      Nền thương mại điện tử hàng năm
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-300">★</span>
          <span className="text-yellow-300 font-bold uppercase text-sm">Trong nước</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {{#each domestic}}
          <div className="text-center">
            <div className="text-2xl font-bold">{{value}}</div>
            <div className="text-[10px] text-green-300 font-semibold">{{delta}}</div>
            <div className="text-[10px] text-white/70 mt-1">{{label}}</div>
          </div>
          {{/each}}
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-300">★</span>
          <span className="text-yellow-300 font-bold uppercase text-sm">Nước ngoài</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {{#each foreign}}
          <div className="text-center">
            <div className="text-2xl font-bold">{{value}}</div>
            <div className="text-[10px] text-green-300 font-semibold">{{delta}}</div>
            <div className="text-[10px] text-white/70 mt-1">{{label}}</div>
          </div>
          {{/each}}
        </div>
      </div>
    </div>
  </div>
</section>`.trim(),
  },

  {
    id: "seed-notifications",
    code: "HOME_NOTIFICATIONS",
    title: "Thông báo - Cảnh báo",
    position: "home",
    sortOrder: 60,
    isActive: true,
    bodyType: "html",
    dataSource: "notifications.latest",
    body: `
<section className="py-10">
  <div className="max-w-[1200px] mx-auto px-4">
    <h2 className="text-[#0143DF] font-bold uppercase text-lg mb-5">
      Thông báo - Cảnh báo
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {{#each items}}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex gap-3 hover:shadow-md transition cursor-pointer">
        <div
          className="w-12 h-12 rounded-md flex items-center justify-center text-xl shrink-0"
          style={{ background: "{{color}}20", color: "{{color}}" }}
        >
          {{thumb}}
        </div>
        <div className="flex-1 min-w-0">
          <span
            className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded mb-1"
            style={{ background: "{{color}}20", color: "{{color}}" }}
          >
            {{type}}
          </span>
          <div className="text-sm text-gray-800 leading-snug line-clamp-3">{{title}}</div>
          <div className="text-[11px] text-gray-500 mt-2">🕒 {{date}}</div>
        </div>
      </div>
      {{/each}}
    </div>
  </div>
</section>`.trim(),
  },

  {
    id: "seed-departments",
    code: "HOME_DEPARTMENTS",
    title: "Danh sách Sở Công Thương",
    position: "home",
    sortOrder: 70,
    isActive: true,
    bodyType: "html",
    dataSource: "departments.list",
    body: `
<section className="bg-[#f4f8ff] py-10">
  <div className="max-w-[1200px] mx-auto px-4">
    <h2 className="text-[#0143DF] font-bold uppercase text-lg mb-5">
      Danh sách 34 Sở Công Thương
    </h2>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm text-gray-700">
          {{#each items}}
          <a href="/{{code}}" className="flex gap-2 py-1 border-b border-dashed border-gray-100 hover:text-[#0143DF] cursor-pointer block text-gray-700 hover:no-underline">
            <span className="text-gray-400 w-6 text-right">{{index}}</span>
            <span className="truncate">{{name}}</span>
          </a>
          {{/each}}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center">
        <svg viewBox="6 6 310 371" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[340px] h-auto">
          <linearGradient id="vnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#dbeafe"></stop>
            <stop offset="50%" stop-color="#fef3c7"></stop>
            <stop offset="100%" stop-color="#d1fae5"></stop>
          </linearGradient>
          <path d="M 142.2 222.0 L 141.5 216.2 L 143.6 213.6 L 145.3 209.9 L 142.0 204.8 L 139.6 202.3 L 134.8 197.0 L 138.7 192.3 L 137.5 188.9 L 132.1 183.8 L 127.0 181.0 L 125.1 177.3 L 122.0 179.8 L 118.1 167.0 L 114.7 164.3 L 112.0 158.9 L 101.2 151.2 L 95.0 141.5 L 92.2 138.2 L 89.5 137.7 L 86.6 135.3 L 82.6 129.2 L 82.7 124.2 L 74.7 122.1 L 68.5 117.9 L 62.4 114.3 L 54.7 110.9 L 55.4 107.2 L 58.4 104.7 L 58.2 100.9 L 65.4 100.1 L 71.1 102.0 L 76.0 96.1 L 79.0 92.8 L 78.2 89.1 L 72.6 85.4 L 64.9 81.6 L 68.1 75.2 L 63.6 71.2 L 59.8 69.4 L 52.0 71.5 L 49.0 74.6 L 46.2 74.7 L 41.6 72.7 L 36.1 71.9 L 30.4 66.2 L 28.8 62.4 L 29.5 57.2 L 30.7 53.0 L 26.8 47.5 L 22.6 48.6 L 17.4 41.9 L 10.9 35.5 L 12.8 33.0 L 16.5 26.9 L 20.9 26.3 L 27.8 29.1 L 33.0 31.3 L 39.2 24.2 L 43.5 29.1 L 47.7 24.0 L 54.2 30.5 L 57.1 25.2 L 63.5 26.2 L 70.0 23.5 L 75.0 21.5 L 78.9 15.2 L 84.9 12.7 L 88.7 11.2 L 93.3 15.0 L 98.7 18.7 L 102.6 20.8 L 111.3 22.5 L 119.9 22.6 L 124.6 24.2 L 119.9 28.5 L 119.1 35.5 L 121.1 40.7 L 122.8 43.2 L 128.4 45.2 L 133.7 50.4 L 141.1 53.5 L 148.1 51.8 L 152.2 57.1 L 151.1 55.0 L 149.5 55.5 L 148.9 56.2 L 146.9 58.2 L 145.1 58.8 L 144.4 59.7 L 142.4 60.0 L 139.7 60.4 L 138.6 63.5 L 138.6 67.2 L 135.1 68.3 L 131.8 67.9 L 131.6 67.2 L 130.6 67.3 L 130.0 68.3 L 126.1 68.1 L 126.6 69.4 L 124.7 69.6 L 124.3 67.2 L 120.7 67.4 L 123.0 69.3 L 123.3 72.7 L 123.5 75.0 L 121.4 76.8 L 120.4 77.6 L 119.2 80.7 L 119.3 83.1 L 119.2 85.9 L 118.6 85.6 L 114.7 87.1 L 109.8 92.1 L 107.6 91.6 L 103.8 94.8 L 102.9 97.9 L 100.6 102.5 L 100.3 105.6 L 100.3 109.5 L 98.6 114.2 L 96.4 119.5 L 98.2 121.2 L 99.7 123.1 L 105.2 132.1 L 111.6 136.4 L 113.2 139.2 L 115.6 138.6 L 115.9 144.5 L 115.4 147.6 L 114.4 148.2 L 120.3 153.9 L 134.0 167.4 L 134.1 168.6 L 144.1 175.9 L 144.8 176.7 L 145.6 177.7 L 149.1 180.1 L 150.2 183.2 L 154.3 182.5 L 156.2 184.8 L 158.8 188.5 L 160.1 188.8 L 160.3 186.3 L 161.7 187.6 L 163.7 193.2 L 170.7 202.1 L 171.3 204.1 L 173.0 206.8 L 173.5 204.3 L 176.6 208.5 L 176.1 209.9 L 176.1 211.5 L 180.6 222.8 L 180.3 225.1 L 184.3 236.0 L 186.0 242.3 L 184.1 243.9 L 184.7 248.9 L 185.4 250.5 L 185.0 250.2 L 186.1 252.2 L 185.7 252.8 L 184.1 254.1 L 185.7 256.2 L 186.0 256.6 L 185.9 260.1 L 189.9 266.7 L 188.6 267.0 L 189.1 271.7 L 188.6 273.3 L 187.7 272.4 L 187.3 269.6 L 183.4 272.6 L 184.3 274.1 L 185.7 277.7 L 184.8 278.6 L 183.5 278.7 L 182.8 281.4 L 183.6 283.7 L 185.5 289.0 L 184.2 291.1 L 182.8 286.9 L 183.3 291.4 L 183.1 296.5 L 179.8 298.1 L 179.1 301.1 L 173.2 305.3 L 169.0 308.3 L 163.2 312.0 L 156.1 315.3 L 148.6 321.1 L 140.0 325.7 L 134.8 326.5 L 131.5 325.1 L 129.3 325.4 L 130.1 321.6 L 129.8 323.6 L 129.1 322.6 L 128.2 324.4 L 124.2 320.5 L 123.6 322.9 L 121.1 325.1 L 120.1 326.5 L 123.6 326.5 L 115.7 329.3 L 124.6 333.5 L 121.4 336.2 L 119.5 337.6 L 113.6 331.9 L 121.5 340.7 L 108.3 331.4 L 111.0 335.3 L 118.8 343.4 L 114.8 348.4 L 107.0 343.8 L 109.5 352.8 L 90.5 361.7 L 76.4 372.2 L 76.5 370.0 L 77.5 369.0 L 76.0 367.2 L 77.0 343.6 L 83.1 338.3 L 74.1 331.5 L 71.1 333.1 L 68.9 329.1 L 67.5 327.9 L 73.2 324.3 L 80.8 315.5 L 87.9 316.5 L 97.0 312.8 L 102.8 316.6 L 108.1 314.9 L 108.2 310.6 L 102.2 306.1 L 100.5 299.0 L 104.6 295.4 L 113.4 295.8 L 115.2 293.0 L 116.1 289.2 L 124.7 286.5 L 137.3 280.2 L 142.9 275.8 L 141.2 265.8 L 144.4 253.9 L 140.2 242.0 L 137.9 238.3 L 138.3 230.4 L 141.2 227.3 Z" fill="url(#vnGrad)" stroke="#3b82f6" stroke-width="0.6" stroke-linejoin="round"></path>
          <circle cx="250" cy="170" r="1.5" fill="#3b82f6"></circle>
          <circle cx="258" cy="174" r="1.5" fill="#3b82f6"></circle>
          <circle cx="252" cy="180" r="1" fill="#3b82f6"></circle>
          <circle cx="262" cy="184" r="1" fill="#3b82f6"></circle>
          <circle cx="246" cy="186" r="1" fill="#3b82f6"></circle>
          <text x="244" y="195" font-size="7" fill="#1e40af" font-weight="bold">HOÀNG SA</text>
          <circle cx="285" cy="315" r="1.5" fill="#3b82f6"></circle>
          <circle cx="295" cy="320" r="1" fill="#3b82f6"></circle>
          <circle cx="290" cy="328" r="1" fill="#3b82f6"></circle>
          <circle cx="300" cy="332" r="1" fill="#3b82f6"></circle>
          <circle cx="278" cy="336" r="1" fill="#3b82f6"></circle>
          <circle cx="298" cy="342" r="1.5" fill="#3b82f6"></circle>
          <circle cx="285" cy="346" r="1" fill="#3b82f6"></circle>
          <text x="276" y="356" font-size="7" fill="#1e40af" font-weight="bold">TRƯỜNG SA</text>
          <a href="/SCT_HN"><circle cx="101.3" cy="67.3" r="5" fill="#3b82f6"><title>Sở Công Thương Hà Nội</title></circle></a>
          <a href="/SCT_HP"><circle cx="121.9" cy="71.5" r="4" fill="#3b82f6"><title>Sở Công Thương Hải Phòng</title></circle></a>
          <a href="/SCT_QN"><circle cx="130.5" cy="67.8" r="4" fill="#3b82f6"><title>Sở Công Thương Quảng Ninh</title></circle></a>
          <a href="/SCT_BN"><circle cx="106.5" cy="63.6" r="4" fill="#3b82f6"><title>Sở Công Thương Bắc Ninh</title></circle></a>
          <a href="/SCT_PT"><circle cx="85.9" cy="60.2" r="4" fill="#3b82f6"><title>Sở Công Thương Phú Thọ</title></circle></a>
          <a href="/SCT_TN"><circle cx="101.1" cy="54.3" r="4" fill="#3b82f6"><title>Sở Công Thương Thái Nguyên</title></circle></a>
          <a href="/SCT_LC"><circle cx="55.3" cy="33.8" r="4" fill="#3b82f6"><title>Sở Công Thương Lào Cai</title></circle></a>
          <a href="/SCT_TQ"><circle cx="85.7" cy="39.4" r="4" fill="#3b82f6"><title>Sở Công Thương Tuyên Quang</title></circle></a>
          <a href="/SCT_CB"><circle cx="111.4" cy="27.1" r="4" fill="#3b82f6"><title>Sở Công Thương Cao Bằng</title></circle></a>
          <a href="/SCT_LS"><circle cx="123.6" cy="47.2" r="4" fill="#3b82f6"><title>Sở Công Thương Lạng Sơn</title></circle></a>
          <a href="/SCT_LCH"><circle cx="42.6" cy="33.8" r="4" fill="#3b82f6"><title>Sở Công Thương Lai Châu</title></circle></a>
          <a href="/SCT_DB"><circle cx="32" cy="58.5" r="4" fill="#3b82f6"><title>Sở Công Thương Điện Biên</title></circle></a>
          <a href="/SCT_SL"><circle cx="53.8" cy="60" r="4" fill="#3b82f6"><title>Sở Công Thương Sơn La</title></circle></a>
          <a href="/SCT_HY"><circle cx="106.2" cy="71.7" r="4" fill="#3b82f6"><title>Sở Công Thương Hưng Yên</title></circle></a>
          <a href="/SCT_NB"><circle cx="104.3" cy="86.4" r="4" fill="#3b82f6"><title>Sở Công Thương Ninh Bình</title></circle></a>
          <a href="/SCT_TH"><circle cx="99.4" cy="97.2" r="4" fill="#f59e0b"><title>Sở Công Thương Thanh Hóa</title></circle></a>
          <a href="/SCT_NA"><circle cx="79.1" cy="111.4" r="4" fill="#f59e0b"><title>Sở Công Thương Nghệ An</title></circle></a>
          <a href="/SCT_HT"><circle cx="102.8" cy="133.2" r="4" fill="#f59e0b"><title>Sở Công Thương Hà Tĩnh</title></circle></a>
          <a href="/SCT_QT"><circle cx="133.9" cy="170.7" r="4" fill="#f59e0b"><title>Sở Công Thương Quảng Trị</title></circle></a>
          <a href="/SCT_HUE"><circle cx="144" cy="179.2" r="4" fill="#f59e0b"><title>Sở Công Thương Huế</title></circle></a>
          <a href="/SCT_DN"><circle cx="159.1" cy="189.3" r="4" fill="#f59e0b"><title>Sở Công Thương Đà Nẵng</title></circle></a>
          <a href="/SCT_QNG"><circle cx="173.6" cy="212" r="4" fill="#f59e0b"><title>Sở Công Thương Quảng Ngãi</title></circle></a>
          <a href="/SCT_GL"><circle cx="156.5" cy="240" r="4" fill="#f59e0b"><title>Sở Công Thương Gia Lai</title></circle></a>
          <a href="/SCT_KH"><circle cx="182.9" cy="282.6" r="4" fill="#f59e0b"><title>Sở Công Thương Khánh Hòa</title></circle></a>
          <a href="/SCT_DLK"><circle cx="155.2" cy="271.1" r="4" fill="#f59e0b"><title>Sở Công Thương Đắk Lắk</title></circle></a>
          <a href="/SCT_LD"><circle cx="165" cy="289.9" r="4" fill="#f59e0b"><title>Sở Công Thương Lâm Đồng</title></circle></a>
          <a href="/SCT_HCM"><circle cx="120.4" cy="317.3" r="5" fill="#10b981"><title>Sở Công Thương Hồ Chí Minh</title></circle></a>
          <a href="/SCT_DNI"><circle cx="125.1" cy="311.2" r="4" fill="#10b981"><title>Sở Công Thương Đồng Nai</title></circle></a>
          <a href="/SCT_TNI"><circle cx="107.5" cy="305.3" r="4" fill="#10b981"><title>Sở Công Thương Tây Ninh</title></circle></a>
          <a href="/SCT_CT"><circle cx="99.9" cy="336.5" r="4" fill="#10b981"><title>Sở Công Thương Cần Thơ</title></circle></a>
          <a href="/SCT_VL"><circle cx="104.3" cy="331.3" r="4" fill="#10b981"><title>Sở Công Thương Vĩnh Long</title></circle></a>
          <a href="/SCT_DT"><circle cx="96" cy="326.4" r="4" fill="#10b981"><title>Sở Công Thương Đồng Tháp</title></circle></a>
          <a href="/SCT_AG"><circle cx="83.5" cy="327.9" r="4" fill="#10b981"><title>Sở Công Thương An Giang</title></circle></a>
          <a href="/SCT_CM"><circle cx="84.2" cy="357.5" r="4" fill="#10b981"><title>Sở Công Thương Cà Mau</title></circle></a>
        </svg>
        <div className="text-sm text-gray-600 mt-3 text-center">
          Bản đồ vị trí 34 Sở Công Thương trên toàn quốc
        </div>
        <div className="mt-4 flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span> Miền Bắc (15 tỉnh)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span> Miền Trung (11 tỉnh)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Miền Nam (8 tỉnh)
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`.trim(),
  },
];
