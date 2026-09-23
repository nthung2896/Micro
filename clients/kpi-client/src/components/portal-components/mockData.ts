// Mock data cho trang Portal. Sau này thay bằng API thật.

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Phòng trọ cho thuê", href: "/?loai=phong-tro" },
  { label: "Chung cư mini", href: "/?loai=chung-cu-mini" },
  { label: "Căn hộ dịch vụ", href: "/?loai=can-ho" },
  { label: "Mặt bằng kinh doanh", href: "/?loai=mbkd" },
  { label: "Bảng giá dịch vụ", href: "/bang-gia" },
  { label: "Tin tức & Cẩm nang", href: "/tin-tuc" },
];

export const HERO_STATS = [
  { label: "Nền tảng đăng ký", value: "1.245" },
  { label: "Doanh nghiệp đã cấp", value: "8.526" },
  { label: "Hồ sơ đã duyệt", value: "12.450" },
  { label: "Báo cáo trực tuyến 24/7", value: "Trực tuyến" },
];

export const SEARCH_QUICK_TAGS = ["Tìm kiếm phổ biến", "Shopee", "Lazada", "Tiki", "Tiktok shop"];

export const SEARCH_CARDS = [
  {
    icon: "📦",
    title: "Khai báo nền tảng",
    desc: "Khai báo nền tảng TMĐT đang hoạt động",
    color: "#e8f1ff",
  },
  {
    icon: "✅",
    title: "Khai báo chứng thực",
    desc: "Khai báo dịch vụ chứng thực hợp đồng điện tử",
    color: "#e6f9ee",
  },
  {
    icon: "⚠️",
    title: "Phản ánh khiếu nại",
    desc: "Tiếp nhận phản ánh, khiếu nại của người dân",
    color: "#fdecec",
  },
];

export type Platform = {
  name: string;
  logo: string;
  domain: string;
  status: "approved";
};

export const PLATFORMS_DOMESTIC: Platform[] = [
  { name: "Mobifone", logo: "mobifone.vn", domain: "Đã duyệt", status: "approved" },
  { name: "Tiki", logo: "tiki.vn", domain: "Đã duyệt", status: "approved" },
  { name: "Sendo", logo: "sendo.vn", domain: "Đã duyệt", status: "approved" },
  { name: "TrangVangVang", logo: "trangvangvang.com", domain: "Đã duyệt", status: "approved" },
];

export const PLATFORMS_FOREIGN: Platform[] = [
  { name: "Alibaba", logo: "alibaba.com", domain: "Đã duyệt", status: "approved" },
  { name: "Vietnam", logo: "unicornb.com", domain: "Đã duyệt", status: "approved" },
  { name: "Temu", logo: "temu.com", domain: "Đã duyệt", status: "approved" },
  { name: "AliExpress", logo: "aliexpress.com", domain: "Đã duyệt", status: "approved" },
];

export const SOCIAL_DOMESTIC: Platform[] = [
  { name: "Chợ Tốt", logo: "chotot.com", domain: "Đã duyệt", status: "approved" },
  { name: "Vatgia", logo: "vatgia.com", domain: "Đã duyệt", status: "approved" },
  { name: "Zalo Shop", logo: "zalo.me", domain: "Đã duyệt", status: "approved" },
  { name: "Viettel Post", logo: "viettelpost.com.vn", domain: "Đã duyệt", status: "approved" },
];

export const SOCIAL_FOREIGN: Platform[] = [
  { name: "Meravan", logo: "meravan.com", domain: "Đã duyệt", status: "approved" },
  { name: "Facebook Marketplace", logo: "facebook.com", domain: "Đã duyệt", status: "approved" },
  { name: "TikTok Shop", logo: "tiktok.com", domain: "Đã duyệt", status: "approved" },
  { name: "Instagram Shopping", logo: "instagram.com", domain: "Đã duyệt", status: "approved" },
];

