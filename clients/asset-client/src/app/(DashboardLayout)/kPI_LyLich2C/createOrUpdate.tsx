import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Form, FormProps, Input, Select, DatePicker, Modal, Row, Col, Tabs, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  KPI_LyLich2CCreateOrUpdateType,
  KPI_LyLich2CType,
} from "@/types/kPI_LyLich2C/kPI_LyLich2C";
import kPI_LyLich2CService from "@/services/kPI_LyLich2C/kPI_LyLich2CService";
import departmentService from "@/services/department/department.service";

interface Props {
  item?: KPI_LyLich2CType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_LyLich2CCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_LyLich2CCreateOrUpdateType>();
  const [donViList, setDonViList] = useState<any[]>([]);
  const [phongBanList, setPhongBanList] = useState<any[]>([]);
  const avatarUrl = Form.useWatch("avatar", form);

  useEffect(() => {
    const fetchDonVi = async () => {
      try {
        const res = await departmentService.getDropdownTrucThuocBTC();
        if (res?.status && res?.data) {
          setDonViList(res.data);
        }
      } catch (err) {
        console.error("Lỗi tải đơn vị:", err);
      }
    };
    fetchDonVi();
  }, []);

  const loadPhongBanByDonVi = async (donViId: string) => {
    if (!donViId) {
      setPhongBanList([]);
      return;
    }
    try {
      const res = await departmentService.getDropdownLevel1(donViId);
      if (res?.status && res?.data) {
        setPhongBanList(res.data);
      } else {
        setPhongBanList([]);
      }
    } catch (err) {
      console.error("Lỗi tải phòng ban:", err);
      setPhongBanList([]);
    }
  };

  const handleDonViChange = (value: string) => {
    form.setFieldsValue({ phongBanId: undefined as any });
    loadPhongBanByDonVi(value);
  };

  useEffect(() => {
    if (props.item) {
      const dateFields = [
        "ngayBoNhiem", "ngayBoNhiemLai", "ngaysinh", "ngayCapCMND", "ngayTuyenDung",
        "nVaoCoQuanHienDangCongTac", "ngayVaoDang", "ngayVaoDangChinhThucTxt",
        "ngayVaoDoan", "ngayNhapNgu", "namPhongHocHam", "namPhongChucDanhKhoaHoc",
        "ngayThamGiaCachMang", "ngayKyQuyetDinh", "ngayHieuLuc", "ngayHuongLuong",
        "ngayBoNhiemChucDanh", "ngayHuongPhuCapThamNienVuotKhung"
      ];

      const formattedItem = { ...props.item } as any;

      dateFields.forEach((field: string) => {
        if (formattedItem[field]) {
          formattedItem[field] = dayjs(formattedItem[field]);
        }
      });

      form.setFieldsValue(formattedItem);

      if (props.item.donViSuDungId) {
        loadPhongBanByDonVi(props.item.donViSuDungId);
      }
    } else {
      form.resetFields();
    }
  }, [form, props.item]);

