"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Button, Modal, Input, Tag, message } from "antd";
import {
  AppstoreOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  ContactsOutlined,
  ArrowLeftOutlined,
  SendOutlined,
  CheckCircleOutlined,
  DownSquareOutlined,
  UpSquareOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useSelector } from "@/store/hooks";
import phongTroService from "@/services/phongTro/phongTroService";
import tinhService from "@/services/tinh/tinh.service";
import xaService from "@/services/xa/xaService";
import minioService from "@/services/minio/minio.service";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";
import { buildMinioFileUrl } from "@/utils/file";

import { DangTinFormValues, ImageItem } from "./types";
import {
  SAMPLE_HANOI_IMAGES,
  SAMPLE_DESCRIPTIONS,
  formatVietnameseCurrencyWords,
} from "./constants";

import { AccordionCard } from "./components/AccordionCard";
import { LoaiChuyenMucSection } from "./components/LoaiChuyenMucSection";
import { KhuVucSection } from "./components/KhuVucSection";
import { ThongTinMoTaSection } from "./components/ThongTinMoTaSection";
import { TienIchChiPhiSection } from "./components/TienIchChiPhiSection";
import { HinhAnhSection } from "./components/HinhAnhSection";
import { VideoSection } from "./components/VideoSection";
import { ThongTinLienHeSection } from "./components/ThongTinLienHeSection";
import { SidebarGuidance } from "./components/SidebarGuidance";

const ALL_PANEL_KEYS = [
  "chuyen-muc",
  "khu-vuc",
  "thong-tin-mo-ta",
  "tien-ich",
  "hinh-anh",
  "video",
  "thong-tin-lien-he",
];