export const CERT_PROVIDERS: Platform[] = [
  { name: "CeCA", logo: "ceca.vn", domain: "Đã duyệt", status: "approved" },
  { name: "FPT.eContract", logo: "fpt.com.vn", domain: "Đã duyệt", status: "approved" },
  { name: "Viettel Connect", logo: "viettel.vn", domain: "Đã duyệt", status: "approved" },
  { name: "MISA AMIS", logo: "misa.vn", domain: "Đã duyệt", status: "approved" },
  { name: "iContract", logo: "icontract.vn", domain: "Đã duyệt", status: "approved" },
  { name: "SAVIS eContract", logo: "savis.vn", domain: "Đã duyệt", status: "approved" },
];

export const STATS_DOMESTIC = [
  { label: "Nền tảng đăng ký", value: "1.325", delta: "+28%" },
  { label: "Doanh nghiệp", value: "3.256", delta: "+35%" },
  { label: "Giao dịch", value: "843", delta: "+1%" },
];

export const STATS_FOREIGN = [
  { label: "Nền tảng đăng ký", value: "45.678", delta: "+32%" },
  { label: "Doanh nghiệp", value: "98.256", delta: "+30%" },
  { label: "Giao dịch", value: "12.458", delta: "+2%" },
];

export const STATS_CHART_DOMESTIC = [
  { year: "2019", value: 320 },
  { year: "2020", value: 480 },
  { year: "2021", value: 620 },
  { year: "2022", value: 780 },
  { year: "2023", value: 980 },
  { year: "2024", value: 1325 },
];

export const STATS_CHART_FOREIGN = [
  { year: "2019", value: 18000 },
  { year: "2020", value: 22500 },
  { year: "2021", value: 28000 },
  { year: "2022", value: 33500 },
  { year: "2023", value: 39800 },
  { year: "2024", value: 45678 },
];

export type Notification = {
  type: "THÔNG BÁO" | "CẢNH BÁO" | "KHUYẾN CÁO" | "PHÒNG CHỐNG LỪA ĐẢO";
  title: string;
  date: string;
  thumb: string; // emoji as placeholder
  color: string;
};

export const NOTIFICATIONS: Notification[] = [
  {
    type: "THÔNG BÁO",
    title: "Yêu cầu ngừng kinh doanh, gỡ bỏ thông tin sản phẩm dầu mọng nhãn hiệu a2 Platinum Premium USA nhiễm.",
    date: "Thứ Sáu, 09:00 09/05/2025",
    thumb: "📢",
    color: "#0355a2",
  },
  {
    type: "CẢNH BÁO",
    title: "Cảnh báo gia mạo Bộ Công Thương để vòi Phải duyệt do tin thuộc gia kiểm tra trên sàn.",
    date: "Thứ Sáu, 09:00 09/05/2025",
    thumb: "⚠️",
    color: "#ff4d4f",
  },
  {
    type: "KHUYẾN CÁO",
    title: "Yêu cầu ngừng kinh doanh, gỡ bỏ thông tin sản phẩm dầu mọng nhãn hiệu a2 Platinum Premium USA nhiễm.",
    date: "Thứ Sáu, 09:00 09/05/2025",
    thumb: "👤",
    color: "#faad14",
  },
  {
    type: "PHÒNG CHỐNG LỪA ĐẢO",
    title: "Yêu cầu xác minh thông tin kinh doanh sản phẩm trên các sàn nhân biểu mẫu a2 Platinum Premium USA nhiễm.",
    date: "Thứ Sáu, 09:00 09/05/2025",
    thumb: "🔒",
    color: "#13c2c2",
  },
  {
    type: "CẢNH BÁO",
    title: "Kiểm tra, rà soát và gỡ bỏ các sản phẩm/dịch vụ thuộc danh mục hàng hóa cấm kinh doanh.",
    date: "Thứ Sáu, 09:00 09/05/2025",
    thumb: "🎭",
    color: "#ff4d4f",
  },
  {
    type: "THÔNG BÁO",
    title: "Yêu cầu gỡ bỏ các thiết bị kích sóng điện thoại di động không chứng nhận hợp quy và CBHQ.",
    date: "Thứ Sáu, 09:00 09/05/2025",
    thumb: "📈",
    color: "#0355a2",
  },
];

