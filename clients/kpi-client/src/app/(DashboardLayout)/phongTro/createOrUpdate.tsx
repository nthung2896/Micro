import React, { useEffect, useState } from "react";
import {
  Form,
  FormProps,
  Input,
  InputNumber,
  Select,
  Switch,
  DatePicker,
  Modal,
  Tabs,
  Row,
  Col,
  Divider,
  Upload,
  Button,
  Tag,
  Tooltip,
  Space,
  message,
} from "antd";
import {
  HomeOutlined,
  DollarCircleOutlined,
  AppstoreOutlined,
  ContactsOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
  LinkOutlined,
  UploadOutlined,
  CompassOutlined,
  AimOutlined,
  ExportOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
  PhongTroCreateOrUpdateType,
  PhongTroType,
} from "@/types/phongTro/phongTro";
import phongTroService from "@/services/phongTro/phongTroService";
import tinhService from "@/services/tinh/tinh.service";
import huyenService from "@/services/huyen/huyen.service";
import xaService from "@/services/xa/xaService";
import RichTextEditor from "@/components/shared-components/RichTextEditor";
import minioService from "@/services/minio/minio.service";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";
import { buildFileUrl, buildMinioFileUrl } from "@/utils/file";

interface Props {
  item?: PhongTroType | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImageItem {
  uid: string;
  url: string;
  fileId?: string;
  tenTaiLieu?: string;
  isAvatar?: boolean;
}

const SAMPLE_HANOI_IMAGES: ImageItem[] = [
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

const SAMPLE_HANOI_MOTA = `
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
`;

const PhongTroCreateOrUpdate: React.FC<Props> = ({
  item,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<PhongTroCreateOrUpdateType>();
  const diaChi = Form.useWatch("diaChi", form);
  const [tinhOptions, setTinhOptions] = useState<{ label: string; value: string }[]>([]);
  const [xaOptions, setXaOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingXa, setLoadingXa] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quản lý danh sách hình ảnh
  const [images, setImages] = useState<ImageItem[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  // Đồng bộ ảnh vào form (hỗ trợ functional update để upload nhiều ảnh song song không bị ghi đè)
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

  // 1. Load danh sách Tỉnh/Thành
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

  // 2. Load dữ liệu khi sửa hoặc điền mẫu Hà Nội khi thêm mới
  useEffect(() => {
    if (item?.id) {
      phongTroService
        .getById(item.id)
        .then((res) => {
          const detail = res?.data || item;
          if (detail) {
            form.setFieldsValue({
              ...detail,
              ngayTrong: detail.ngayTrong ? (dayjs(detail.ngayTrong) as any) : undefined,
            });

            // Parse danh sách ảnh khi chỉnh sửa: ưu tiên danhSachTaiLieu từ bảng TaiLieuDinhKem, kết hợp danhSachHinhAnh
            const loadedImages: ImageItem[] = [];
            const rawTaiLieu = (detail as any).danhSachTaiLieu;
            const seenUrls = new Set<string>();

            if (rawTaiLieu && Array.isArray(rawTaiLieu) && rawTaiLieu.length > 0) {
              rawTaiLieu.forEach((tl: any, idx: number) => {
                const fullUrl = buildFileUrl(tl.duongDanFile);
                seenUrls.add(tl.duongDanFile);
                seenUrls.add(fullUrl);
                loadedImages.push({
                  uid: tl.id || `img-${idx}-${Date.now()}`,
                  url: fullUrl,
                  fileId: tl.id,
                  tenTaiLieu: tl.tenTaiLieu,
                  isAvatar: false,
                });
              });
            }

            if (detail.danhSachHinhAnh) {
              const urls = detail.danhSachHinhAnh
                .split(/[;,]/)
                .map((s) => s.trim())
                .filter(Boolean);
              urls.forEach((u, idx) => {
                const fullUrl = buildFileUrl(u);
                if (!seenUrls.has(u) && !seenUrls.has(fullUrl)) {
                  seenUrls.add(u);
                  seenUrls.add(fullUrl);
                  loadedImages.push({
                    uid: `img-extra-${idx}-${Date.now()}`,
                    url: fullUrl,
                    isAvatar: false,
                  });
                }
              });
            }

            if (detail.hinhAnhDaiDien && loadedImages.length === 0) {
              loadedImages.push({
                uid: `img-0-${Date.now()}`,
                url: buildFileUrl(detail.hinhAnhDaiDien),
                isAvatar: true,
              });
            }

            if (loadedImages.length > 0) {
              const avatarPath = detail.hinhAnhDaiDien || "";
              const avatarIdx = loadedImages.findIndex(
                (img) =>
                  img.url === avatarPath ||
                  img.url === buildFileUrl(avatarPath) ||
                  (avatarPath && img.url.includes(avatarPath.replace(/^.*[\\\/]/, "")))
              );
              const selectedIdx = avatarIdx >= 0 ? avatarIdx : 0;
              loadedImages[selectedIdx].isAvatar = true;
            }

            setImages(loadedImages);

            if (detail.maTinh) {
              loadXaByTinh(detail.maTinh);
            }
          }
        })
        .catch(() => {
          if (item) {
            form.setFieldsValue({
              ...item,
              ngayTrong: item.ngayTrong ? (dayjs(item.ngayTrong) as any) : undefined,
            });
          }
        });
    } else {
      // Dữ liệu mẫu thực tế cho phòng trọ tại Hà Nội
      form.resetFields();
      setImages(SAMPLE_HANOI_IMAGES);

      form.setFieldsValue({
        tieuDe: "Cho thuê phòng trọ khép kín full đồ ban công thoáng mát tại Cầu Giấy, Hà Nội",
        maPhong: "P.302",
        tenPhong: "Phòng Studio 302",
        loaiPhong: "Phòng trọ",
        maTinh: "01",
        tenTinh: "Thành phố Hà Nội",
        maXa: "00160",
        tenXa: "Phường Dịch Vọng Hậu",
        diaChi: "Số 15, Ngõ 68, Đường Trần Thái Tông, Phường Dịch Vọng Hậu, Thành phố Hà Nội",
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
        gioGiacTuDo: true,
        khongChungChu: true,
        choNuoiThuCung: false,
        coDieuHoa: true,
        coNongLanh: true,
        coMayGiat: true,
        coTuLanh: true,
        coGiuongTu: true,
        coKeBep: true,
        coBanCong: true,
        coThangMay: true,
        coChoDeXe: true,
        coKhoaVanTay: true,
        quyDinhGioGiac: "Tự do giờ giấc 24/24, ra vào bằng khóa vân tay bảo mật",
        tienNghiKhac: "Máy sấy quần áo, camera giám sát 24/7, sân phơi rộng rãi tầng thượng",
        hinhAnhDaiDien: SAMPLE_HANOI_IMAGES[0].url,
        danhSachHinhAnh: SAMPLE_HANOI_IMAGES.map((img) => img.url).join(";"),
        videoLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        tenLienHe: "Nguyễn Văn Hùng (Chủ nhà)",
        soDienThoaiLienHe: "0988123456",
        zaloLienHe: "0988123456",
        moTa: SAMPLE_HANOI_MOTA.trim(),
        quyDinh: "- Không hút thuốc lá trong phòng và hành lang chung.\n- Giữ gìn trật tự và yên tĩnh chung sau 23h đêm.\n- Có ý thức giữ gìn vệ sinh và tài sản của tòa nhà.",
        trangThai: 0,
        ngayTrong: dayjs() as any,
        goiTin: 1,
        isNoiBat: true,
        trangThaiDuyet: 1,
      });

      loadXaByTinh("01");
    }
  }, [form, item]);

  // Tải danh sách Phường/Xã trực tiếp theo Mã Tỉnh/TP (Bỏ cấp Quận/Huyện)
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
      ]);
    } finally {
      setLoadingXa(false);
    }
  };

