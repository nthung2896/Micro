import React, { useState, useMemo } from 'react';
import { Modal, Form, Input, Select, Checkbox, Button, List, Typography, Space, message, Tag } from 'antd';
import { BCInputConfigType } from '@/types/bcFormTemplate/dto';
import { UpdateFormInputsRequest } from '@/types/bcFormTemplate/request';
import bcFormTemplateService from '@/services/bcFormTemplate/bcFormTemplate.service';

const { Text } = Typography;

interface FastConfigKeyModalProps {
  visible: boolean;
  onCancel: () => void;
  idBaoCao: string;
  templateId: string;
  idThanhPhan: number;
  htmlContent: string;
  existingInputs: BCInputConfigType[];
  onSuccess: (updatedInputs: BCInputConfigType[]) => void;
}

export default function FastConfigKeyModal({
  visible,
  onCancel,
  idBaoCao,
  templateId,
  idThanhPhan,
  htmlContent,
  existingInputs,
  onSuccess
}: FastConfigKeyModalProps) {
  const [form] = Form.useForm();
  const [keyword, setKeyword] = useState('');
  const [matchedKeys, setMatchedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Parse HTML to extract all [[key]]
  const allKeys = useMemo(() => {
    const keys = new Set<string>();
    const regex = /\[\[(.*?)\]\]/g;
    let match;
    while ((match = regex.exec(htmlContent)) !== null) {
      if (match[1]) {
        keys.add(match[1].trim());
      }
    }
    return Array.from(keys);
  }, [htmlContent]);

  const handleSearch = () => {
    if (!keyword.trim()) {
      message.warning('Vui lòng nhập từ khóa tìm kiếm');
      setMatchedKeys([]);
      return;
    }
    const lowerKeyword = keyword.toLowerCase();
    const matches = allKeys.filter(k => k.toLowerCase().includes(lowerKeyword));
    setMatchedKeys(matches);
  };

  const handleSave = async () => {
    if (matchedKeys.length === 0) {
      message.warning('Không có key nào để cập nhật');
      return;
    }

    try {
      const values = await form.validateFields();
      
      const updatedInputs: BCInputConfigType[] = matchedKeys.map(key => {
        const existing = existingInputs.find(i => i.inputKey === key);
        return {
          inputKey: key,
          displayName: existing?.displayName || key,
          dataType: values.dataType,
          required: values.required || false,
          placeHolder: existing?.placeHolder || '',
          isCombobox: values.isCombobox || false,
          localOptions: existing?.localOptions || [],
          globalCategoryCode: existing?.globalCategoryCode || ''
        };
      });

      setLoading(true);
      const requestData: UpdateFormInputsRequest = {
        id: templateId,
        idBaoCao: idBaoCao,
        idThanhPhan: idThanhPhan,
        inputs: updatedInputs
      };

      const res = await bcFormTemplateService.updateConfigKey(requestData);
      
      if (res.status) {
        message.success(`Đã cập nhật cấu hình cho ${updatedInputs.length} trường`);
        onSuccess(updatedInputs);
        form.resetFields();
        setKeyword('');
        setMatchedKeys([]);
      } else {
        message.error(res.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Cấu hình nhanh nhiều trường (Fast Config)"
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Đóng
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          onClick={handleSave} 
          loading={loading}
          disabled={matchedKeys.length === 0}
        >
          Cập nhật {matchedKeys.length > 0 ? `(${matchedKeys.length} trường)` : ''}
        </Button>
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Tính năng này giúp bạn cập nhật nhanh kiểu dữ liệu cho nhiều trường có tên giống nhau (ví dụ: chứa tiền tố "ck." hoặc "rbn.").
        </Text>
      </div>

      <Space.Compact style={{ width: '100%', marginBottom: 24 }}>
        <Input 
          placeholder="Nhập từ khóa cần tìm (VD: ck. hoặc rbn.)" 
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
        />
        <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
      </Space.Compact>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          dataType: 'TEXT',
          required: false,
          isCombobox: false
        }}
      >
        <Form.Item
          name="dataType"
          label="Kiểu dữ liệu áp dụng"
          rules={[{ required: true, message: 'Vui lòng chọn kiểu dữ liệu' }]}
        >
          <Select>
            <Select.Option value="TEXT">Văn bản (Text)</Select.Option>
            <Select.Option value="NUMBER">Số (Number)</Select.Option>
            <Select.Option value="DATE">Ngày tháng (Date)</Select.Option>
            <Select.Option value="TEXTAREA">Văn bản dài (TextArea)</Select.Option>
            <Select.Option value="CHECKBOX">Hộp kiểm (Checkbox)</Select.Option>
            <Select.Option value="RADIO">Nút chọn (Radio)</Select.Option>
            <Select.Option value="FILE">File đính kèm</Select.Option>
          </Select>
        </Form.Item>

        <Space size="large">
          <Form.Item name="required" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Checkbox>Bắt buộc nhập</Checkbox>
          </Form.Item>
        </Space>
      </Form>

      {matchedKeys.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Text strong>Danh sách các trường sẽ được cập nhật ({matchedKeys.length}):</Text>
          <div style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto', padding: 8, background: '#f5f5f5', borderRadius: 6 }}>
            <Space wrap size={[0, 8]}>
              {matchedKeys.map(key => (
                <Tag color="blue" key={key}>{key}</Tag>
              ))}
            </Space>
          </div>
        </div>
      )}
    </Modal>
  );
}