// ---- Thống kê toàn cảnh (theo Sở) ----
// MOCK tạm thời, sinh số liệu ổn định theo deptCode + year (seeded random) cho tới khi
// backend có API thật (đề xuất: GET /api/HomeBlock/OverviewStats?deptCode=&year=).

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

function formatVi(n: number): string {
  return Math.round(n).toLocaleString("vi-VN");
}

function formatK(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k : k.toFixed(1)}K`;
  }
  return String(Math.round(n));
}

// Rút gọn số lớn (>=1000) thành dạng "X,XK" / "X,XM" theo kiểu Việt (dấu phẩy thập phân),
// dùng cho các ô số liệu dễ bị tràn layout (sellers, products) — số nhỏ hơn giữ nguyên formatVi.
function formatCompactVi(n: number): string {
  const round1 = (v: number) => Math.round(v * 10) / 10;
  const trim = (v: number) => (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1).replace(".", ","));
  if (n >= 1_000_000) return `${trim(round1(n / 1_000_000))}M`;
  if (n >= 1_000) return `${trim(round1(n / 1_000))}K`;
  return formatVi(n);
}

const CHART_LEFT = 50;
const CHART_RIGHT = 590;
const CHART_TOP = 10;
const CHART_BOTTOM = 210;
const CHART_W = CHART_RIGHT - CHART_LEFT;
const CHART_H = CHART_BOTTOM - CHART_TOP;
const MONTHS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

function buildMonthlySeries(rnd: () => number, finalValue: number, startRatio: number): number[] {
  const start = finalValue * startRatio;
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < 12; i++) {
    const remaining = 11 - i;
    const target = start + ((finalValue - start) * (i + 1)) / 12;
    const noise = (rnd() - 0.5) * (finalValue - start) * 0.12;
    v = remaining === 0 ? finalValue : Math.max(start * 0.9, target + noise);
    out.push(Math.round(v));
  }
  return out;
}

// Chuyển 1 dãy điểm thành SVG path "d" mượt bằng Catmull-Rom → Bezier (hệ số 1/6 chuẩn).
function smoothPath(xs: number[], ys: number[]): string {
  if (xs.length === 0) return "";
  if (xs.length === 1) return `M ${xs[0].toFixed(1)},${ys[0].toFixed(1)}`;
  const get = (i: number) => {
    const idx = Math.max(0, Math.min(xs.length - 1, i));
    return { x: xs[idx], y: ys[idx] };
  };
  let d = `M ${xs[0].toFixed(1)},${ys[0].toFixed(1)}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

