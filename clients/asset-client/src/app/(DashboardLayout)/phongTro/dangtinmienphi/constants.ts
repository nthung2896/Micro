import { ImageItem } from "./types";

export const SAMPLE_HANOI_IMAGES: ImageItem[] = [
  {
    uid: "sample-1",
    url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    isAvatar: true,
  },
  {
    uid: "sample-2",
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    isAvatar: false,
  },
  {
    uid: "sample-3",
    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    isAvatar: false,
  },
  {
    uid: "sample-4",
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    isAvatar: false,
  },
];

export const SAMPLE_DESCRIPTIONS = {
  cauGiay: `
<p><strong>🌟 CHO THUÊ PHÒNG TRỌ KHÉP KÍN FULL ĐỒ - TRUNG TÂM CẦU GIẤY 🌟</strong></p>
<p>Phòng trọ mới xây cao cấp, thiết kế hiện đại, đầy đủ tiện nghi khép kín tại ngõ 68 Trần Thái Tông, Cầu Giấy, Hà Nội.</p>
<p><strong>📍 Vị trí đắc địa:</strong></p>
<ul>
  <li>Gần các trường đại học lớn: ĐH Quốc Gia, ĐH Sư Phạm, Học viện Báo chí &amp; Tuyên truyền, ĐH Thương Mại.</li>
  <li>Cách chợ Dịch Vọng 200m, siêu thị WinMart, khu phố ẩm thực sầm uất ngày đêm.</li>
  <li>Ngõ rộng thoáng, ô tô vào tận cửa, thuận tiện di chuyển sang Duy Tân, Xuân Thủy, Cầu Giấy.</li>
</ul>
<p><strong>🛋️ Full tiện nghi &amp; nội thất cao cấp:</strong></p>
<ul>
  <li>Điều hòa Inverter tiết kiệm điện, bình nóng lạnh dung tích lớn.</li>
  <li>Máy giặt riêng từng phòng, tủ lạnh 2 cánh.</li>
  <li>Giường nệm cao su 1m6 x 2m, tủ quần áo 3 cánh rộng rãi, bàn học/làm việc.</li>
  <li>Khu bếp riêng biệt mặt đá có bếp từ và máy hút mùi, không lo ám mùi vào phòng ngủ.</li>
  <li>Ban công thoáng mát đón ánh sáng tự nhiên, phơi đồ riêng biệt.</li>
</ul>
<p><strong>🔒 An ninh &amp; Dịch vụ:</strong></p>
<ul>
  <li>Cửa khóa vân tay cao cấp, camera an ninh giám sát 24/7.</li>
  <li>Giờ giấc tự do 24/24, không chung chủ, bạn bè đến chơi thoải mái.</li>
  <li>Chỗ để xe máy tầng 1 rộng rãi, an toàn.</li>
</ul>
`.trim(),
  studio: `
<p><strong>🏠 CHO THUÊ CĂN HỘ MINI STUDIO BAN CÔNG THOÁNG MÁT 🏠</strong></p>
<p>Căn hộ mini mới tinh, ngập tràn ánh sáng tự nhiên, phòng thiết kế dạng Studio hiện đại.</p>
<p><strong>Tiện nghi đầy đủ:</strong> Điều hòa, nóng lạnh, tủ lạnh, giường đệm cao cấp, tủ âm tường, khu bếp riêng rộng có kệ tủ bếp trên dưới.</p>
<p><strong>Dịch vụ &amp; An ninh:</strong> Thang máy tốc độ cao, khóa cổng vân tay bảo mật, wifi cáp quang từng tầng tốc độ cao, camera 24/7, dọn vệ sinh hàng tuần.</p>
<p><strong>Ưu tiên:</strong> Người đi làm hoặc sinh viên văn minh, có ý thức giữ gìn trật tự và vệ sinh chung.</p>
`.trim(),
};

export const AMENITY_CONFIG = [
  { key: "coDieuHoa", label: "Điều hòa", icon: "❄️" },
  { key: "coNongLanh", label: "Bình nóng lạnh", icon: "🚿" },
  { key: "coMayGiat", label: "Máy giặt", icon: "🧺" },
  { key: "coTuLanh", label: "Tủ lạnh", icon: "🧊" },
  { key: "coGiuongTu", label: "Giường nệm & Tủ đồ", icon: "🛏️" },
  { key: "coKeBep", label: "Khu bếp riêng / Kệ bếp", icon: "🍳" },
  { key: "coBanCong", label: "Ban công / Cửa sổ thoáng", icon: "🌅" },
  { key: "coThangMay", label: "Thang máy", icon: "🛗" },
  { key: "gioGiacTuDo", label: "Giờ giấc tự do 24/24", icon: "⏰" },
  { key: "khongChungChu", label: "Không chung chủ", icon: "🔑" },
  { key: "coChoDeXe", label: "Chỗ để xe an toàn", icon: "🛵" },
  { key: "coKhoaVanTay", label: "Khóa cửa vân tay", icon: "🔒" },
  { key: "choNuoiThuCung", label: "Cho nuôi thú cưng", icon: "🐾" },
];

export function formatVietnameseCurrencyWords(num?: number): string {
  if (!num || num <= 0) return "";
  if (num >= 1000000000) {
    const ty = (num / 1000000000).toFixed(2).replace(/\.00$/, "");
    return `${ty} tỷ đồng / tháng`;
  }
  if (num >= 1000000) {
    const trieuVal = Math.floor(num / 1000000);
    const nghinVal = Math.floor((num % 1000000) / 1000);
    let str = `${trieuVal} triệu`;
    if (nghinVal > 0) {
      str += ` ${nghinVal} nghìn`;
    }
    str += " đồng / tháng";
    return str;
  }
  if (num >= 1000) {
    return `${(num / 1000).toLocaleString("vi-VN")} nghìn đồng / tháng`;
  }
  return `${num.toLocaleString("vi-VN")} đồng / tháng`;
}
