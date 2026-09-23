import React, { useEffect, useState } from "react";
import { Modal, Form, Row, Col, Input, Select, Button, Table, message } from "antd";
import dayjs from "dayjs";
import { PhanAnhNenTangType } from "@/types/phan-anh-nen-tang/dto";
import tinhService from "@/services/tinh/tinh.service";
import vuViecPhanAnhService from "@/services/vuViecPhanAnh/vuViecPhanAnh.service";
import companyInfoService from "@/services/companyInfo/companyInfo.service";

interface CreateCaseModalProps {
  open: boolean;
  onCancel: () => void;
  item?: PhanAnhNenTangType | null;
  items?: PhanAnhNenTangType[];
  onSuccess?: () => void;
}

const CreateCaseModal: React.FC<CreateCaseModalProps> = ({ open, onCancel, item, items, onSuccess }) => {
  const [formCase] = Form.useForm();
  const [submittingCase, setSubmittingCase] = useState(false);
  const [tinhOptions, setTinhOptions] = useState<any[]>([]);
  const [searchingMST, setSearchingMST] = useState(false);

  const handleSearchMST = async () => {
    const mst = formCase.getFieldValue("maSoDoanhNghiep");
    if (!mst) {
      message.warning("Vui lòng nhập MST/Mã số doanh nghiệp để tra cứu!");
      return;
    }
    setSearchingMST(true);
    try {
      const res = await companyInfoService.getData({
        pageIndex: 1,
        pageSize: 1,
        taxCode: mst.trim(),
      });
      if (res.status && res.data?.items && res.data.items.length > 0) {
        const company = res.data.items[0];
        formCase.setFieldsValue({
          tenThuongNhan: company.name,
          diaChi: company.address,
          dienThoai: company.phone,
          email: company.email,
        });
        message.success("Tìm thấy thông tin doanh nghiệp!");
      } else {
        message.info("Không tìm thấy thông tin doanh nghiệp với MST này!");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi tra cứu doanh nghiệp!");
    } finally {
      setSearchingMST(false);
    }
  };

  const activeItem = item || (items && items.length > 0 ? items[0] : null);
  const dataSource = items && items.length > 0 ? items : (item ? [item] : []);

  useEffect(() => {
    const fetchTinh = async () => {
      try {
        const res = await tinhService.getData({ pageIndex: 1, pageSize: 200 });
        const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
        setTinhOptions(
          items.map((x: any) => ({
            label: x.tenDv ?? x.tenTinh ?? x.name,
            value: x.maTinh ?? x.code,
          }))
        );
      } catch (e) {
        console.error(e);
      }
    };
    fetchTinh();
  }, []);

  useEffect(() => {
    if (open && activeItem) {
      formCase.setFieldsValue({
        tenNenTang: activeItem.diaChiNenTang || activeItem.tenNenTang || activeItem.tenUngDung || "",
        tenUngDung: activeItem.tenUngDung || "",
        tenThuongNhan: "",
        maSoDoanhNghiep: "",
        diaChi: activeItem.diaChiThuongTru || "",
        dienThoai: activeItem.soDienThoai || "",
        email: activeItem.email || "",
        maTinh: activeItem.maTinh || undefined,
      });
    }
  }, [open, activeItem, formCase]);

  const handleCreateCaseSubmit = async (values: any) => {
    const ids = items && items.length > 0 ? items.map(x => x.id).filter(Boolean) : (item?.id ? [item.id] : []);
    if (ids.length === 0) return;
    setSubmittingCase(true);
    try {
      const response = await vuViecPhanAnhService.create({
        ...values,
        phanAnhNenTangIds: ids,
        trangThai: 0,
        ketLuan: 0,
      });
      if (response.status) {
        message.success("Tạo vụ việc phản ánh thành công!");
        if (onSuccess) onSuccess();
        onCancel();
      } else {
        message.error(response.message || "Tạo vụ việc phản ánh thất bại!");
      }
    } catch (e) {
      console.error(e);
      message.error("Đã xảy ra lỗi khi tạo vụ việc phản ánh!");
    } finally {
      setSubmittingCase(false);
    }
  };

  return (
    <Modal
      open={open}
      title="XÁC NHẬN TẠO MỚI VỤ VIỆC"
      onCancel={onCancel}
      width={950}
      footer={
        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <Button
            type="primary"
            onClick={() => formCase.submit()}
            loading={submittingCase}
            style={{
              backgroundColor: "#3b82f6",
              borderColor: "#3b82f6",
              color: "#fff",
              width: "120px",
              borderRadius: 4
            }}
          >
            Xác nhận
          </Button>
          <Button
            onClick={onCancel}
            style={{
              backgroundColor: "#94a3b8",
              borderColor: "#94a3b8",
              color: "#fff",
              width: "100px",
              borderRadius: 4
            }}
          >
            Đóng
          </Button>
        </div>
      }
    >
      <Form
        form={formCase}
        layout="vertical"
        onFinish={handleCreateCaseSubmit}
      >
        {/* Thông tin vụ việc */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#0088cc", display: "block", marginBottom: "16px" }}>
            Thông tin vụ việc
          </span>

          <div style={{ marginBottom: "16px", fontSize: "14px", color: "#334155", display: "flex", gap: "8px", paddingLeft: "12px" }}>
            <span style={{ fontWeight: 600 }}>Loại phản ánh :</span>
            <span>{activeItem?.tenLoaiPhanAnh || "—"}</span>
          </div>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="Tên website/ứng dụng"
                name="tenNenTang"
                rules={[{ required: true, message: "Vui lòng nhập tên website/ứng dụng!" }]}
              >
                <Input placeholder="Nhập tên website/ứng dụng..." className="rounded border-gray-300" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="MST/Mã số doanh nghiệp"
                name="maSoDoanhNghiep"
                rules={[{ required: true, message: "Vui lòng nhập MST/Mã số doanh nghiệp!" }]}
              >
                <Input.Search
                  placeholder="Nhập MST/Mã số doanh nghiệp..."
                  enterButton="Tra cứu"
                  loading={searchingMST}
                  onSearch={handleSearchMST}
                  className="rounded border-gray-300"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="Tên thương nhân/Tổ chức/Cá nhân"
                name="tenThuongNhan"
                rules={[{ required: true, message: "Vui lòng nhập tên thương nhân/Tổ chức/Cá nhân!" }]}
              >
                <Input placeholder="Nhập tên thương nhân/Tổ chức/Cá nhân..." className="rounded border-gray-300" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="Địa chỉ"
                name="diaChi"
              >
                <Input placeholder="Nhập địa chỉ..." className="rounded border-gray-300" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="Điện thoại"
                name="dienThoai"
              >
                <Input placeholder="Nhập số điện thoại..." className="rounded border-gray-300" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: "email", message: "Email không đúng định dạng!" }]}
              >
                <Input placeholder="Nhập email..." className="rounded border-gray-300" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="Tỉnh/Thành phố"
                name="maTinh"
                rules={[{ required: true, message: "Vui lòng chọn Tỉnh/Thành phố!" }]}
              >
                <Select
                  placeholder="--Chọn Tỉnh/Thành phố--"
                  options={tinhOptions}
                  showSearch
                  optionFilterProp="label"
                  className="rounded"
                  allowClear
                  filterOption={(input, option) =>
                    ((option?.label as string) ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>

      {/* Thông tin người phản ánh */}
      <div style={{ marginBottom: "20px" }}>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#0088cc", display: "block", marginBottom: "16px" }}>
          Thông tin người phản ánh
        </span>
        <Table
          size="small"
          columns={[
            {
              title: <span style={{ fontSize: "13px" }}>STT</span>,
              dataIndex: "stt",
              key: "stt",
              width: 60,
              align: "center",
              render: (_: any, __: any, index: number) => index + 1,
            },
            {
              title: <span style={{ fontSize: "13px" }}>Người phản ánh</span>,
              key: "nguoiPhanAnh",
              width: 250,
              render: (_: any, record: PhanAnhNenTangType) => (
                <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                  <div>Họ tên: {record?.hoTen || "—"}</div>
                  <div>CMND/CCCD: {record?.soCCCD || "—"}</div>
                  <div>Ngày sinh: {record?.ngaySinh ? dayjs(record.ngaySinh).format("DD/MM/YYYY") : "—"}</div>
                  <div>Điện thoại: {record?.soDienThoai || "—"}</div>
                  <div>Email: {record?.email || "—"}</div>
                </div>
              ),
            },
            {
              title: <span style={{ fontSize: "13px" }}>Thông tin phản ánh</span>,
              key: "thongTinPhanAnh",
              width: 200,
              render: (_: any, record: PhanAnhNenTangType) => (
                <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                  <div>Website: {record?.diaChiNenTang || "—"}</div>
                  <div>Tỉnh/Thành phố: {record?.tenTinh || "—"}</div>
                </div>
              ),
            },
            {
              title: <span style={{ fontSize: "13px" }}>Nội dung</span>,
              key: "noiDung",
              render: (_: any, record: PhanAnhNenTangType) => (
                <div style={{ fontSize: "13px", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                  {record?.noiDungPhanAnh || "—"}
                </div>
              ),
            },
          ]}
          dataSource={dataSource}
          rowKey="id"
          bordered
          pagination={{ pageSize: 5 }}
        />
      </div>
    </Modal>
  );
};

export default CreateCaseModal;