  // Lấy vị trí GPS hiện tại của người dùng
  const handleGetGpsLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      message.error("Trình duyệt không hỗ trợ định vị GPS");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGettingLocation(false);
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const coordString = `${lat}, ${lng}`;
        form.setFieldsValue({ toaDo: coordString });
        message.success(`Đã lấy tọa độ GPS: ${coordString}`);
      },
      () => {
        setGettingLocation(false);
        message.warning("Không thể lấy vị trí hiện tại. Vui lòng bật quyền truy cập vị trí trên trình duyệt.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Xử lý khi chọn Tỉnh -> Tải trực tiếp Phường/Xã
  const handleTinhChange = async (maTinh: string, option?: any) => {
    const tenTinh = option?.label || "";
    form.setFieldsValue({
      tenTinh,
      maHuyen: undefined,
      tenHuyen: undefined,
      maXa: undefined,
      tenXa: undefined,
    });
    setXaOptions([]);

    if (maTinh) {
      await loadXaByTinh(maTinh);
    }
  };

  // Xử lý khi chọn Xã
  const handleXaChange = (_maXa: string, option?: any) => {
    form.setFieldsValue({
      tenXa: option?.label || "",
    });
  };

  // Tạo URL bản đồ Google Maps động theo địa chỉ phòng trọ
  const mapAddress = diaChi && diaChi.trim().length > 3 ? diaChi.trim() : "Thành phố Hà Nội";
  const mapEmbedUrl = `https://maps.google.com/maps?width=100%25&height=280&hl=vi&q=${encodeURIComponent(
    mapAddress
  )}&ie=UTF8&t=&z=15&iwloc=B&output=embed`;

  // Upload file hình ảnh lên MinIO (hỗ trợ nhiều ảnh song song không bị đè mất)
  const handleCustomUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const rcFile = file as File;

    const isImage = rcFile.type.startsWith("image/");
    if (!isImage) {
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
        const newItems: ImageItem[] = res.data.map((uploadedFile: any) => ({
          uid: uploadedFile.id || `${Date.now()}-${Math.random()}`,
          url: buildMinioFileUrl(uploadedFile.duongDanFile),
          fileId: uploadedFile.id,
          tenTaiLieu: uploadedFile.tenTaiLieu,
          isAvatar: false,
        }));
        syncImagesToForm((prev) => {
          const hasAvatar = prev.some((img) => img.isAvatar);
          return [
            ...prev,
            ...newItems.map((item, idx) => ({
              ...item,
              isAvatar: !hasAvatar && idx === 0,
            })),
          ];
        });
        onSuccess(res.data, new XMLHttpRequest());
        message.success(`Tải ảnh lên thành công: ${rcFile.name}`);
        return;
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

  // Đặt làm ảnh đại diện
  const handleSetAvatar = (uid: string) => {
    syncImagesToForm((prev) =>
      prev.map((img) => ({
        ...img,
        isAvatar: img.uid === uid,
      }))
    );
    message.success("Đã chọn làm ảnh đại diện!");
  };

  // Xóa 1 ảnh
  const handleDeleteImage = (uid: string) => {
    syncImagesToForm((prev) => {
      const remaining = prev.filter((img) => img.uid !== uid);
      if (remaining.length > 0 && !remaining.some((img) => img.isAvatar)) {
        remaining[0] = { ...remaining[0], isAvatar: true };
      }
      return remaining;
    });
  };

  // Thêm ảnh từ link URL
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
      const hasAvatar = prev.some((img) => img.isAvatar);
      return [...prev, { ...newItem, isAvatar: !hasAvatar }];
    });
    setUrlInput("");
    setUrlModalOpen(false);
    message.success("Đã thêm ảnh từ URL");
  };

  // Submit form
  const handleOnFinish: FormProps<PhongTroCreateOrUpdateType>["onFinish"] = async (
    formData: any
  ) => {
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
        hinhAnhDaiDien: avatar,
        danhSachHinhAnh: allImages || sanitizeUrl(formData.danhSachHinhAnh),
        fileDinhKemIds: fileDinhKemIds.length > 0 ? fileDinhKemIds : undefined,
        avatarFileId: avatarFileId || undefined,
        ngayTrong: formData.ngayTrong
          ? dayjs(formData.ngayTrong).format("YYYY-MM-DDTHH:mm:ss")
          : undefined,
      };

      if (item?.id) {
        payload.id = item.id;
        const response = await phongTroService.update(payload);
        if (response.status) {
          toast.success("Chỉnh sửa phòng trọ thành công");
          form.resetFields();
          onSuccess();
          onClose();
        } else {
          toast.error(response.message || "Chỉnh sửa phòng trọ thất bại");
        }
      } else {
        const response = await phongTroService.create(payload);
        if (response.status) {
          toast.success("Thêm mới phòng trọ thành công");
          form.resetFields();
          onSuccess();
          onClose();
        } else {
          toast.error(response.message || "Thêm mới phòng trọ thất bại");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra trong quá trình lưu dữ liệu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const currencyFormatter = (value?: number | string) =>
    value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
  const currencyParser = (value?: string) =>
    value ? value.replace(/\$\s?|(,*)/g, "") : "";

  // Danh sách các Tabs cấu hình
  const tabItems = [
    {
      key: "general",
      label: (
        <span>
          <HomeOutlined /> Thông tin & Vị trí
        </span>
      ),
      children: (
        <>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Tiêu đề tin đăng"
                name="tieuDe"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề tin đăng!" }]}
              >
                <Input placeholder="VD: Cho thuê phòng trọ khép kín full đồ ban công thoáng mát tại Cầu Giấy..." />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Mã phòng / Số phòng"
                name="maPhong"
              >
                <Input placeholder="VD: P.302" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Tên phòng"
                name="tenPhong"
              >
                <Input placeholder="VD: Phòng Studio 302" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Loại bất động sản / Loại phòng"
                name="loaiPhong"
              >
                <Select
                  placeholder="Chọn loại phòng"
                  allowClear
                  options={[
                    { label: "Phòng trọ", value: "Phòng trọ" },
                    { label: "Chung cư mini", value: "Chung cư mini" },
                    { label: "Căn hộ dịch vụ", value: "Căn hộ dịch vụ" },
                    { label: "Nhà nguyên căn", value: "Nhà nguyên căn" },
                    { label: "Mặt bằng kinh doanh", value: "Mặt bằng kinh doanh" },
                    { label: "Ở ghép / Ký túc xá", value: "Ở ghép / Ký túc xá" },
                    { label: "Khác", value: "Khác" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Tỉnh / Thành phố"
                name="maTinh"
                rules={[{ required: true, message: "Vui lòng chọn Tỉnh/Thành phố!" }]}
              >
                <Select
                  placeholder="Chọn Tỉnh / Thành"
                  options={tinhOptions}
                  onChange={handleTinhChange}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item<PhongTroCreateOrUpdateType> name="tenTinh" hidden>
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Phường / Xã"
                name="maXa"
                rules={[{ required: true, message: "Vui lòng chọn Phường/Xã!" }]}
              >
                <Select
                  placeholder={loadingXa ? "Đang tải danh sách phường xã..." : "Chọn Phường / Xã"}
                  options={xaOptions}
                  onChange={handleXaChange}
                  loading={loadingXa}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item<PhongTroCreateOrUpdateType> name="tenXa" hidden>
                <Input />
              </Form.Item>
            </Col>

            <Col span={16}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Địa chỉ chi tiết"
                name="diaChi"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
              >
                <Input placeholder="VD: Số 15, Ngõ 68 Trần Thái Tông, Cầu Giấy, Hà Nội" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Tọa độ (Kinh độ, Vĩ độ)"
                name="toaDo"
              >
                <Input placeholder="VD: 21.028511, 105.789123" />
              </Form.Item>
            </Col>

            {/* Bản đồ nhúng trực quan (Interactive Google Maps) */}
            <Col span={24}>
              <div className="mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-[#0355a2]">
                      <CompassOutlined className="text-base" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 m-0 flex items-center gap-2">
                        Bản đồ vị trí phòng trọ
                        <Tag color="success" className="text-[10px] font-semibold border-none m-0">
                          Tự động đồng bộ theo địa chỉ
                        </Tag>
                      </h4>
                      <p className="text-[11px] text-gray-500 m-0">
                        Hiển thị vị trí thực tế trên Google Maps giúp khách thuê dễ dàng định vị
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tooltip title="Lấy tọa độ GPS thiết bị hiện tại">
                      <Button
                        size="small"
                        icon={<AimOutlined />}
                        onClick={handleGetGpsLocation}
                        loading={gettingLocation}
                        className="text-xs"
                      >
                        Định vị GPS
                      </Button>
                    </Tooltip>
                    {diaChi && (
                      <Button
                        size="small"
                        type="primary"
                        icon={<ExportOutlined className="!text-white" />}
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              diaChi
                            )}`,
                            "_blank"
                          )
                        }
                        style={{ backgroundColor: "#0355a2", color: "#ffffff" }}
                        className="text-xs hover:!bg-[#024380] !text-white font-medium shadow-xs"
                      >
                        <span className="!text-white font-medium">Mở Google Maps</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Khung bản đồ Iframe */}
                <div className="relative w-full h-[260px] sm:h-[280px] rounded-lg overflow-hidden border border-gray-200 bg-white shadow-xs">
                  <iframe
                    key={mapAddress}
                    title="Bản đồ phòng trọ"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={mapEmbedUrl}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "pricing",
      label: (
        <span>
          <DollarCircleOutlined /> Diện tích & Chi phí
        </span>
      ),
      children: (
        <>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Diện tích (m²)"
                name="dienTich"
              >
                <InputNumber
                  min={1}
                  style={{ width: "100%" }}
                  placeholder="VD: 28"
                  addonAfter="m²"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item<PhongTroCreateOrUpdateType> label="Tầng số" name="tang">
                <InputNumber min={0} style={{ width: "100%" }} placeholder="VD: 3" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Số người tối đa"
                name="soNguoiOToiDa"
              >
                <InputNumber min={1} style={{ width: "100%" }} placeholder="VD: 2" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Số phòng ngủ"
                name="soPhongNgu"
              >
                <InputNumber min={0} style={{ width: "100%" }} placeholder="VD: 1" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Số phòng tắm/WC"
                name="soPhongTam"
              >
                <InputNumber min={0} style={{ width: "100%" }} placeholder="VD: 1" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Giá cho thuê (VNĐ/tháng)"
                name="giaChoThue"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="VD: 3,500,000"
                  formatter={currencyFormatter}
                  parser={currencyParser as any}
                  addonAfter="VNĐ/tháng"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Tiền đặt cọc (VNĐ)"
                name="tienCoc"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="VD: 3,500,000"
                  formatter={currencyFormatter}
                  parser={currencyParser as any}
                  addonAfter="VNĐ"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" plain style={{ margin: "12px 0" }}>
            Chi phí dịch vụ hàng tháng
          </Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Giá điện"
                name="giaDien"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="VD: 3,800"
                  formatter={currencyFormatter}
                  parser={currencyParser as any}
                  addonAfter="VNĐ"
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Đơn vị điện"
                name="donViDien"
              >
                <Select
                  options={[
                    { label: "Số / KWh", value: "Số" },
                    { label: "Tháng", value: "Tháng" },
                    { label: "Người", value: "Người" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Giá nước"
                name="giaNuoc"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="VD: 30,000"
                  formatter={currencyFormatter}
                  parser={currencyParser as any}
                  addonAfter="VNĐ"
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Đơn vị nước"
                name="donViNuoc"
              >
                <Select
                  options={[
                    { label: "Khối", value: "Khối" },
                    { label: "Người/Tháng", value: "Người" },
                    { label: "Phòng/Tháng", value: "Phòng" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Giá Internet / Wifi"
                name="giaInternet"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="VD: 100,000"
                  formatter={currencyFormatter}
                  parser={currencyParser as any}
                  addonAfter="VNĐ"
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Đơn vị mạng"
                name="donViInternet"
              >
                <Select
                  options={[
                    { label: "Phòng", value: "Phòng" },
                    { label: "Người", value: "Người" },
                    { label: "Miễn phí", value: "Miễn phí" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Phí dịch vụ chung"
                name="giaDichVuChung"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="VD: 50,000"
                  formatter={currencyFormatter}
                  parser={currencyParser as any}
                  addonAfter="VNĐ"
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Đơn vị DVC"
                name="donViDichVuChung"
              >
                <Select
                  options={[
                    { label: "Người", value: "Người" },
                    { label: "Phòng", value: "Phòng" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Phí gửi xe (VNĐ/xe/tháng)"
                name="giaGuiXe"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="VD: 100,000"
                  formatter={currencyFormatter}
                  parser={currencyParser as any}
                  addonAfter="VNĐ/xe"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Phí vệ sinh (VNĐ/tháng)"
                name="giaVeSinh"
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="VD: 30,000"
                  formatter={currencyFormatter}
                  parser={currencyParser as any}
                  addonAfter="VNĐ"
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "amenities",
      label: (
        <span>
          <AppstoreOutlined /> Tiện nghi & Hình ảnh
        </span>
      ),
      children: (
        <>
          <Divider titlePlacement="left" plain style={{ marginTop: 0 }}>
            Tiện nghi & Nội thất phòng
          </Divider>
          <Row gutter={[16, 8]}>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Giờ giấc tự do"
                name="gioGiacTuDo"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Không chung chủ"
                name="khongChungChu"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Cho nuôi thú cưng"
                name="choNuoiThuCung"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Có điều hòa"
                name="coDieuHoa"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Có bình nóng lạnh"
                name="coNongLanh"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Có máy giặt"
                name="coMayGiat"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Có tủ lạnh"
                name="coTuLanh"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Có giường tủ"
                name="coGiuongTu"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Có kệ bếp / Bếp riêng"
                name="coKeBep"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Có ban công / Cửa sổ"
                name="coBanCong"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Có thang máy"
                name="coThangMay"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Có chỗ để xe"
                name="coChoDeXe"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Khóa vân tay / Camera"
                name="coKhoaVanTay"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Quy định giờ giấc (nếu có)"
                name="quyDinhGioGiac"
              >
                <Input placeholder="VD: Đóng cửa lúc 23h, có chìa khóa riêng..." />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Tiện nghi khác"
                name="tienNghiKhac"
              >
                <Input placeholder="VD: Sân phơi tầng thượng, bảo vệ 24/7, máy sấy quần áo..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" plain style={{ margin: "16px 0 12px", fontWeight: 600 }}>
            Hình ảnh phòng trọ (Upload nhiều ảnh lên MinIO & Chọn ảnh đại diện)
          </Divider>

          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, color: "#4b5563" }}>
                <span>Đã có <strong>{images.length}</strong> ảnh. </span>
                <span style={{ color: "#6b7280" }}>
                  (Ảnh được lưu trữ trực tiếp trên <strong>MinIO</strong>. Nhấn icon ngôi sao để chọn <strong>Ảnh đại diện</strong>)
                </span>
              </div>
              <Space>
                <Upload
                  multiple
                  showUploadList={false}
                  customRequest={handleCustomUpload}
                  accept="image/*"
                >
                  <Button type="primary" icon={<UploadOutlined />}>
                    Tải ảnh lên MinIO (Nhiều ảnh)
                  </Button>
                </Upload>
                <Button icon={<LinkOutlined />} onClick={() => setUrlModalOpen(true)}>
                  Thêm link URL ảnh
                </Button>
                {images.length > 0 && (
                  <Button danger onClick={() => syncImagesToForm([])}>
                    Xóa tất cả
                  </Button>
                )}
              </Space>
            </div>

            {/* Gallery ảnh dạng lưới thẻ */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))",
                gap: 12,
                padding: "12px",
                background: "#f9fafb",
                borderRadius: 8,
                border: "1px dashed #d1d5db",
                minHeight: 120,
              }}
            >
              {images.map((img) => (
                <div
                  key={img.uid}
                  style={{
                    position: "relative",
                    borderRadius: 8,
                    overflow: "hidden",
                    border: img.isAvatar ? "2px solid #eab308" : "1px solid #e5e7eb",
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    aspectRatio: "4/3",
                  }}
                >
                  <img
                    src={img.url}
                    alt="Phòng trọ"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {img.isAvatar && (
                    <Tag
                      color="gold"
                      style={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        margin: 0,
                        fontSize: 10,
                        padding: "0 4px",
                        lineHeight: "18px",
                      }}
                    >
                      ★ Đại diện
                    </Tag>
                  )}

                  {/* Thanh công cụ overlay thao tác trên ảnh */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "rgba(0,0,0,0.65)",
                      display: "flex",
                      justifyContent: "space-around",
                      alignItems: "center",
                      padding: "4px 0",
                    }}
                  >
                    <Tooltip title={img.isAvatar ? "Đang là ảnh đại diện" : "Đặt làm ảnh đại diện"}>
                      <button
                        type="button"
                        onClick={() => handleSetAvatar(img.uid)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: img.isAvatar ? "#facc15" : "#fff",
                          fontSize: 14,
                        }}
                      >
                        {img.isAvatar ? <StarFilled /> : <StarOutlined />}
                      </button>
                    </Tooltip>
                    <Tooltip title="Xem ảnh lớn">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(img.url);
                          setPreviewOpen(true);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#fff",
                          fontSize: 14,
                        }}
                      >
                        <EyeOutlined />
                      </button>
                    </Tooltip>
                    <Tooltip title="Xóa ảnh này">
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.uid)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#ef4444",
                          fontSize: 14,
                        }}
                      >
                        <DeleteOutlined />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              ))}

              {/* Nút thêm ảnh trong lưới */}
              <Upload
                multiple
                showUploadList={false}
                customRequest={handleCustomUpload}
                accept="image/*"
              >
                <div
                  style={{
                    height: "100%",
                    minHeight: 100,
                    aspectRatio: "4/3",
                    border: "1px dashed #3b82f6",
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    background: "#eff6ff",
                    color: "#2563eb",
                    fontSize: 12,
                    transition: "all 0.2s",
                  }}
                >
                  <PlusOutlined style={{ fontSize: 20, marginBottom: 4 }} />
                  <span>+ Thêm ảnh MinIO</span>
                </div>
              </Upload>
            </div>
          </div>

          <Form.Item<PhongTroCreateOrUpdateType> name="hinhAnhDaiDien" hidden>
            <Input />
          </Form.Item>
          <Form.Item<PhongTroCreateOrUpdateType> name="danhSachHinhAnh" hidden>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Đường dẫn Video giới thiệu phòng (Youtube, Tiktok, Drive)"
                name="videoLink"
              >
                <Input placeholder="VD: https://www.youtube.com/watch?v=..." />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "contact",
      label: (
        <span>
          <ContactsOutlined /> Mô tả & Quản lý
        </span>
      ),
      children: (
        <>
          <Divider titlePlacement="left" plain style={{ marginTop: 0, fontWeight: 600 }}>
            Mô tả chi tiết phòng trọ (Trình soạn thảo văn bản phong phú)
          </Divider>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item<PhongTroCreateOrUpdateType>
                name="moTa"
                rules={[{ required: true, message: "Vui lòng nhập mô tả chi tiết phòng trọ!" }]}
              >
                <RichTextEditor placeholder="Soạn thảo chi tiết về phòng trọ: không gian, nội thất, vị trí, tiện ích, ưu đãi..." />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label={<span style={{ fontWeight: 600 }}>Nội quy / Quy định phòng</span>}
                name="quyDinh"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Giữ gìn vệ sinh chung, không làm ồn sau 23h, khóa cửa khi ra vào..."
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" plain style={{ margin: "14px 0 10px", fontWeight: 600 }}>
            Thông tin người liên hệ / Chủ nhà
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Họ tên người liên hệ"
                name="tenLienHe"
              >
                <Input placeholder="VD: Anh Nam / Cô Mai" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Số điện thoại liên hệ"
                name="soDienThoaiLienHe"
              >
                <Input placeholder="VD: 0987654321" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Zalo liên hệ"
                name="zaloLienHe"
              >
                <Input placeholder="VD: 0987654321" />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left" plain style={{ margin: "14px 0 10px", fontWeight: 600 }}>
            Trạng thái tin đăng & Quản lý
          </Divider>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Trạng thái phòng"
                name="trangThai"
              >
                <Select
                  options={[
                    { label: "Còn trống", value: 0 },
                    { label: "Đã thuê", value: 1 },
                    { label: "Tạm ngưng", value: 2 },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Ngày bắt đầu trống"
                name="ngayTrong"
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày trống"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Gói tin đăng"
                name="goiTin"
              >
                <Select
                  options={[
                    { label: "Tin thường", value: 0 },
                    { label: "VIP 1", value: 1 },
                    { label: "VIP 2", value: 2 },
                    { label: "VIP Nổi bật", value: 3 },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Tin nổi bật"
                name="isNoiBat"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Trạng thái kiểm duyệt"
                name="trangThaiDuyet"
              >
                <Select
                  options={[
                    { label: "Chờ duyệt", value: 0 },
                    { label: "Đã duyệt", value: 1 },
                    { label: "Từ chối", value: 2 },
                    { label: "Hết hạn", value: 3 },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item<PhongTroCreateOrUpdateType>
                label="Lý do từ chối (nếu có)"
                name="lyDoTuChoi"
              >
                <Input placeholder="Nhập lý do từ chối kiểm duyệt..." />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={item != null ? "Chỉnh sửa thông tin phòng trọ" : "Thêm mới phòng trọ"}
        open={true}
        onOk={() => form.submit()}
        onCancel={handleCancel}
        okText="Xác nhận lưu"
        cancelText="Đóng"
        width={960}
        style={{ top: 20 }}
        styles={{
          body: {
            maxHeight: "78vh",
            overflowY: "auto",
            paddingRight: 8,
          },
        }}
        confirmLoading={isSubmitting}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          name="formPhongTroCreateUpdate"
          onFinish={handleOnFinish}
          autoComplete="off"
        >
          {item && (
            <Form.Item<PhongTroCreateOrUpdateType> name="id" hidden>
              <Input />
            </Form.Item>
          )}

          <Tabs defaultActiveKey="general" items={tabItems} />
        </Form>
      </Modal>

      {/* Modal xem trước ảnh lớn */}
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
        width={750}
        styles={{ body: { padding: 12, textAlign: "center" } }}
      >
        <img
          src={previewImage}
          alt="Xem trước ảnh"
          style={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain", borderRadius: 8 }}
        />
      </Modal>

      {/* Modal nhập link URL ảnh */}
      <Modal
        title="Thêm ảnh từ đường dẫn URL"
        open={urlModalOpen}
        onOk={handleAddFromUrl}
        onCancel={() => setUrlModalOpen(false)}
        okText="Thêm ảnh"
        cancelText="Hủy"
        centered
      >
        <div style={{ padding: "8px 0" }}>
          <p style={{ fontSize: 13, color: "#4b5563", marginBottom: 8 }}>
            Nhập đường dẫn trực tiếp của hình ảnh (JPG, PNG, WEBP):
          </p>
          <Input
            placeholder="https://images.unsplash.com/... hoặc link ảnh bất kỳ"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onPressEnter={handleAddFromUrl}
          />
        </div>
      </Modal>
    </>
  );
};

export default PhongTroCreateOrUpdate;
