import { AuthenticationContractType } from "@/types/authenticationContract/dto";
import { DropdownOption } from "@/types/general";
import { Card, Col, Form, Input, InputNumber, Row, Select } from "antd";
import { FormInstance } from "antd/es/form";
import { useEffect } from "react";
import { ContractFormValues } from "../createOrUpdate.types";

interface CommonInfoStepProps {
  form: FormInstance<ContractFormValues>;
  data?: AuthenticationContractType | null;
  iSPOptions: DropdownOption[];
  linhVucOptions: DropdownOption[];
  ngonNguOptions: DropdownOption[];
  requiredMessage: string;
}

const CommonInfoStep: React.FC<CommonInfoStepProps> = ({
  form,
  data,
  iSPOptions,
  linhVucOptions,
  ngonNguOptions,
  requiredMessage,
}) => {
  const selectedHosting = Form.useWatch("iSPId", form);
  const selectedLinhVuc = Form.useWatch("linhVucCungCapDichVuCodes", form) || [];

  const isOtherOption = (value?: string) => {
    if (!value) return false;

    const option = [...iSPOptions, ...linhVucOptions].find(
      (item) => item.value === value,
    );
    const normalizedValue = value.toLowerCase();
    const normalizedLabel = (option?.label || "").toLowerCase();

    return (
      normalizedValue.includes("other") ||
      normalizedValue.includes("khac") ||
      normalizedValue.includes("khác") ||
      normalizedLabel.includes("other") ||
      normalizedLabel.includes("khac") ||
      normalizedLabel.includes("khác")
    );
  };

  const showHostingOther = isOtherOption(selectedHosting);
  const showLinhVucOther = selectedLinhVuc.some((value) =>
    isOtherOption(value),
  );

  useEffect(() => {
    if (!showHostingOther) {
      form.setFieldValue("iSPidKhac", undefined);
    }
  }, [form, showHostingOther]);

  useEffect(() => {
    if (!showLinhVucOther) {
      form.setFieldValue("linhVucCungCapKhac", undefined);
    }
  }, [form, showLinhVucOther]);

  return (
    <Card title="3. Phần chung" size="small">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item<ContractFormValues>
            name="chuSoHuu"
            label="Chủ sở hữu tên miền"
            rules={[{ required: true, message: requiredMessage }]}
          >
            <Input placeholder="Nhập chủ sở hữu tên miền" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item<ContractFormValues>
            name="ngonNgu"
            label="Ngôn ngữ"
            rules={[{ required: true, message: requiredMessage }]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Chọn ngôn ngữ"
              options={ngonNguOptions}
              optionFilterProp="label"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item<ContractFormValues>
            name="iSPId"
            label="Đơn vị cung cấp hosting"
            rules={[{ required: true, message: requiredMessage }]}
          >
            <Select
              showSearch
              placeholder="Chọn đơn vị cung cấp hosting"
              options={iSPOptions}
              optionFilterProp="label"
            />
          </Form.Item>
        </Col>
        {showHostingOther && (
          <Col span={12}>
            <Form.Item<ContractFormValues>
              name="iSPidKhac"
              label="Nhà cung cấp khác"
              rules={[{ required: true, message: requiredMessage }]}
            >
              <Input placeholder="Nhập nhà cung cấp khác" />
            </Form.Item>
          </Col>
        )}
        <Col span={12}>
          <Form.Item<ContractFormValues>
            name="staffNumber"
            label="Số lượng nhân sự vận hành"
            rules={[{ required: true, message: requiredMessage }]}
          >
            <InputNumber min={1} precision={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item<ContractFormValues>
            name="linhVucCungCapDichVuCodes"
            label="Lĩnh vực cung cấp dịch vụ"
            rules={[{ required: true, message: "Vui lòng chọn lĩnh vực" }]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Chọn một hoặc nhiều lĩnh vực"
              options={linhVucOptions}
              optionFilterProp="label"
            />
          </Form.Item>
        </Col>
        {showLinhVucOther && (
          <Col span={24}>
            <Form.Item<ContractFormValues>
              name="linhVucCungCapKhac"
              label="Lĩnh vực cung cấp khác"
              rules={[{ required: true, message: requiredMessage }]}
            >
              <Input.TextArea rows={2} placeholder="Mô tả lĩnh vực khác" />
            </Form.Item>
          </Col>
        )}
        {data?.id && (
          <Col span={24}>
            <Form.Item<ContractFormValues>
              name="lyDoDeNghiCapNhat"
              label="Lý do đề nghị cập nhật"
            >
              <Input.TextArea rows={3} placeholder="Nhập lý do cập nhật hồ sơ" />
            </Form.Item>
          </Col>
        )}
        <Col span={24}>
          <Form.Item<ContractFormValues> name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú nếu có" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default CommonInfoStep;