  const handleOnFinish: FormProps<KPI_LyLich2CCreateOrUpdateType>["onFinish"] = async (formData) => {
    try {
      if (props.item) {
        const response = await kPI_LyLich2CService.update(formData);
        if (response.status) {
          toast.success("Chỉnh sửa lý lịch thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message || "Chỉnh sửa thất bại");
        }
      } else {
        const response = await kPI_LyLich2CService.create(formData);
        if (response.status) {
          toast.success("Thêm mới lý lịch thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message || "Thêm mới thất bại");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Đã xảy ra lỗi khi lưu dữ liệu");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    props.onClose();
  };

  const tabItems = [
    {
      key: "thongTinChung",
      label: "1. Thông tin chung & Công tác",
      children: (
        <Row gutter={[16, 12]}>
          {/* Khung ảnh đại diện phong cách CV bên trái */}
          <Col span={5}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#fafafa",
                border: "1px dashed #d9d9d9",
                borderRadius: 8,
                padding: 12,
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: 110,
                  height: 140,
                  borderRadius: 6,
                  overflow: "hidden",
                  border: "2px solid #1890ff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ textAlign: "center", color: "#bfbfbf" }}>
                    <UserOutlined style={{ fontSize: 42 }} />
                    <div style={{ fontSize: 11, marginTop: 4 }}>Ảnh 3x4</div>
                  </div>
                )}
              </div>
              <Form.Item<KPI_LyLich2CCreateOrUpdateType>
                label={<span style={{ fontSize: 12, fontWeight: 500 }}>Link Ảnh đại diện</span>}
                name="avatar"
                style={{ width: "100%", marginBottom: 0 }}
              >
                <Input size="small" placeholder="Dán link ảnh..." allowClear />
              </Form.Item>
            </div>
          </Col>

          {/* Cột thông tin chính bên phải */}
          <Col span={19}>
            <Row gutter={[12, 10]}>
              <Col span={12}>
                <Form.Item<KPI_LyLich2CCreateOrUpdateType>
                  label="Họ và tên"
                  name="hoTen"
                  rules={[{ required: true, message: "Vui lòng nhập Họ và tên!" }]}
                >
                  <Input placeholder="Nhập Họ và tên" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Mã cán bộ" name="maCanBo">
                  <Input placeholder="Nhập Mã cán bộ" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Giới tính" name="gioiTinh">
                  <Select placeholder="Chọn Giới tính" allowClear>
                    <Select.Option value="Nam">Nam</Select.Option>
                    <Select.Option value="Nữ">Nữ</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Ngày sinh" name="ngaysinh">
                  <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Chọn Ngày sinh" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<KPI_LyLich2CCreateOrUpdateType>
                  label="Đơn vị sử dụng"
                  name="donViSuDungId"
                  rules={[{ required: true, message: "Vui lòng chọn Đơn vị!" }]}
                >
                  <Select
                    placeholder="Chọn Đơn vị sử dụng"
                    options={donViList}
                    onChange={handleDonViChange}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      ((option?.label ?? "") as string).toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<KPI_LyLich2CCreateOrUpdateType>
                  label="Phòng ban"
                  name="phongBanId"
                  rules={[{ required: true, message: "Vui lòng chọn Phòng ban!" }]}
                >
                  <Select
                    placeholder="Chọn Phòng ban"
                    options={phongBanList}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      ((option?.label ?? "") as string).toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Chức vụ hiện tại" name="chucVuHienTai">
                  <Input placeholder="Nhập Chức vụ hiện tại" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Số hiệu CCVC" name="soHieuCCVC">
                  <Input placeholder="Nhập Số hiệu CCVC" />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          {/* Dòng thứ hai của Tab 1 */}
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Ngày bổ nhiệm" name="ngayBoNhiem">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Chọn Ngày bổ nhiệm" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Ngày bổ nhiệm lại" name="ngayBoNhiemLai">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Chọn Ngày bổ nhiệm lại" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Email" name="email">
              <Input placeholder="Nhập Email" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Số điện thoại" name="phone">
              <Input placeholder="Nhập Số điện thoại" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Số CMND/CCCD" name="soCMND">
              <Input placeholder="Nhập Số CMND/CCCD" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Ngày cấp" name="ngayCapCMND">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Chọn Ngày cấp" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Nơi cấp" name="noiCapCMND">
              <Input placeholder="Nhập Nơi cấp" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Loại hợp đồng" name="loaiHopDong">
              <Input placeholder="Nhập Loại hợp đồng" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Tình trạng hôn nhân" name="tinhTrangHonNhan">
              <Input placeholder="Nhập Tình trạng hôn nhân" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Tên gọi khác" name="tenKhac">
              <Input placeholder="Nhập Tên gọi khác" />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: "queQuanThuongTru",
      label: "2. Quê quán & Thường trú",
      children: (
        <Row gutter={[16, 12]}>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Nơi sinh (Tỉnh/Thành phố)" name="noiSinhTinh">
              <Input placeholder="Nhập Nơi sinh (Tỉnh/TP)" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Nơi sinh (Phường/Xã)" name="noiSinhXa">
              <Input placeholder="Nhập Nơi sinh (Xã/Phường)" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Nơi sinh chi tiết" name="noiSinh">
              <Input placeholder="Nhập Nơi sinh chi tiết" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Quê quán (Tỉnh/Thành phố)" name="queQuanTinh">
              <Input placeholder="Nhập Quê quán (Tỉnh/TP)" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Quê quán (Phường/Xã)" name="queQuanXa">
              <Input placeholder="Nhập Quê quán (Xã/Phường)" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Quê quán chi tiết" name="queQuan">
              <Input placeholder="Nhập Quê quán chi tiết" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Quê quán gốc" name="queQuanGoc">
              <Input placeholder="Nhập Quê quán gốc" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Dân tộc" name="danToc">
              <Input placeholder="Nhập Dân tộc" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Tôn giáo" name="tonGiao">
              <Input placeholder="Nhập Tôn giáo" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Quốc tịch" name="quocTich">
              <Input placeholder="Nhập Quốc tịch" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="HKTT (Tỉnh/Thành phố)" name="hoKhauThuongTru_Tinh">
              <Input placeholder="Nhập HKTT (Tỉnh/TP)" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="HKTT (Phường/Xã)" name="hoKhauThuongTru_Xa">
              <Input placeholder="Nhập HKTT (Phường/Xã)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Nơi đăng ký HKTT chi tiết" name="noiDangKyHKTT">
              <Input placeholder="Nhập Nơi đăng ký HKTT" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Nơi ở hiện nay (Tỉnh/TP)" name="noiOHienNay_Tinh">
              <Input placeholder="Nhập Nơi ở hiện nay (Tỉnh/TP)" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Nơi ở hiện nay (Phường/Xã)" name="noiOHienNay_Xa">
              <Input placeholder="Nhập Nơi ở hiện nay (Phường/Xã)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Địa chỉ hiện tại chi tiết" name="diaChiHienTai">
              <Input placeholder="Nhập Địa chỉ hiện tại" />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: "trinhDoDaoTao",
      label: "3. Trình độ & Đào tạo",
      children: (
        <Row gutter={[16, 12]}>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Trình độ cao nhất" name="trinhDoMax">
              <Input placeholder="Nhập Trình độ cao nhất" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Trình độ chuyên môn" name="trinhDo">
              <Input placeholder="Nhập Trình độ" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Trình độ GD phổ thông" name="trinhDoGiaoDucPhoThong">
              <Input placeholder="Nhập Trình độ GD phổ thông" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Vị trí việc làm" name="viTriViecLam">
              <Input placeholder="Nhập Vị trí việc làm" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Loại hình đào tạo" name="loaiHinhDaoTao">
              <Input placeholder="Nhập Loại hình đào tạo" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Lý luận chính trị" name="lyLuanChinhTri">
              <Input placeholder="Nhập Lý luận chính trị" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Quản lý nhà nước" name="quanLyNhaNuoc">
              <Input placeholder="Nhập Quản lý nhà nước" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Quản lý ngành" name="quanLyNganh">
              <Input placeholder="Nhập Quản lý ngành" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Tin học" name="tinHoc">
              <Input placeholder="Nhập Trình độ Tin học" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Tiếng Anh" name="tiengAnh">
              <Input placeholder="Nhập Trình độ Tiếng Anh" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Ngoại ngữ khác" name="ngoaiNgu">
              <Input placeholder="Nhập Ngoại ngữ khác" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Tiếng dân tộc" name="tiengDanToc">
              <Input placeholder="Nhập Tiếng dân tộc" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Học hàm" name="hocHam">
              <Input placeholder="Nhập Học hàm" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Năm phong học hàm" name="namPhongHocHam">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Chọn Năm phong học hàm" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Chức danh khoa học" name="chucDanhKhoaHoc">
              <Input placeholder="Nhập Chức danh khoa học" />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: "dangDoanKhac",
      label: "4. Đảng, Đoàn & Khác",
      children: (
        <Row gutter={[16, 12]}>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Ngày vào Đảng" name="ngayVaoDang">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Chọn Ngày vào Đảng" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Ngày vào Đảng chính thức" name="ngayVaoDangChinhThucTxt">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Chọn Ngày vào Đảng chính thức" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Nơi kết nạp Đảng" name="noiKetNapDang">
              <Input placeholder="Nhập Nơi kết nạp Đảng" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Chức vụ Đảng hiện tại" name="chucVuDangHienTai">
              <Input placeholder="Nhập Chức vụ Đảng hiện tại" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Chi bộ sinh hoạt Đảng" name="chiBoSinhHoatDang">
              <Input placeholder="Nhập Chi bộ sinh hoạt" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Ngày vào Đoàn" name="ngayVaoDoan">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Chọn Ngày vào Đoàn" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Chức vụ Đoàn" name="chucVuDoan">
              <Input placeholder="Nhập Chức vụ Đoàn" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Ngày nhập ngũ" name="ngayNhapNgu">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Chọn Ngày nhập ngũ" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Danh hiệu phong tặng" name="danhHieuPhongTang">
              <Input placeholder="Nhập Danh hiệu phong tặng" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Số BHXH" name="soBaoHiemXH">
              <Input placeholder="Nhập Số BHXH" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Lương" name="luong">
              <Input placeholder="Nhập Lương" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Hệ số lương" name="heSoLuong">
              <Input placeholder="Nhập Hệ số lương" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Bậc lương" name="bacLuong">
              <Input placeholder="Nhập Bậc lương" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Mã ngạch" name="maNgach">
              <Input placeholder="Nhập Mã ngạch" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_LyLich2CCreateOrUpdateType> label="Ngạch công/viên chức" name="ngachCongVienChuc">
              <Input placeholder="Nhập Ngạch công/viên chức" />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <Modal
      title={props.item != null ? "Chỉnh sửa lý lịch 2C" : "Thêm mới lý lịch 2C"}
      open={true}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Lưu dữ liệu"
      cancelText="Đóng"
      width={1100}
      style={{ top: 20 }}
    >
      <Form
        layout="vertical"
        form={form}
        name="formCreateUpdate"
        style={{ width: "100%", maxHeight: "72vh", overflowY: "auto", paddingRight: 8 }}
        onFinish={handleOnFinish}
        autoComplete="off"
      >
        {props.item && (
          <Form.Item<KPI_LyLich2CCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        <Tabs defaultActiveKey="thongTinChung" items={tabItems} />
      </Form>
    </Modal>
  );
};

export default KPI_LyLich2CCreateOrUpdate;
