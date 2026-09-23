import React, { useState } from "react";
import { Modal, Form, Input, Button, Select, InputNumber, Table, message } from "antd";
import { PlusOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import kPI_NhiemVuService from "@/services/kPI_NhiemVu/kPI_NhiemVuService";
import kPI_CauHinhCongThucNhiemVuService from "@/services/kPI_CauHinhCongThucNhiemVu/kPI_CauHinhCongThucNhiemVuService";
import ModalChonTieuChi from "./ModalChonTieuChi";
import { KPI_NhomTieuChiType } from "@/types/kPI_NhomTieuChi/kPI_NhomTieuChi";

import { useSearchParams } from "next/navigation";

interface ModalTaoNhiemVuPhatSinhProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  idLyLich: string;
  idDotTheoDoiDanhGia: string;
  chucVuHeSo?: number | null;
  editTask?: any;
}

const ModalTaoNhiemVuPhatSinh: React.FC<ModalTaoNhiemVuPhatSinhProps> = ({
  visible,
  onCancel,
  onSuccess,
  idLyLich,
  idDotTheoDoiDanhGia,
  chucVuHeSo,
  editTask,
}) => {
  const searchParams = useSearchParams();
  const idPhieuDanhGia = searchParams.get('idPhieuDanhGia');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [chonTieuChiVisible, setChonTieuChiVisible] = useState(false);
  const [activeTaskField, setActiveTaskField] = useState<number | null>(null);
  const idDonVi = useSelector((state: any) => state.auth?.User?.donViId);

  const formatPercent = (val: any) => {
    if (val === null || val === undefined || val === "") return "";
    let num = Number(val);
    if (isNaN(num)) return val as string;
    if (num < 0) num = 0;
    return `${Number(num.toFixed(1))}%`;
  };

  React.useEffect(() => {
    if (visible) {
      if (editTask) {
        form.setFieldsValue({
          tasks: [{
            id: editTask.id,
            tenNhiemVuDayDu: editTask.tenNhiemVuDayDu,
            diemBoTieuChi: editTask.diemBoTieuChi,
            diemHeSo: editTask.diemBoTieuChi * (chucVuHeSo || 1),
            boTieuChiList: editTask.boTieuChiList,
            danhSachDauRa: editTask.danhSachDauRa && editTask.danhSachDauRa.length > 0 ? editTask.danhSachDauRa.map((sp: any) => ({
              id: sp.id,
              tenSanPhamDauRa: sp.tenSanPhamDauRa,
              chamDiemSoLuong_HoanThanh: sp.chamDiemSoLuong_HoanThanh,
              chamDiemSoLuong_KhongHoanThanh: sp.chamDiemSoLuong_KhongHoanThanh,
              chamDiemSoLuong_Diem: sp.chamDiemSoLuong_Diem,
              chamDiemChatLuong_KhongDat: sp.chamDiemChatLuong_KhongDat,
              chamDiemChatLuong_ConLai: sp.chamDiemChatLuong_SoDiemConLai,
              chamDiemChatLuong_Diem: sp.chamDiemChatLuong_Diem,
              chamDiemTienDo_KhongDat: sp.chamDiemTienDo_KhongDat,
              chamDiemTienDo_ConLai: sp.chamDiemTienDo_SoDiemConLai,
              chamDiemTienDo_Diem: sp.chamDiemTienDo_Diem,
              ghiChuGiaTrinh: sp.ghiChuGiaTrinh,
              tieuChiId: sp.tieuChiId,
            })) : [{ tenSanPhamDauRa: "" }]
          }]
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editTask, form, chucVuHeSo]);

  const handleCalculateField = async (fieldIndex: number, productIndex: number, targetColumn: string, resultField: string) => {
    try {
      const currentTasks = form.getFieldValue("tasks") || [];
      const task = currentTasks[fieldIndex];
      if (!task || !task.danhSachDauRa || !task.danhSachDauRa[productIndex]) return;
      const product = task.danhSachDauRa[productIndex];

      const resFormula = await kPI_CauHinhCongThucNhiemVuService.getFormula(
        "KPI_NhiemVu",
        targetColumn,
        idDotTheoDoiDanhGia,
        idDonVi
      );

      if (resFormula.status && resFormula.data) {
        const configId = resFormula.data.id;
        if (!configId) return;

        const baseDiem = task.diemBoTieuChi || 0;
        const actualDiem = chucVuHeSo !== null && chucVuHeSo !== undefined ? baseDiem * chucVuHeSo : baseDiem;

        const parameters: any = {
          ChamDiemSoLuong_HoanThanh: product.chamDiemSoLuong_HoanThanh || 0,
          ChamDiemSoLuong_KhongHoanThanh: product.chamDiemSoLuong_KhongHoanThanh || 0,
          ChamDiemChatLuong_KhongDat: product.chamDiemChatLuong_KhongDat || 0,
          ChamDiemChatLuong_SoDiemConLai: product.chamDiemChatLuong_ConLai || 0,
          ChamDiemTienDo_KhongDat: product.chamDiemTienDo_KhongDat || 0,
          ChamDiemTienDo_SoDiemConLai: product.chamDiemTienDo_ConLai || 0,
          DiemTheoBoTieuChi: actualDiem,
          DiemBoTieuChi: actualDiem,
          DiemHeSo: baseDiem * (chucVuHeSo || 1),
        };

        const resCalc = await kPI_CauHinhCongThucNhiemVuService.calculateFormulaV2(configId, parameters);
        if (resCalc.status && resCalc.data !== undefined) {
          product[resultField] = Math.max(0, Number(resCalc.data) || 0);
          form.setFieldsValue({ tasks: [...currentTasks] });
        }
      }
    } catch (error) {
      console.error(`Lỗi tính toán ${targetColumn}:`, error);
    }
  };

  const handleSelectTieuChi = (records: KPI_NhomTieuChiType[]) => {
    if (activeTaskField !== null) {
      const currentTasks = form.getFieldValue("tasks");
      if (currentTasks && currentTasks[activeTaskField]) {
        let currentBoTieuChiList = currentTasks[activeTaskField].boTieuChiList || [];

        let totalAddedDiem = 0;

        records.forEach(record => {
          let pathParts: string[] = [];
          for (let i = 1; i <= 5; i++) {
            const levelVal = (record as any)[`level${i}Name`];
            if (levelVal) {
              pathParts.push(levelVal);
            }
          }
          const name = pathParts.length > 0
            ? pathParts.join(' / ')
            : (record.congViecChiTiet || record.tenNhomTieuChi || record.sanPhamDauRa);
          if (name && !currentBoTieuChiList.includes(name)) {
            currentBoTieuChiList.push(name);
            if (record.diem) {
              totalAddedDiem += record.diem;
            }
          }
        });

        // Filter out empty ones and duplicates
        currentBoTieuChiList = Array.from(new Set(currentBoTieuChiList.filter((x: string) => !!x)));
        if (currentBoTieuChiList.length === 0) currentBoTieuChiList = [""];

        currentTasks[activeTaskField].boTieuChiList = currentBoTieuChiList;

        const currentDiem = currentTasks[activeTaskField].diemBoTieuChi || 0;
        const newDiem = currentDiem + totalAddedDiem;
        currentTasks[activeTaskField].diemBoTieuChi = newDiem;
        if (chucVuHeSo !== null && chucVuHeSo !== undefined) {
          currentTasks[activeTaskField].diemHeSo = newDiem * chucVuHeSo;
        }

        form.setFieldsValue({ tasks: [...currentTasks] });
      }
    }
  };

  const onOk = async () => {
    try {
      const values = await form.validateFields();
      if (!values.tasks || values.tasks.length === 0) {
        message.warning("Vui lòng thêm ít nhất một nhiệm vụ.");
        return;
      }

      setLoading(true);
      const dataToSend = values.tasks.map((task: any) => ({
        id: task.id,
        tenNhiemVuDayDu: task.tenNhiemVuDayDu,
        danhSachDauRa: task.danhSachDauRa?.filter((sp: any) => !!sp?.tenSanPhamDauRa).map((sp: any) => ({
          id: sp.id,
          tieuChiId: sp.tieuChiId,
          tenSanPhamDauRa: sp.tenSanPhamDauRa,
          chamDiemSoLuong_HoanThanh: sp.chamDiemSoLuong_HoanThanh,
          chamDiemSoLuong_KhongHoanThanh: sp.chamDiemSoLuong_KhongHoanThanh,
          chamDiemSoLuong_Diem: sp.chamDiemSoLuong_Diem,
          chamDiemChatLuong_KhongDat: sp.chamDiemChatLuong_KhongDat,
          chamDiemChatLuong_SoDiemConLai: sp.chamDiemChatLuong_ConLai,
          chamDiemChatLuong_Diem: sp.chamDiemChatLuong_Diem,
          chamDiemTienDo_KhongDat: sp.chamDiemTienDo_KhongDat,
          chamDiemTienDo_SoDiemConLai: sp.chamDiemTienDo_ConLai,
          chamDiemTienDo_Diem: sp.chamDiemTienDo_Diem,
          diemTheoBoTieuChi: task.diemBoTieuChi,
          ghiChuGiaTrinh: sp.ghiChuGiaTrinh,
        })) || [],
        boTieuChiList: task.boTieuChiList?.filter((x: string) => !!x) || [],
        idLyLich,
        idDotTheoDoiDanhGia,
        idPhieuDanhGia,
      }));

      const res = await kPI_NhiemVuService.createPhatSinhBulk(dataToSend);
      if (res.status) {
        message.success(res.message || (editTask ? "Cập nhật nhiệm vụ thành công" : "Tạo nhiệm vụ phát sinh thành công"));
        onSuccess();
      } else {
        message.error(res.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editTask ? "Cập nhật nhiệm vụ" : "Tạo nhiệm vụ phát sinh"}
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={loading}
      width="95vw"
      style={{ top: 20 }}
      destroyOnClose
    >
      <Form
        form={form}
        initialValues={{ tasks: [{ tenNhiemVuDayDu: "", danhSachDauRa: [{ tenSanPhamDauRa: "" }], boTieuChiList: [""] }] }}
      >
        <Form.List name="tasks">
          {(fields, { add, remove }) => {
            const columns: any = [
              {
                title: "STT",
                key: "stt",
                width: 50,
                align: "center",
                render: (_: any, __: any, index: number) => <strong>{index + 1}</strong>,
              },
              {
                title: "Miêu tả công việc",
                dataIndex: "tenNhiemVuDayDu",
                width: 250,
                render: (_: any, field: any) => (
                  <Form.Item
                    name={[field.name, "tenNhiemVuDayDu"]}
                    rules={[{ required: true, message: "Nhập miêu tả" }]}
                    style={{ margin: 0 }}
                  >
                    <Input.TextArea rows={1} autoSize={{ minRows: 1, maxRows: 3 }} placeholder="Miêu tả công việc" />
                  </Form.Item>
                ),
              },
              {
                title: "Sản phẩm đầu ra",
                dataIndex: "danhSachDauRa",
                width: 250,
                render: (_: any, field: any) => (
                  <Form.List name={[field.name, "danhSachDauRa"]}>
                    {(fields, { add, remove }) => (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {fields.map((subField) => (
                          <div key={subField.key} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <Form.Item
                              {...subField}
                              style={{ margin: 0, flex: 1 }}
                              rules={[{ required: true, message: 'Nhập SP đầu ra' }]}
                            >
                              <Input placeholder="Nhập SP đầu ra" />
                            </Form.Item>
                            {fields.length > 1 && (
                              <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} onClick={() => remove(subField.name)} />
                            )}
                          </div>
                        ))}
                        <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small">
                          Thêm đầu ra
                        </Button>
                      </div>
                    )}
                  </Form.List>
                ),
              },
              {
                title: "Căn cứ chấm theo Bộ tiêu chí",
                dataIndex: "boTieuChiList",
                width: 300,
                align: "center",
                render: (_: any, field: any) => (
                  <Form.List name={[field.name, "boTieuChiList"]}>
                    {(fields, { add, remove }) => (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {fields.map((subField) => (
                          <div key={subField.key} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <Form.Item
                              {...subField}
                              style={{ margin: 0, flex: 1 }}
                            >
                              <Input placeholder="Nhập tiêu chí" />
                            </Form.Item>
                            {fields.length > 1 && (
                              <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} onClick={() => remove(subField.name)} />
                            )}
                          </div>
                        ))}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small" style={{ flex: 1 }}>
                            Thêm
                          </Button>
                          <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            size="small"
                            onClick={() => {
                              setActiveTaskField(field.name);
                              setChonTieuChiVisible(true);
                            }}
                          >
                            Chọn
                          </Button>
                        </div>
                      </div>
                    )}
                  </Form.List>
                ),
              },
              ...(chucVuHeSo !== null && chucVuHeSo !== undefined ? [{
                title: "Điểm theo hệ số lãnh đạo phòng",
                key: "diemHeSo",
                width: 120,
                align: "center",
                render: (_: any, field: any) => (
                  <Form.Item name={[field.name, "diemHeSo"]} style={{ margin: 0 }}>
                    <InputNumber disabled placeholder="-" style={{ textAlign: "center", width: "100%" }} />
                  </Form.Item>
                )
              }] : []),
              {
                title: "Điểm theo Bộ tiêu chí",
                key: "diemBoTieuChi",
                width: 100,
                align: "center",
                render: (_: any, field: any) => (
                  <Form.Item name={[field.name, "diemBoTieuChi"]} style={{ margin: 0 }}>
                    <InputNumber disabled placeholder="-" style={{ textAlign: "center", width: "100%" }} />
                  </Form.Item>
                )
              },
              {
                title: "Chấm điểm số lượng",
                children: [
                  {
                    title: "Hoàn thành",
                    dataIndex: "chamDiemSoLuong_HoanThanh",
                    width: 100,
                    align: "center",
                    render: (_: any, field: any) => (
                      <Form.List name={[field.name, "danhSachDauRa"]}>
                        {(fields) => (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {fields.map((subField) => (
                              <div key={subField.key} style={{ minHeight: '32px' }}>
                                <Form.Item name={[subField.name, "chamDiemSoLuong_HoanThanh"]} style={{ margin: 0 }}>
                                  <InputNumber precision={2} step={0.01} style={{ width: "100%" }} placeholder="HT" onChange={(val) => {
                                    const tasks = form.getFieldValue("tasks") || [];
                                    const baseScore = tasks[field.name]?.danhSachDauRa?.[subField.name]?.diemTheoBoTieuChi || 0;
                                    const maxScore = (chucVuHeSo !== null && chucVuHeSo !== undefined) ? baseScore * chucVuHeSo : baseScore;
                                    const khongHoanThanh = Math.max(0, maxScore - Number(val || 0));
                                    form.setFieldValue(['tasks', field.name, 'danhSachDauRa', subField.name, 'chamDiemSoLuong_KhongHoanThanh'], Number(khongHoanThanh.toFixed(2)));
                                  }} onBlur={() => handleCalculateField(field.name, subField.name, "ChamDiemSoLuong_Diem", "chamDiemSoLuong_Diem")} />
                                </Form.Item>
                              </div>
                            ))}
                            {fields.length > 0 && <div style={{ height: '24px' }}></div>}
                          </div>
                        )}
                      </Form.List>
                    ),
                  },
                  {
                    title: "Không hoàn thành",
                    dataIndex: "chamDiemSoLuong_KhongHoanThanh",
                    width: 100,
                    align: "center",
                    render: (_: any, field: any) => (
                      <Form.List name={[field.name, "danhSachDauRa"]}>
                        {(fields) => (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {fields.map((subField) => (
                              <div key={subField.key} style={{ minHeight: '32px' }}>
                                <Form.Item name={[subField.name, "chamDiemSoLuong_KhongHoanThanh"]} style={{ margin: 0 }}>
                                  <InputNumber precision={2} disabled style={{ width: "100%" }} placeholder="KHT" />
                                </Form.Item>
                              </div>
                            ))}
                            {fields.length > 0 && <div style={{ height: '24px' }}></div>}
                          </div>
                        )}
                      </Form.List>
                    ),
                  },
                  {
                    title: "Điểm (%)",
                    dataIndex: "chamDiemSoLuong_Diem",
                    width: 80,
                    align: "center",
                    render: (_: any, field: any) => (
                      <Form.List name={[field.name, "danhSachDauRa"]}>
                        {(fields) => (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {fields.map((subField) => (
                              <div key={subField.key} style={{ minHeight: '32px' }}>
                                <Form.Item name={[subField.name, "chamDiemSoLuong_Diem"]} style={{ margin: 0 }}>
                                  <InputNumber style={{ width: "100%", textAlign: "center" }} placeholder="-" disabled formatter={formatPercent} />
                                </Form.Item>
                              </div>
                            ))}
                            {fields.length > 0 && <div style={{ height: '24px' }}></div>}
                          </div>
                        )}
                      </Form.List>
                    )
                  }
                ]
              },
              {
                title: () => (
                  <div style={{ textAlign: "center" }}>
                    Chấm điểm chất lượng<br />
                    <span style={{ color: "#ffd666", fontWeight: "normal" }}>(Trừ 25%/lần không đạt)</span>
                  </div>
                ),
                children: [
                  {
                    title: "Số lần không đạt",
                    dataIndex: "chamDiemChatLuong_KhongDat",
                    width: 100,
                    align: "center",
                    render: (_: any, field: any) => (
                      <Form.List name={[field.name, "danhSachDauRa"]}>
                        {(fields) => (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {fields.map((subField) => (
                              <div key={subField.key} style={{ minHeight: '32px' }}>
                                <Form.Item name={[subField.name, "chamDiemChatLuong_KhongDat"]} style={{ margin: 0 }}>
                                  <InputNumber precision={2} step={1} style={{ width: "100%" }} placeholder="Số lần" onChange={(val) => {
                                    const tasks = form.getFieldValue("tasks") || [];
                                    const baseScore = tasks[field.name]?.danhSachDauRa?.[subField.name]?.diemTheoBoTieuChi || 0;
                                    const maxScore = (chucVuHeSo !== null && chucVuHeSo !== undefined) ? baseScore * chucVuHeSo : baseScore;
                                    const conLai = Math.max(0, maxScore - (Number(val || 0) * 0.25 * maxScore));
                                    form.setFieldValue(['tasks', field.name, 'danhSachDauRa', subField.name, 'chamDiemChatLuong_ConLai'], Number(conLai.toFixed(2)));
                                  }} onBlur={() => handleCalculateField(field.name, subField.name, "ChamDiemChatLuong_Diem", "chamDiemChatLuong_Diem")} />
                                </Form.Item>
                              </div>
                            ))}
                            {fields.length > 0 && <div style={{ height: '24px' }}></div>}
                          </div>
                        )}
                      </Form.List>
                    ),
                  },
                  {
                    title: "Số điểm còn lại sau khi trừ",
                    dataIndex: "chamDiemChatLuong_ConLai",
                    width: 100,
                    align: "center",
                    render: (_: any, field: any) => (
                      <Form.List name={[field.name, "danhSachDauRa"]}>
                        {(fields) => (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {fields.map((subField) => (
                              <div key={subField.key} style={{ minHeight: '32px' }}>
                                <Form.Item name={[subField.name, "chamDiemChatLuong_ConLai"]} style={{ margin: 0 }}>
                                  <InputNumber precision={2} disabled style={{ width: "100%", textAlign: "center" }} placeholder="-" />
                                </Form.Item>
                              </div>
                            ))}

                            {fields.length > 0 && <div style={{ height: '24px' }}></div>}
                          </div>
                        )}
                      </Form.List>
                    ),
                  },
                  {
                    title: "Điểm (%)",
                    dataIndex: "chamDiemChatLuong_Diem",
                    width: 80,
                    align: "center",
                    render: (_: any, field: any) => (
                      <Form.List name={[field.name, "danhSachDauRa"]}>
                        {(fields) => (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {fields.map((subField) => (
                              <div key={subField.key} style={{ minHeight: '32px' }}>
                                <Form.Item name={[subField.name, "chamDiemChatLuong_Diem"]} style={{ margin: 0 }}>
                                  <InputNumber precision={2} style={{ width: "100%", textAlign: "center" }} placeholder="-" disabled formatter={formatPercent} />
                                </Form.Item>
                              </div>
                            ))}
                            {fields.length > 0 && <div style={{ height: '24px' }}></div>}
                          </div>
                        )}
                      </Form.List>
                    )
                  }
                ]
              },
              {
                title: () => (
                  <div style={{ textAlign: "center" }}>
                    Chấm điểm tiến độ<br />
                    <span style={{ color: "#ffd666", fontWeight: "normal" }}>(Trừ 25%/lần chậm muộn)</span>
                  </div>
                ),
                children: [
                  {
                    title: "Số lần chậm muộn",
                    dataIndex: "chamDiemTienDo_KhongDat",
                    width: 100,
                    align: "center",
                    render: (_: any, field: any) => (
                      <Form.List name={[field.name, "danhSachDauRa"]}>
                        {(fields) => (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {fields.map((subField) => (
                              <div key={subField.key} style={{ minHeight: '32px' }}>
                                <Form.Item name={[subField.name, "chamDiemTienDo_KhongDat"]} style={{ margin: 0 }}>
                                  <InputNumber precision={2} step={1} style={{ width: "100%" }} placeholder="Số lần" onChange={(val) => {
                                    const tasks = form.getFieldValue("tasks") || [];
                                    const baseScore = tasks[field.name]?.danhSachDauRa?.[subField.name]?.diemTheoBoTieuChi || 0;
                                    const maxScore = (chucVuHeSo !== null && chucVuHeSo !== undefined) ? baseScore * chucVuHeSo : baseScore;
                                    const conLai = Math.max(0, maxScore - (Number(val || 0) * 0.25 * maxScore));
                                    form.setFieldValue(['tasks', field.name, 'danhSachDauRa', subField.name, 'chamDiemTienDo_ConLai'], Number(conLai.toFixed(2)));
                                  }} onBlur={() => handleCalculateField(field.name, subField.name, "ChamDiemTienDo_Diem", "chamDiemTienDo_Diem")} />
                                </Form.Item>
                              </div>
                            ))}
                            {fields.length > 0 && <div style={{ height: '24px' }}></div>}
                          </div>
                        )}
                      </Form.List>
                    ),
                  },
                  {
                    title: "Số điểm còn lại sau khi trừ",
                    dataIndex: "chamDiemTienDo_ConLai",
                    width: 100,
                    align: "center",
                    render: (_: any, field: any) => (
                      <Form.List name={[field.name, "danhSachDauRa"]}>
                        {(fields) => (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {fields.map((subField) => (
                              <div key={subField.key} style={{ minHeight: '32px' }}>
                                <Form.Item name={[subField.name, "chamDiemTienDo_ConLai"]} style={{ margin: 0 }}>
                                  <InputNumber precision={2} disabled style={{ width: "100%", textAlign: "center" }} placeholder="-" />
                                </Form.Item>
                              </div>
                            ))}
                            {fields.length > 0 && <div style={{ height: '24px' }}></div>}
                          </div>
                        )}
                      </Form.List>
                    ),
                  },
                  {
                    title: "Điểm (%)",
                    dataIndex: "chamDiemTienDo_Diem",
                    width: 80,
                    align: "center",
                    render: (_: any, field: any) => (
                      <Form.List name={[field.name, "danhSachDauRa"]}>
                        {(fields) => (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {fields.map((subField) => (
                              <div key={subField.key} style={{ minHeight: '32px' }}>
                                <Form.Item name={[subField.name, "chamDiemTienDo_Diem"]} style={{ margin: 0 }}>
                                  <InputNumber precision={2} style={{ width: "100%", textAlign: "center" }} placeholder="-" disabled formatter={formatPercent} />
                                </Form.Item>
                              </div>
                            ))}
                            {fields.length > 0 && <div style={{ height: '24px' }}></div>}
                          </div>
                        )}
                      </Form.List>
                    )
                  }
                ]
              },
              {
                title: "Ghi chú/Giải trình",
                dataIndex: "ghiChuGiaTrinh",
                width: 150,
                render: (_: any, field: any) => (
                  <Form.List name={[field.name, "danhSachDauRa"]}>
                    {(fields) => (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {fields.map((subField) => (
                          <div key={subField.key} style={{ minHeight: '32px' }}>
                            <Form.Item name={[subField.name, "ghiChuGiaTrinh"]} style={{ margin: 0 }}>
                              <Input placeholder="Ghi chú" />
                            </Form.Item>
                          </div>
                        ))}
                        {fields.length > 0 && <div style={{ height: '24px' }}></div>}
                      </div>
                    )}
                  </Form.List>
                ),
              },
            ];

            if (fields.length > 1) {
              columns.push({
                title: "",
                key: "action",
                width: 50,
                align: "center",
                render: (_: any, field: any) => (
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                ),
              });
            }

            return (
              <>
                <Table
                  dataSource={fields}
                  columns={columns}
                  pagination={false}
                  rowKey="key"
                  bordered
                  scroll={{ x: 'max-content' }}
                  components={{
                    header: {
                      cell: (props: any) => (
                        <th {...props} style={{ ...props.style, textAlign: 'center', background: '#2256c0', color: '#fff', borderBottom: '1px solid #f0f0f0' }}>
                          {props.children}
                        </th>
                      ),
                    },
                  }}
                />
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ marginTop: 16 }}>
                  Thêm nhiệm vụ
                </Button>
              </>
            );
          }}
        </Form.List>
      </Form>

      {chonTieuChiVisible && (
        <ModalChonTieuChi
          visible={chonTieuChiVisible}
          onCancel={() => setChonTieuChiVisible(false)}
          onSelectMultiple={handleSelectTieuChi}
          idDotDanhGia={idDotTheoDoiDanhGia}
          idLyLich={idLyLich}
          donViId={idDonVi}
          initialSelectedNames={
            activeTaskField !== null
              ? form.getFieldValue("tasks")?.[activeTaskField]?.boTieuChiList?.filter((x: string) => !!x) || []
              : []
          }
        />
      )}
    </Modal>
  );
};

export default ModalTaoNhiemVuPhatSinh;