export function buildOverviewStats(deptCode = "default", year = new Date().getFullYear()) {
  const rnd = seededRandom(`${deptCode}|${year}`);

  const platforms = Math.round(1800 + rnd() * 1500);
  const enterprises = Math.round(45000 + rnd() * 50000);
  const sellers = Math.round(3200000 + rnd() * 2500000);
  const products = Math.round(70000000 + rnd() * 60000000);
  const complaints = Math.round(800 + rnd() * 900);
  const underInspection = Math.round(60 + rnd() * 180);

  // Trend tháng dùng quy mô riêng (KHÔNG dùng trực tiếp số platforms/enterprises ở trên),
  // vì 2 tổng đó lệch nhau hàng chục lần — nếu vẽ chung 1 trục sẽ có 1 đường bị dẹt sát đáy.
  const platformsTrendFinal = Math.round(1900 + rnd() * 1300);
  const enterprisesTrendFinal = Math.round(900 + rnd() * 2200);
  const platformsMonthly = buildMonthlySeries(rnd, platformsTrendFinal, 0.45);
  const enterprisesMonthly = buildMonthlySeries(rnd, enterprisesTrendFinal, 0.45);

  const maxVal = Math.max(...platformsMonthly, ...enterprisesMonthly) * 1.15;
  const xs = MONTHS.map((_, i) => CHART_LEFT + (i / (MONTHS.length - 1)) * CHART_W);
  const valueToY = (v: number) => CHART_BOTTOM - (v / maxVal) * CHART_H;

  const platformsYs = platformsMonthly.map(valueToY);
  const enterprisesYs = enterprisesMonthly.map(valueToY);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((frac) => ({
    y: (CHART_BOTTOM - frac * CHART_H).toFixed(1),
    label: formatK(frac * maxVal),
  }));

  const monthLabels = MONTHS.map((m, i) => ({ x: xs[i].toFixed(1), label: m }));
  const platformsDots = xs.map((x, i) => ({ x: x.toFixed(1), y: platformsYs[i].toFixed(1) }));
  const enterprisesDots = xs.map((x, i) => ({ x: x.toFixed(1), y: enterprisesYs[i].toFixed(1) }));

  const platformsLinePath = smoothPath(xs, platformsYs);
  const enterprisesLinePath = smoothPath(xs, enterprisesYs);
  // Vùng tô mờ dưới đường "Nền tảng": nối thêm 2 điểm đáy để khép path lại thành vùng kín.
  const platformsAreaPath =
    `${platformsLinePath} L ${xs[xs.length - 1].toFixed(1)},${CHART_BOTTOM} ` +
    `L ${xs[0].toFixed(1)},${CHART_BOTTOM} Z`;

  const years = [year - 2, year - 1, year].map((y) => ({
    value: y,
    label: `Năm ${y}`,
    selectedAttr: y === year ? "selected" : "",
  }));

  return {
    year,
    platforms: formatVi(platforms),
    enterprises: formatVi(enterprises),
    sellers: formatCompactVi(sellers),
    products: formatCompactVi(products),
    complaints: formatVi(complaints),
    underInspection: formatVi(underInspection),
    years,
    yTicks,
    monthLabels,
    platformsLinePath,
    enterprisesLinePath,
    platformsAreaPath,
    platformsDots,
    enterprisesDots,
  };
}

export const DEPARTMENTS = [
  "Sở Công Thương Hà Nội",
  "Sở Công Thương TP. Hồ Chí Minh",
  "Sở Công Thương Hải Phòng",
  "Sở Công Thương Đà Nẵng",
  "Sở Công Thương Cần Thơ",
  "Sở Công Thương An Giang",
  "Sở Công Thương Bà Rịa - Vũng Tàu",
  "Sở Công Thương Bắc Giang",
  "Sở Công Thương Bắc Kạn",
  "Sở Công Thương Bắc Ninh",
  "Sở Công Thương Bình Dương",
  "Sở Công Thương Bình Định",
  "Sở Công Thương Bình Phước",
  "Sở Công Thương Bình Thuận",
  "Sở Công Thương Cao Bằng",
  "Sở Công Thương Đắk Lắk",
  "Sở Công Thương Điện Biên",
  "Sở Công Thương Đồng Nai",
  "Sở Công Thương Đồng Tháp",
  "Sở Công Thương Gia Lai",
  "Sở Công Thương Hà Giang",
  "Sở Công Thương Hà Nam",
  "Sở Công Thương Hà Tĩnh",
  "Sở Công Thương Hậu Giang",
  "Sở Công Thương Hòa Bình",
  "Sở Công Thương Hưng Yên",
  "Sở Công Thương Khánh Hòa",
  "Sở Công Thương Kiên Giang",
  "Sở Công Thương Kon Tum",
  "Sở Công Thương Lai Châu",
  "Sở Công Thương Lâm Đồng",
  "Sở Công Thương Lạng Sơn",
  "Sở Công Thương Lào Cai",
  "Sở Công Thương Long An",
];
