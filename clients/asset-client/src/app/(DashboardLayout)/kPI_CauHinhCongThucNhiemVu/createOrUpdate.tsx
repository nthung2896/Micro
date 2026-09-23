import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Modal, Button } from "antd";
import { toast } from "react-toastify";
import {
  KPI_CauHinhCongThucNhiemVuCreateOrUpdateType,
  KPI_CauHinhCongThucNhiemVuType,
} from "@/types/kPI_CauHinhCongThucNhiemVu/kPI_CauHinhCongThucNhiemVu";
import * as extensions from "@/utils/extensions";
import kPI_CauHinhCongThucNhiemVuService from "@/services/kPI_CauHinhCongThucNhiemVu/kPI_CauHinhCongThucNhiemVuService";
import departmentService from "@/services/department/department.service";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";

interface Props {
  item?: KPI_CauHinhCongThucNhiemVuType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const FormulaBuilder: React.FC<{ value?: string; onChange?: (val: string) => void; columnOptions: { label: string; value: string }[] }> = ({ value, onChange, columnOptions }) => {
  const [tokens, setTokens] = React.useState<string[]>(value ? value.split(' ').filter(x => x) : []);
  const [numInput, setNumInput] = React.useState<string>('');

  React.useEffect(() => {
    if (value) {
      setTokens(value.split(' ').filter(x => x));
    } else {
      setTokens([]);
    }
  }, [value]);

  const addToken = (token: string) => {
    if (!token) return;
    const newTokens = [...tokens, token];
    setTokens(newTokens);
    if (onChange) onChange(newTokens.join(' '));
  }

  const removeLast = () => {
    const newTokens = tokens.slice(0, -1);
    setTokens(newTokens);
    if (onChange) onChange(newTokens.join(' '));
  }
  
  const clear = () => {
    setTokens([]);
    if (onChange) onChange('');
  }

  return (
    <div style={{ border: '1px solid #d9d9d9', padding: '12px', borderRadius: '6px', background: '#fafafa' }}>
      <div style={{ 
        minHeight: '40px', 
        background: '#fff', 
        border: '1px solid #d9d9d9', 
        borderRadius: '4px', 
        padding: '8px',
        marginBottom: '12px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        alignItems: 'center'
      }}>
        {tokens.length === 0 ? (
          <span style={{ color: '#bfbfbf' }}>Chưa có công thức</span>
        ) : (
          tokens.map((t, idx) => (
            <span key={idx} style={{ background: '#e6f7ff', border: '1px solid #91d5ff', padding: '2px 8px', borderRadius: '4px', color: '#096dd9' }}>{t}</span>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <Select 
          placeholder="Chọn cột" 
          options={columnOptions} 
          style={{ minWidth: 300, flex: 1 }} 
          onChange={(val) => { if (val) addToken(val); }}
          value={undefined}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
          }
        />
        <div style={{ display: 'flex' }}>
          <Input 
            placeholder="Nhập số" 
            value={numInput} 
            onChange={e => setNumInput(e.target.value)} 
            style={{ width: 150, borderRight: 'none', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            onPressEnter={(e) => {
               e.preventDefault();
               if (numInput) {
                 addToken(numInput);
                 setNumInput('');
               }
            }}
          />
          <Button 
            type="primary" 
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            onClick={() => {
              if (numInput) {
                addToken(numInput);
                setNumInput('');
              }
            }}
          >
            Thêm
          </Button>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button onClick={() => addToken('+')}>+</Button>
        <Button onClick={() => addToken('-')}>-</Button>
        <Button onClick={() => addToken('*')}>*</Button>
        <Button onClick={() => addToken('/')}>/</Button>
        <Button onClick={() => addToken('^')}>^</Button>
        <Button onClick={() => addToken('(')}>(</Button>
        <Button onClick={() => addToken(')')}>)</Button>
        
        <Button danger onClick={removeLast} style={{ marginLeft: 'auto' }}>Xóa lùi</Button>
        <Button danger onClick={clear}>Xóa hết</Button>
      </div>
    </div>
  )
}

const KPI_CauHinhCongThucNhiemVuCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_CauHinhCongThucNhiemVuCreateOrUpdateType>();
  const [donViOptions, setDonViOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [dotDanhGiaOptions, setDotDanhGiaOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [tableOptions, setTableOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [columnOptions, setColumnOptions] = React.useState<{ label: string; value: string }[]>([]);

  const handleOnFinish: FormProps<KPI_CauHinhCongThucNhiemVuCreateOrUpdateType>["onFinish"] =
    async (formData: KPI_CauHinhCongThucNhiemVuCreateOrUpdateType) => {
      try {
        if (props.item) {
          console.log(props);
          const response = await kPI_CauHinhCongThucNhiemVuService.update(formData);
          if (response.status) {
            toast.success("Chỉnh sửa thành công");
            form.resetFields();
            props.onSuccess();
            props.onClose();
          } else {
            toast.error(response.message);
          }
        } else {
          const response = await kPI_CauHinhCongThucNhiemVuService.create(formData);
          if (response.status) {
            toast.success("Thêm mới thành công");
            form.resetFields();
            props.onSuccess();
            props.onClose();
          } else {
            toast.error(response.message);
          }
        }
      } catch (err: any) {
        toast.error("Đã có lỗi xảy ra");
      }
    };

  const handleCancel = () => {
    form.resetFields();
    props.onClose();
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [donViRes, dotDanhGiaRes, tablesRes] = await Promise.all([
          departmentService.getDropdownTrucThuocBTC(),
          kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown(),
          kPI_CauHinhCongThucNhiemVuService.getKpiTables()
        ]);
        
        if (donViRes.status) {
          setDonViOptions(donViRes.data || []);
        }
        
        if (dotDanhGiaRes) {
          setDotDanhGiaOptions(dotDanhGiaRes as any);
        }

        if (tablesRes.status && tablesRes.data) {
          const tables = tablesRes.data.map(t => ({ label: t, value: t }));
          setTableOptions(tables);
        }
      } catch (error) {
        console.error("Failed to load options", error);
      }
    };
    
    fetchData();

    if (props.item) {
      form.setFieldsValue({
        ...props.item,
      });
      if (props.item.targetTable) {
        kPI_CauHinhCongThucNhiemVuService.getKpiColumns(props.item.targetTable).then(res => {
          if (res.status && res.data) {
            setColumnOptions(res.data.map((c: any) => {
              if (typeof c === 'string') return { label: c, value: c };
              return { label: c.label || c.Label || c.value || c.Value, value: c.value || c.Value };
            }));
          }
        });
      }
    }
  }, [form, props.item]);

  return (
    <Modal
      title={
        props.item != null
          ? "Chỉnh sửa cấu hình công thức"
          : "Thêm mới cấu hình công thức"
      }
      open={true}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Xác nhận"
      cancelText="Đóng"
      width={900}
    >
      <Form
        layout="vertical"
        form={form}
        name="formCreateUpdate"
        style={{ maxWidth: 1000 }}
        onFinish={handleOnFinish}
        autoComplete="off"
      >
        {props.item && (
          <Form.Item<KPI_CauHinhCongThucNhiemVuCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            <Form.Item<KPI_CauHinhCongThucNhiemVuCreateOrUpdateType>
              label="Đơn vị"
              name="idDonVi"
            >
              <Select 
                placeholder="Chọn đơn vị" 
                options={donViOptions} 
                showSearch 
                allowClear
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item<KPI_CauHinhCongThucNhiemVuCreateOrUpdateType>
              label="Đợt đánh giá"
              name="idDotDanhGia"
            >
              <Select 
                placeholder="Chọn đợt đánh giá" 
                options={dotDanhGiaOptions} 
                showSearch 
                allowClear
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item<KPI_CauHinhCongThucNhiemVuCreateOrUpdateType>
              label="Bảng đích"
              name="targetTable"
              rules={[
                { required: true, message: "Vui lòng nhập thông tin này!" },
              ]}
            >
              <Select 
                placeholder="Chọn bảng đích" 
                options={tableOptions} 
                showSearch 
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value) => {
                  form.setFieldValue("targetColumn", undefined);
                  if (value) {
                    kPI_CauHinhCongThucNhiemVuService.getKpiColumns(value).then(res => {
                      if (res.status && res.data) {
                        setColumnOptions(res.data.map((c: any) => {
                          if (typeof c === 'string') return { label: c, value: c };
                          return { label: c.label || c.Label || c.value || c.Value, value: c.value || c.Value };
                        }));
                      }
                    });
                  } else {
                    setColumnOptions([]);
                  }
                }}
              />
            </Form.Item>
            <Form.Item<KPI_CauHinhCongThucNhiemVuCreateOrUpdateType>
              label="Cột đích"
              name="targetColumn"
              rules={[
                { required: true, message: "Vui lòng nhập thông tin này!" },
              ]}
            >
              <Select placeholder="Chọn cột đích" options={columnOptions} showSearch />
            </Form.Item>
            <Form.Item<KPI_CauHinhCongThucNhiemVuCreateOrUpdateType>
              label="Công thức"
              name="fomula"
              rules={[
                { required: true, message: "Vui lòng nhập thông tin này!" },
              ]}
            >
              <FormulaBuilder columnOptions={columnOptions} />
            </Form.Item>
          </>
        }
      </Form>
    </Modal>
  );
};
export default KPI_CauHinhCongThucNhiemVuCreateOrUpdate;