export default function DangTinMienPhiPage() {
  const router = useRouter();
  const [form] = Form.useForm<DangTinFormValues>();
  const user = useSelector((state: any) => state.auth.User);

  // Accordion state: Mặc định mở 2 mục đầu, các mục sau người dùng mở dần hoặc bấm "Mở tất cả"
  const [openPanels, setOpenPanels] = useState<string[]>(["chuyen-muc", "khu-vuc"]);

  // Options Tỉnh / Xã (đã loại bỏ Quận/Huyện)
  const [tinhOptions, setTinhOptions] = useState<{ label: string; value: string }[]>([]);
  const [xaOptions, setXaOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingXa, setLoadingXa] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Danh sách hình ảnh & Modal
  const [images, setImages] = useState<ImageItem[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  // Tiêu đề ký tự & Giá bằng chữ
  const [tieuDeLength, setTieuDeLength] = useState<number>(0);
  const [giaText, setGiaText] = useState<string>("");

  // Tiện ích toggles
  const [amenities, setAmenities] = useState<Record<string, boolean>>({
    gioGiacTuDo: true,
    khongChungChu: true,
    coChoDeXe: true,
    coKhoaVanTay: true,
    coDieuHoa: true,
    coNongLanh: true,
    coMayGiat: true,
    coTuLanh: true,
    coGiuongTu: true,
    coKeBep: true,
    coBanCong: true,
    coThangMay: true,
    choNuoiThuCung: false,
  });

  const togglePanel = (key: string) => {
    setOpenPanels((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const openNextPanel = (nextKey: string) => {
    if (!openPanels.includes(nextKey)) {
      setOpenPanels((prev) => [...prev, nextKey]);
    }
    setTimeout(() => {
      document.getElementById(nextKey)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const toggleAllPanels = () => {
    if (openPanels.length === ALL_PANEL_KEYS.length) {
      setOpenPanels(["chuyen-muc"]);
    } else {
      setOpenPanels([...ALL_PANEL_KEYS]);
    }
  };

  const syncImagesToForm = (updater: ImageItem[] | ((prev: ImageItem[]) => ImageItem[])) => {
    setImages((prevImages) => {
      const newImages = typeof updater === "function" ? updater(prevImages) : updater;
      const avatar = newImages.find((img) => img.isAvatar)?.url || newImages[0]?.url || "";
      const allUrls = newImages.map((img) => img.url).join(";");
      form.setFieldsValue({
        hinhAnhDaiDien: avatar,
        danhSachHinhAnh: allUrls,
      });
      return newImages;
    });
  };

  // 1. Tải danh sách Tỉnh/Thành
  useEffect(() => {
    const fetchTinh = async () => {
      try {
        const res: any = await tinhService.getData({ pageIndex: 1, pageSize: 100 } as any);
        if (res?.data?.items?.length > 0) {
          setTinhOptions(
            res.data.items.map((t: any) => ({
              label: t.tenTinh,
              value: t.maTinh,
            }))
          );
        } else {
          setTinhOptions([
            { label: "Thành phố Hà Nội", value: "01" },
            { label: "Thành phố Hồ Chí Minh", value: "79" },
            { label: "Đà Nẵng", value: "48" },
            { label: "Hải Phòng", value: "31" },
          ]);
        }
      } catch (err) {
        setTinhOptions([
          { label: "Thành phố Hà Nội", value: "01" },
          { label: "Thành phố Hồ Chí Minh", value: "79" },
          { label: "Đà Nẵng", value: "48" },
          { label: "Hải Phòng", value: "31" },
        ]);
      }
    };
    fetchTinh();
  }, []);

  // Hàm tải danh sách Phường/Xã trực tiếp theo Mã Tỉnh/TP
  const loadXaByTinh = async (maTinh: string) => {
    if (!maTinh) {
      setXaOptions([]);
      return;
    }
    try {
      setLoadingXa(true);
      const res: any = await xaService.getData({ maTinh, pageIndex: 1, pageSize: 500 } as any);
      if (res?.data?.items?.length > 0) {
        setXaOptions(
          res.data.items.map((x: any) => ({
            label: x.tenXa,
            value: x.maXa,
          }))
        );
      } else {
        setXaOptions([
          { label: "Phường Dịch Vọng Hậu", value: "00160" },
          { label: "Phường Dịch Vọng", value: "00163" },
          { label: "Phường Quan Hoa", value: "00166" },
          { label: "Phường Nghĩa Tân", value: "00157" },
          { label: "Phường Giảng Võ", value: "00025" },
          { label: "Phường Kim Liên", value: "00229" },
          { label: "Phường Khương Đình", value: "00364" },
        ]);
      }
    } catch (err) {
      console.warn("Không tải được danh sách xã:", err);
      setXaOptions([
        { label: "Phường Dịch Vọng Hậu", value: "00160" },
        { label: "Phường Dịch Vọng", value: "00163" },
        { label: "Phường Quan Hoa", value: "00166" },
        { label: "Phường Nghĩa Tân", value: "00157" },
        { label: "Phường Giảng Võ", value: "00025" },
        { label: "Phường Kim Liên", value: "00229" },
        { label: "Phường Khương Đình", value: "00364" },
      ]);
    } finally {
      setLoadingXa(false);
    }
  };

  // 2. Điền dữ liệu mặc định ban đầu
  useEffect(() => {
    const defaultData: any = {
      tieuDe: "Cho thuê phòng trọ khép kín full đồ ban công thoáng mát tại Cầu Giấy, Hà Nội",
      maPhong: "P.302",
      tenPhong: "Phòng Studio 302",
      loaiPhong: "Cho thuê phòng trọ",
      maTinh: "01",
      tenTinh: "Thành phố Hà Nội",
      maXa: "00160",
      tenXa: "Phường Dịch Vọng Hậu",
      soNha: "Số 15, Ngõ 68",
      duongPho: "Đường Trần Thái Tông",
      diaChi:
        "Số 15, Ngõ 68, Đường Trần Thái Tông, Phường Dịch Vọng Hậu, Thành phố Hà Nội",
      toaDo: "21.028511, 105.789123",
      dienTich: 28,
      tang: 3,
      soNguoiOToiDa: 2,
      soPhongNgu: 1,
      soPhongTam: 1,
      giaChoThue: 3800000,
      tienCoc: 3800000,
      giaDien: 3800,
      donViDien: "Số",
      giaNuoc: 30000,
      donViNuoc: "Khối",
      giaInternet: 100000,
      donViInternet: "Phòng",
      giaDichVuChung: 50000,
      donViDichVuChung: "Người",
      giaGuiXe: 100000,
      giaVeSinh: 30000,
      quyDinhGioGiac: "Tự do giờ giấc 24/24, ra vào bằng khóa vân tay bảo mật",
      tienNghiKhac: "Máy sấy quần áo, camera giám sát 24/7, sân phơi rộng rãi tầng thượng",
      hinhAnhDaiDien: SAMPLE_HANOI_IMAGES[0].url,
      danhSachHinhAnh: SAMPLE_HANOI_IMAGES.map((img) => img.url).join(";"),
      videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      tenLienHe: user?.fullName || "Nguyễn Văn Test",
      soDienThoaiLienHe: user?.phoneNumber || "0869590916",
      zaloLienHe: user?.phoneNumber || "0869590916",
      moTa: SAMPLE_DESCRIPTIONS.cauGiay,
      quyDinh:
        "- Không hút thuốc lá trong phòng và hành lang chung.\n- Giữ gìn trật tự sau 23h đêm.\n- Có ý thức giữ gìn vệ sinh chung.",
      trangThai: 0,
      ngayTrong: dayjs() as any,
      goiTin: 0,
      isNoiBat: true,
      trangThaiDuyet: 1,
    };

    form.setFieldsValue(defaultData);
    setTieuDeLength(defaultData.tieuDe.length);
    setGiaText(formatVietnameseCurrencyWords(defaultData.giaChoThue));
    setImages(SAMPLE_HANOI_IMAGES);

    // Tải danh sách Phường/Xã cho tỉnh mặc định (Hà Nội)
    loadXaByTinh("01");
  }, [form, user]);

  // Tự động cập nhật địa chỉ chính xác (không còn quận/huyện)
  const updateDiaChi = (changedValues?: any) => {
    const currentValues = form.getFieldsValue();
    const soNha = changedValues?.soNha !== undefined ? changedValues.soNha : currentValues.soNha;
    const duongPho =
      changedValues?.duongPho !== undefined ? changedValues.duongPho : currentValues.duongPho;
    const tenXa = changedValues?.tenXa !== undefined ? changedValues.tenXa : currentValues.tenXa;
    const tenTinh =
      changedValues?.tenTinh !== undefined ? changedValues.tenTinh : currentValues.tenTinh;

    const parts = [soNha, duongPho, tenXa, tenTinh].filter(Boolean);
    const fullAddress = parts.join(", ");
    form.setFieldsValue({ diaChi: fullAddress });
  };

  // Chọn Tỉnh/Thành phố -> Load trực tiếp danh sách Phường/Xã
  const handleTinhChange = async (maTinh: string, option?: any) => {
    const tenTinh = option?.label || "";
    form.setFieldsValue({
      tenTinh,
      maXa: undefined,
      tenXa: undefined,
      maHuyen: undefined,
      tenHuyen: undefined,
    });
    setXaOptions([]);
    updateDiaChi({ tenTinh, tenXa: "" });

    if (maTinh) {
      await loadXaByTinh(maTinh);
    }
  };

  // Chọn Phường/Xã -> Cập nhật địa chỉ chính xác
  const handleXaChange = (maXa: string, option?: any) => {
    const tenXa = option?.label || "";
    form.setFieldsValue({ tenXa });
    updateDiaChi({ tenXa });
  };

  const handleCustomUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const rcFile = file as File;

    if (!rcFile.type.startsWith("image/")) {
      message.error("Chỉ cho phép tải lên file hình ảnh (JPG, PNG, WEBP, GIF)!");
      onError(new Error("File không phải hình ảnh"));
      return;
    }

    try {
      const uploadForm = new FormData();
      uploadForm.append("Files", rcFile);
      uploadForm.append("FileType", "phong-tro");

      const res = await taiLieuDinhKemService.upload(uploadForm);
      if (res?.status && res.data && res.data.length > 0) {
        const item = res.data[0];
        const fullUrl = buildMinioFileUrl(item.duongDanFile);
        const newItem: ImageItem = {
          uid: item.id || `${Date.now()}-${Math.random()}`,
          url: fullUrl,
          fileId: item.id,
          tenTaiLieu: item.tenTaiLieu,
          isAvatar: false,
        };
        syncImagesToForm((prev) => {
          const isFirst = prev.length === 0;
          return [...prev, { ...newItem, isAvatar: isFirst }];
        });
        onSuccess(item, new XMLHttpRequest());
        message.success(`Tải ảnh lên thành công: ${rcFile.name}`);
      } else {
        message.error(res?.message || "Upload lên TaiLieuDinhKem thất bại");
        onError(new Error(res?.message || "Upload failed"));
      }
    } catch (error: any) {
      console.error("Lỗi upload TaiLieuDinhKem:", error);
      message.error(error?.message || "Lỗi khi upload ảnh");
      onError(error);
    }
  };

  const handleSetAvatar = (uid: string) => {
    syncImagesToForm((prev) =>
      prev.map((img) => ({
        ...img,
        isAvatar: img.uid === uid,
      }))
    );
    message.success("Đã đặt làm ảnh đại diện tin đăng!");
  };

  const handleDeleteImage = (uid: string) => {
    syncImagesToForm((prev) => {
      const remaining = prev.filter((img) => img.uid !== uid);
      if (remaining.length > 0 && !remaining.some((img) => img.isAvatar)) {
        remaining[0] = { ...remaining[0], isAvatar: true };
      }
      return remaining;
    });
  };

  const handleAddFromUrl = () => {
    if (!urlInput.trim()) {
      message.warning("Vui lòng nhập đường dẫn URL ảnh!");
      return;
    }
    const newItem: ImageItem = {
      uid: `${Date.now()}-${Math.random()}`,
      url: urlInput.trim(),
      isAvatar: false,
    };
    syncImagesToForm((prev) => {
      const isFirst = prev.length === 0;
      return [...prev, { ...newItem, isAvatar: isFirst }];
    });
    setUrlInput("");
    setUrlModalOpen(false);
    message.success("Đã thêm ảnh từ URL");
  };

  const handleOnFinish = async (formData: any) => {
    try {
      setIsSubmitting(true);
      const sanitizeUrl = (url?: string) => {
        if (!url) return "";
        let u = url.trim();
        if (/^https?:\/\/localhost(:\d+)?/i.test(u)) {
          u = u.replace(/^https?:\/\/localhost(:\d+)?/i, "");
        }
        return u;
      };

      const rawAvatarItem = images.find((img) => img.isAvatar) || images[0];
      const avatar = sanitizeUrl(rawAvatarItem?.url || formData.hinhAnhDaiDien);
      const allImages = images.map((img) => sanitizeUrl(img.url)).filter(Boolean).join(";");
      const fileDinhKemIds = images.map((img) => img.fileId).filter(Boolean) as string[];
      const avatarFileId = rawAvatarItem?.fileId;

      const payload: any = {
        ...formData,
        ...amenities,
        hinhAnhDaiDien: avatar,
        danhSachHinhAnh: allImages || sanitizeUrl(formData.danhSachHinhAnh),
        fileDinhKemIds: fileDinhKemIds.length > 0 ? fileDinhKemIds : undefined,
        avatarFileId: avatarFileId || undefined,
        goiTin: 0,
        trangThaiDuyet: 1,
        ngayTrong: formData.ngayTrong
          ? dayjs(formData.ngayTrong).format("YYYY-MM-DDTHH:mm:ss")
          : undefined,
      };

      const response = await phongTroService.create(payload);
      if (response.status) {
        toast.success("🎉 Đăng tin cho thuê miễn phí thành công!");
        message.success("Tin đăng của bạn đã được thêm vào hệ thống!");
        setTimeout(() => {
          router.push("/phongTro/danhsachtindang");
        }, 1200);
      } else {
        toast.error(response.message || "Đăng tin thất bại");
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra trong quá trình lưu tin đăng");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#f4f6f9] min-h-screen py-5 px-3 sm:px-6">
      <div className="w-full">
        {/* Header bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-3 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-3">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push("/phongTro/danhsachtindang")}
                className="border-gray-300 hover:border-blue-600 text-gray-700"
              >
                Danh sách tin
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 m-0">Đăng tin cho thuê mới</h1>
              <Tag color="orange" className="font-semibold text-xs py-0.5 px-2">
                Miễn phí 100%
              </Tag>
            </div>
            <p className="text-gray-500 text-sm mt-1 mb-0">
              Giao diện dạng thẻ gập mở (Accordion) - Nhập đến đâu mở đến đó, cực kỳ gọn gàng
            </p>
          </div>

          <div className="mt-3 md:mt-0 flex items-center gap-2">
            <Button
              icon={
                openPanels.length === ALL_PANEL_KEYS.length ? (
                  <UpSquareOutlined />
                ) : (
                  <DownSquareOutlined />
                )
              }
              onClick={toggleAllPanels}
            >
              {openPanels.length === ALL_PANEL_KEYS.length ? "Thu gọn tất cả" : "Mở tất cả"}
            </Button>
            <Button
              type="primary"
              size="middle"
              icon={<SendOutlined />}
              loading={isSubmitting}
              onClick={() => form.submit()}
              className="bg-[#ff5722] hover:bg-[#e64a19] border-none font-semibold shadow-sm"
            >
              Đăng tin ngay
            </Button>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleOnFinish}
          requiredMark={(label, { required }) => (
            <span>
              {label} {required && <span className="text-red-500 font-bold">(*)</span>}
            </span>
          )}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột chính: Các thẻ Accordion (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* ACCORDION 1: LOẠI CHUYÊN MỤC */}
              <AccordionCard
                id="chuyen-muc"
                title="Loại chuyên mục"
                stepText="Bước 1/6"
                icon={<AppstoreOutlined />}
                isOpen={openPanels.includes("chuyen-muc")}
                onToggle={() => togglePanel("chuyen-muc")}
                onNext={() => openNextPanel("khu-vuc")}
                nextLabel="Tiếp tục: Chọn Khu vực →"
              >
                <LoaiChuyenMucSection />
              </AccordionCard>

              {/* ACCORDION 2: KHU VỰC */}
              <AccordionCard
                id="khu-vuc"
                title="Khu vực & Địa chỉ"
                stepText="Bước 2/6"
                icon={<EnvironmentOutlined />}
                isOpen={openPanels.includes("khu-vuc")}
                onToggle={() => togglePanel("khu-vuc")}
                onNext={() => openNextPanel("thong-tin-mo-ta")}
                nextLabel="Tiếp tục: Nhập Thông tin mô tả →"
              >
                <KhuVucSection
                  tinhOptions={tinhOptions}
                  xaOptions={xaOptions}
                  onTinhChange={handleTinhChange}
                  onXaChange={handleXaChange}
                  onAddressFieldChange={(f, v) => updateDiaChi({ [f]: v })}
                  hasTinh={!!form.getFieldValue("maTinh")}
                  loadingXa={loadingXa}
                />
              </AccordionCard>

              {/* ACCORDION 3: THÔNG TIN MÔ TẢ */}
              <AccordionCard
                id="thong-tin-mo-ta"
                title="Thông tin mô tả & Giá cho thuê"
                stepText="Bước 3/6"
                icon={<FileTextOutlined />}
                isOpen={openPanels.includes("thong-tin-mo-ta")}
                onToggle={() => togglePanel("thong-tin-mo-ta")}
                onNext={() => openNextPanel("tien-ich")}
                nextLabel="Tiếp tục: Tiện ích & Chi phí →"
              >
                <ThongTinMoTaSection
                  tieuDeLength={tieuDeLength}
                  setTieuDeLength={setTieuDeLength}
                  giaText={giaText}
                  setGiaText={setGiaText}
                  form={form}
                />
              </AccordionCard>

              {/* ACCORDION 4: TIỆN ÍCH & CHI PHÍ DỊCH VỤ */}
              <AccordionCard
                id="tien-ich"
                title="Tiện ích phòng & Chi phí dịch vụ"
                stepText="Bước 4/6"
                icon={<ThunderboltOutlined />}
                isOpen={openPanels.includes("tien-ich")}
                onToggle={() => togglePanel("tien-ich")}
                onNext={() => openNextPanel("hinh-anh")}
                nextLabel="Tiếp tục: Tải hình ảnh →"
              >
                <TienIchChiPhiSection
                  amenities={amenities}
                  toggleAmenity={(key) =>
                    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                />
              </AccordionCard>

              {/* ACCORDION 5: HÌNH ẢNH */}
              <AccordionCard
                id="hinh-anh"
                title="Hình ảnh phòng trọ"
                stepText="Bước 5/6"
                icon={<PictureOutlined />}
                isOpen={openPanels.includes("hinh-anh")}
                onToggle={() => togglePanel("hinh-anh")}
                onNext={() => openNextPanel("thong-tin-lien-he")}
                nextLabel="Tiếp tục: Thông tin liên hệ →"
              >
                <HinhAnhSection
                  images={images}
                  onCustomUpload={handleCustomUpload}
                  onSetAvatar={handleSetAvatar}
                  onDeleteImage={handleDeleteImage}
                  onOpenUrlModal={() => setUrlModalOpen(true)}
                  onApplySampleImages={() => {
                    syncImagesToForm(SAMPLE_HANOI_IMAGES);
                    message.success("Đã áp dụng bộ 4 ảnh mẫu!");
                  }}
                  onPreviewImage={(url) => {
                    setPreviewImage(url);
                    setPreviewOpen(true);
                  }}
                />
              </AccordionCard>

              {/* ACCORDION 6: VIDEO */}
              <AccordionCard
                id="video"
                title="Video phòng trọ (Tùy chọn)"
                stepText="Tùy chọn"
                icon={<VideoCameraOutlined />}
                isOpen={openPanels.includes("video")}
                onToggle={() => togglePanel("video")}
              >
                <VideoSection />
              </AccordionCard>

              {/* ACCORDION 7: THÔNG TIN LIÊN HỆ */}
              <AccordionCard
                id="thong-tin-lien-he"
                title="Thông tin liên hệ"
                stepText="Bước 6/6"
                icon={<ContactsOutlined />}
                isOpen={openPanels.includes("thong-tin-lien-he")}
                onToggle={() => togglePanel("thong-tin-lien-he")}
              >
                <ThongTinLienHeSection />
              </AccordionCard>

              {/* BOTTOM ACTION BAR */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <CheckCircleOutlined className="text-emerald-500 text-base" />
                  <span>Tin đăng sẽ được hiển thị ngay sau khi bạn gửi.</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    size="large"
                    onClick={() => router.push("/phongTro/danhsachtindang")}
                    className="w-1/2 sm:w-auto"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    loading={isSubmitting}
                    onClick={() => form.submit()}
                    className="w-1/2 sm:w-auto bg-[#ff5722] hover:bg-[#e64a19] border-none font-bold text-base px-8 h-11 shadow-md"
                  >
                    Đăng tin miễn phí ngay
                  </Button>
                </div>
              </div>
            </div>

            {/* Cột phụ bên phải (Right Sidebar - 4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <SidebarGuidance />
            </div>
          </div>
        </Form>
      </div>

      {/* Modal phóng to ảnh */}
      <Modal
        open={previewOpen}
        title="Xem hình ảnh"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>

      {/* Modal thêm ảnh từ URL */}
      <Modal
        open={urlModalOpen}
        title="Thêm hình ảnh từ đường dẫn URL"
        okText="Thêm ảnh"
        cancelText="Hủy"
        onOk={handleAddFromUrl}
        onCancel={() => {
          setUrlInput("");
          setUrlModalOpen(false);
        }}
      >
        <div className="py-2">
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">
            Nhập liên kết hình ảnh trực tiếp (JPG, PNG, WEBP):
          </label>
          <Input
            placeholder="https://images.unsplash.com/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
