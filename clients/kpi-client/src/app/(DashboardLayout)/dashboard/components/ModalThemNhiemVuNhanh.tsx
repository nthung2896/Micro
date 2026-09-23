import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Space, Typography, Tag, Divider, Alert, Card, Tooltip } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  SaveOutlined,
  FileDoneOutlined,
  OrderedListOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import kPI_NhiemVuService from "@/services/kPI_NhiemVu/kPI_NhiemVuService";
import ModalChonTieuChi from "../../kPI_BieuChamDiem/ModalChonTieuChi";
import { TieuChiSuggestor } from "../../kPI_BieuChamDiem/InlineComponents";

const { Text } = Typography;

const createEmptyProduct = () => ({
  tenSanPhamDauRa: "",
  tieuChiId: null,
  tenTieuChi: "",
  diemTheoBoTieuChi: 0,
  ghiChuGiaTrinh: "",
});

interface ModalThemNhiemVuNhanhProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  dotDanhGia: {
    idDotDanhGia: string;
    tenDotDanhGia?: string;
    idPhieuDanhGia?: string;
  } | null;
  idLyLich?: string;
}

export default function ModalThemNhiemVuNhanh({
  visible,
  onClose,
  onSuccess,
  dotDanhGia,
  idLyLich,
}: ModalThemNhiemVuNhanhProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [chonTieuChiVisible, setChonTieuChiVisible] = useState(false);
  const [selectedProductTarget, setSelectedProductTarget] = useState<{
    taskIndex: number;
    productIndex: number;
  } | null>(null);
  const currentUser = useSelector((state: any) => state.auth?.User);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        danhSachNhiemVu: [
          {
            tenNhiemVuDayDu: "",
            danhSachSanPham: [createEmptyProduct()],
          },
        ],
      });
      setChonTieuChiVisible(false);
      setSelectedProductTarget(null);
    }
  }, [visible, form]);

  const getTieuChiPath = (record: any) => {
    const pathParts: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const levelName = record?.[`level${i}Name`];
      if (levelName) pathParts.push(levelName);
    }

    return pathParts.length > 0
      ? pathParts.join(" / ")
      : (record?.congViecChiTiet || record?.tenNhomTieuChi || record?.id || "");
  };

  const handleSelectTieuChi = (records: any[]) => {
    const selected = records?.[0];
    if (!selected || !selectedProductTarget) return;

    const selectedScore = Number(selected.diem ?? selected.diemToiDa ?? 0);
    const tieuChiPath = getTieuChiPath(selected);
    const defaultProductName = selected.sanPhamDauRa || selected.congViecChiTiet || selected.tenNhomTieuChi || "";

    const tasks = form.getFieldValue("danhSachNhiemVu") || [];
    const updatedTasks = tasks.map((task: any, taskIndex: number) => {
      if (taskIndex !== selectedProductTarget.taskIndex) return task;

      return {
        ...task,
        danhSachSanPham: (task.danhSachSanPham || []).map((product: any, productIndex: number) =>
          productIndex === selectedProductTarget.productIndex
            ? {
              ...product,
              tieuChiId: selected.id,
              tenTieuChi: tieuChiPath,
              diemTheoBoTieuChi: selectedScore,
              // Sản phẩm đầu ra thuộc về căn cứ chấm đang chọn. Không giữ dữ liệu
              // của căn cứ cũ khi người dùng chọn lại một tiêu chí khác.
              tenSanPhamDauRa: defaultProductName,
            }
            : product
        ),
      };
    });

    form.setFieldsValue({ danhSachNhiemVu: updatedTasks });
  };

  const handleClearTieuChi = (taskIndex: number, productIndex: number) => {
    const tasks = form.getFieldValue("danhSachNhiemVu") || [];
    const updatedTasks = tasks.map((task: any, currentTaskIndex: number) => {
      if (currentTaskIndex !== taskIndex) return task;

      return {
        ...task,
        danhSachSanPham: (task.danhSachSanPham || []).map((product: any, currentProductIndex: number) =>
          currentProductIndex === productIndex
            ? {
              ...product,
              tenSanPhamDauRa: "",
              tieuChiId: null,
              tenTieuChi: "",
              diemTheoBoTieuChi: 0,
            }
            : product
        ),
      };
    });

    form.setFieldsValue({ danhSachNhiemVu: updatedTasks });
  };

  const handleFinish = async (values: any) => {
    if (!dotDanhGia?.idDotDanhGia) {
      toast.error("Không tìm thấy thông tin đợt đánh giá!");
      return;
    }

    const tasks = values.danhSachNhiemVu || [];
    if (tasks.length === 0) {
      toast.warning("Vui lòng thêm ít nhất một nhiệm vụ!");
      return;
    }

    // Kiểm tra bắt buộc nhập tên nhiệm vụ và sản phẩm đầu ra
    for (let tIdx = 0; tIdx < tasks.length; tIdx++) {
      const t = tasks[tIdx];
      if (!t?.tenNhiemVuDayDu || !t.tenNhiemVuDayDu.trim()) {
        toast.warning(`Vui lòng nhập tên cho Nhiệm vụ #${tIdx + 1}!`);
        return;
      }
      const sanPhams = t.danhSachSanPham || [];
      if (sanPhams.length === 0) {
        toast.warning(`Vui lòng thêm ít nhất một sản phẩm đầu ra cho Nhiệm vụ #${tIdx + 1}!`);
        return;
      }
      for (let sIdx = 0; sIdx < sanPhams.length; sIdx++) {
        const spName = typeof sanPhams[sIdx] === "string" ? sanPhams[sIdx] : sanPhams[sIdx]?.tenSanPhamDauRa;
        if (!spName || !spName.trim()) {
          toast.warning(`Vui lòng nhập tên sản phẩm đầu ra #${sIdx + 1} của Nhiệm vụ #${tIdx + 1}!`);
          return;
        }
      }
    }

    const payload = tasks.map((t: any) => {
      const tenNhiemVu = t.tenNhiemVuDayDu.trim();
      const sanPhams = (t.danhSachSanPham || [])
        .map((sp: any) => {
          const tenSanPhamDauRa = typeof sp === "string" ? sp : sp?.tenSanPhamDauRa;
          const tieuChiId = typeof sp === "string" ? null : (sp?.tieuChiId || null);
          const diemTheoBoTieuChi = typeof sp === "string" ? 0 : Number(sp?.diemTheoBoTieuChi || 0);
          const tenTieuChi = typeof sp === "string" ? "" : (sp?.tenTieuChi || "");

          return {
            tenSanPhamDauRa: (tenSanPhamDauRa || "").trim(),
            tieuChiId,
            tenTieuChi: tenTieuChi || undefined,
            diemTheoBoTieuChi,
            chamDiemSoLuong_HoanThanh: diemTheoBoTieuChi,
            chamDiemSoLuong_KhongHoanThanh: 0,
            chamDiemSoLuong_Diem: diemTheoBoTieuChi > 0 ? 100 : 0,
            chamDiemChatLuong_KhongDat: 0,
            chamDiemChatLuong_SoDiemConLai: diemTheoBoTieuChi,
            chamDiemChatLuong_Diem: diemTheoBoTieuChi > 0 ? 100 : 0,
            chamDiemTienDo_KhongDat: 0,
            chamDiemTienDo_SoDiemConLai: diemTheoBoTieuChi,
            chamDiemTienDo_Diem: diemTheoBoTieuChi > 0 ? 100 : 0,
            ghiChuGiaTrinh: typeof sp === "string" ? undefined : sp?.ghiChuGiaTrinh?.trim() || undefined,
          };
        });

      const totalDiem = sanPhams.reduce((sum: number, sp: any) => sum + (Number(sp?.diemTheoBoTieuChi) || 0), 0);
      const boTieuChiList = (t.danhSachSanPham || [])
        .map((sp: any) => sp?.tenTieuChi || sp?.tieuChiId)
        .filter(Boolean);

      return {
        tenNhiemVuDayDu: tenNhiemVu,
        typeNhiemVu: "PHATSINH",
        idLyLich: idLyLich || undefined,
        idDotTheoDoiDanhGia: dotDanhGia.idDotDanhGia,
        idPhieuDanhGia: dotDanhGia.idPhieuDanhGia || undefined,
        diemBoTieuChi: totalDiem,
        boTieuChiList: boTieuChiList.length > 0 ? boTieuChiList : [],
        danhSachDauRa: sanPhams,
      };
    });

    setLoading(true);
    try {
      const res = await kPI_NhiemVuService.createPhatSinhBulk(payload);
      if (res && res.status !== false) {
        toast.success(
          payload.length > 1
            ? `Đã thêm thành công ${payload.length} nhiệm vụ vào đợt đánh giá!`
            : "Thêm nhiệm vụ nhanh vào đợt đánh giá thành công!"
        );
        form.resetFields();
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res?.message || "Lỗi khi lưu nhiệm vụ.");
      }
    } catch (err: any) {
      console.error("Lỗi khi thêm nhiệm vụ nhanh:", err);
      toast.error(err?.message || "Đã xảy ra lỗi khi thêm nhiệm vụ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
          <ThunderboltOutlined style={{ fontSize: 22, color: "#f59e0b" }} />
          <span style={{ fontWeight: 700, fontSize: 17 }}>THÊM NHANH NHIỆM VỤ VÀO ĐỢT ĐÁNH GIÁ</span>
        </div>
      }
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={800}
      styles={{
        header: {
          background: "#0355a2",
          borderBottom: "1px solid #0355a2",
          padding: "12px 20px",
          marginBottom: 0,
          color: "#fff",
        },
        body: {
          padding: 0,
          height: "calc(82vh - 120px)",
          maxHeight: "calc(82vh - 120px)",
          overflow: "hidden",
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
        }}
        initialValues={{
          danhSachNhiemVu: [
            {
              tenNhiemVuDayDu: "",
              danhSachSanPham: [createEmptyProduct()],
            },
          ],
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: 0,
          }}
        >
          {/* Banner thông tin đợt */}
          {dotDanhGia && (
            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: 8,
                padding: "10px 16px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Space>
                <CalendarOutlined style={{ color: "#0284c7", fontSize: 18 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Đợt đánh giá áp dụng:</Text>
                  <div style={{ fontWeight: 700, color: "#0369a1", fontSize: 14 }}>
                    {dotDanhGia.tenDotDanhGia || "Đợt hiện tại"}
                  </div>
                </div>
              </Space>
              <Tag color="processing" style={{ borderRadius: 12, fontWeight: 600 }}>
                Nhiệm vụ phát sinh
              </Tag>
            </div>
          )}

          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 20, borderRadius: 8, fontSize: 13 }}
            message="Lưu nhớ nhiệm vụ phát sinh"
            description="Bạn có thể thêm 1 hoặc nhiều nhiệm vụ cùng lúc. Các nhiệm vụ và sản phẩm đầu ra sẽ được lưu ngay vào đợt đánh giá này để bạn gắn tiêu chí và tự chấm điểm chi tiết khi mở phiếu đánh giá."
          />

          <Form.List name="danhSachNhiemVu">
            {(taskFields, { add: addTask, remove: removeTask }) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {taskFields.map((taskField, taskIndex) => (
                  <div
                    key={taskField.key}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                      overflow: "hidden",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* Task Header */}
                    <div
                      style={{
                        background: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                        padding: "10px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Space size={8}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "#0284c7",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {taskIndex + 1}
                        </span>
                        <span style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>
                          Nhiệm vụ #{taskIndex + 1}
                        </span>
                      </Space>

                      {taskFields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeTask(taskField.name)}
                          style={{ fontWeight: 500, fontSize: 13 }}
                        >
                          Xóa nhiệm vụ
                        </Button>
                      )}
                    </div>

                    {/* Task Body */}
                    <div style={{ padding: "16px 16px 8px 16px" }}>
                      {/* Tên nhiệm vụ */}
                      <Form.Item
                        {...taskField}
                        name={[taskField.name, "tenNhiemVuDayDu"]}
                        label={
                          <span style={{ fontWeight: 600 }}>
                            Tên nhiệm vụ <span style={{ color: "#ff4d4f" }}>*</span>
                          </span>
                        }
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: `Vui lòng nhập tên cho Nhiệm vụ #${taskIndex + 1}!`,
                          },
                        ]}
                        style={{ marginBottom: 14 }}
                      >
                        <Input.TextArea
                          autoSize={{ minRows: 2, maxRows: 4 }}
                          placeholder="Ví dụ: Xây dựng báo cáo kết quả triển khai chuyển đổi số tháng 9..."
                          style={{ borderRadius: 6 }}
                        />
                      </Form.Item>

                      {/* Danh sách sản phẩm đầu ra của nhiệm vụ */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>
                            <FileDoneOutlined style={{ marginRight: 6, color: "#0284c7" }} />
                            Sản phẩm đầu ra và căn cứ chấm
                          </span>
                        </div>
                        <Form.List name={[taskField.name, "danhSachSanPham"]}>
                          {(spFields, { add: addSp, remove: removeSp }) => (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {spFields.map((spField, spIndex) => (
                                <div
                                  key={spField.key}
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) auto",
                                    gap: 8,
                                    alignItems: "end",
                                    padding: "8px 0",
                                    borderBottom: spIndex < spFields.length - 1 ? "1px solid #f1f5f9" : undefined,
                                  }}
                                >
                                  <Form.Item
                                    {...spField}
                                    name={[spField.name, "tenSanPhamDauRa"]}
                                    label={
                                      <span style={{ fontSize: 12, fontWeight: 500 }}>
                                        Sản phẩm đầu ra <span style={{ color: "#ff4d4f" }}>*</span>
                                      </span>
                                    }
                                    rules={[
                                      {
                                        required: true,
                                        whitespace: true,
                                        message: `Vui lòng nhập tên sản phẩm đầu ra ${spFields.length > 1 ? spIndex + 1 : ""}!`,
                                      },
                                    ]}
                                    style={{ marginBottom: 0, flex: 1, minWidth: 0 }}
                                  >
                                    <Input
                                      placeholder={`Sản phẩm đầu ra ${spFields.length > 1 ? spIndex + 1 : ""} (ví dụ: Báo cáo, Quyết định...)`}
                                      style={{ borderRadius: 6 }}
                                    />
                                  </Form.Item>
                                  <Form.Item {...spField} name={[spField.name, "tieuChiId"]} hidden>
                                    <Input />
                                  </Form.Item>
                                  <Form.Item {...spField} name={[spField.name, "tenTieuChi"]} hidden>
                                    <Input />
                                  </Form.Item>
                                  <Form.Item {...spField} name={[spField.name, "diemTheoBoTieuChi"]} hidden>
                                    <Input />
                                  </Form.Item>
                                  <Form.Item shouldUpdate noStyle>
                                    {() => {
                                      const sp = form.getFieldValue(["danhSachNhiemVu", taskIndex, "danhSachSanPham", spIndex]);
                                      const score = sp?.diemTheoBoTieuChi;
                                      return (
                                        <div style={{ minWidth: 0 }}>
                                          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span>Căn cứ chấm theo Bộ tiêu chí</span>
                                            {score !== undefined && score !== null && Number(score) > 0 && (
                                              <Tag color="blue" style={{ margin: 0, fontWeight: 600, fontSize: 11, borderRadius: 10 }}>
                                                {score} điểm
                                              </Tag>
                                            )}
                                          </div>
                                          <TieuChiSuggestor
                                            value={sp?.tenTieuChi}
                                            onClick={() => {
                                              setSelectedProductTarget({ taskIndex, productIndex: spIndex });
                                              setChonTieuChiVisible(true);
                                            }}
                                            onClear={() => handleClearTieuChi(taskIndex, spIndex)}
                                          />
                                        </div>
                                      );
                                    }}
                                  </Form.Item>
                                  {spFields.length > 1 && (
                                    <Tooltip title="Xóa sản phẩm và căn cứ chấm này">
                                      <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeSp(spField.name)}
                                      />
                                    </Tooltip>
                                  )}
                                  <Form.Item
                                    {...spField}
                                    name={[spField.name, "ghiChuGiaTrinh"]}
                                    label={
                                      <span style={{ fontSize: 12, fontWeight: 500, color: "#475569" }}>
                                        Ghi chú / Giải trình (tùy chọn)
                                      </span>
                                    }
                                    style={{ gridColumn: "1 / -1", marginBottom: 0 }}
                                  >
                                    <Input
                                      placeholder="Ghi chú riêng cho sản phẩm đầu ra này..."
                                      style={{ borderRadius: 6 }}
                                    />
                                  </Form.Item>
                                </div>
                              ))}
                              <Button
                                type="dashed"
                                size="small"
                                onClick={() => addSp(createEmptyProduct())}
                                icon={<PlusOutlined />}
                                style={{
                                  borderRadius: 6,
                                  color: "#0284c7",
                                  borderColor: "#bae6fd",
                                  marginTop: 2,
                                  width: "fit-content",
                                }}
                              >
                                Thêm sản phẩm đầu ra khác
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </div>

                    </div>
                  </div>
                ))}

                {/* Nút thêm nhiệm vụ mới */}
                <Button
                  type="dashed"
                  onClick={() =>
                    addTask({
                      tenNhiemVuDayDu: "",
                      danhSachSanPham: [createEmptyProduct()],
                    })
                  }
                  icon={<PlusCircleOutlined />}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 8,
                    borderColor: "#0284c7",
                    color: "#0284c7",
                    fontWeight: 600,
                    background: "#f0f9ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontSize: 14,
                  }}
                >
                  Thêm nhiệm vụ khác vào đợt này
                </Button>
              </div>
            )}
          </Form.List>

          <Divider style={{ margin: "20px 0 16px 0" }} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            padding: "12px 24px 16px",
            background: "#fff",
            borderTop: "1px solid #e2e8f0",
            boxShadow: "0 -2px 8px rgba(15, 23, 42, 0.06)",
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            Nhấn <b>"Lưu tất cả nhiệm vụ"</b> để lưu toàn bộ danh sách đã nhập.
          </Text>

          <Space size={12}>
            <Button onClick={onClose} disabled={loading} style={{ borderRadius: 6, minWidth: 80 }}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              style={{
                borderRadius: 6,
                fontWeight: 600,
                backgroundColor: "#0355a2",
                borderColor: "#0355a2",
                padding: "0 24px",
                minWidth: 160,
              }}
            >
              Lưu tất cả nhiệm vụ
            </Button>
          </Space>
        </div>
      </Form>

      {chonTieuChiVisible && selectedProductTarget && (
        <ModalChonTieuChi
          visible={chonTieuChiVisible}
          onCancel={() => {
            setChonTieuChiVisible(false);
            setSelectedProductTarget(null);
          }}
          onSelectMultiple={handleSelectTieuChi}
          idDotDanhGia={dotDanhGia?.idDotDanhGia}
          idLyLich={idLyLich}
          donViId={currentUser?.donViSuDungId || currentUser?.donViId || currentUser?.departmentId}
          initialSelectedNames={(() => {
            const selectedName = form.getFieldValue([
              "danhSachNhiemVu",
              selectedProductTarget.taskIndex,
              "danhSachSanPham",
              selectedProductTarget.productIndex,
              "tenTieuChi",
            ]);
            return selectedName ? [selectedName] : [];
          })()}
          tenNhiemVu={form.getFieldValue(["danhSachNhiemVu", selectedProductTarget.taskIndex, "tenNhiemVuDayDu"])}
          tenSanPham={form.getFieldValue([
            "danhSachNhiemVu",
            selectedProductTarget.taskIndex,
            "danhSachSanPham",
            selectedProductTarget.productIndex,
            "tenSanPhamDauRa",
          ])}
          relatedTieuChiIds={(form.getFieldValue(["danhSachNhiemVu", selectedProductTarget.taskIndex, "danhSachSanPham"]) || [])
            .filter((_: any, productIndex: number) => productIndex !== selectedProductTarget.productIndex)
            .map((product: any) => product?.tieuChiId)
            .filter(Boolean)}
        />
      )}
    </Modal>
  );
}
