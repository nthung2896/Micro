import UploadImage from "@/components/upload-file/UploadImage";
import { DropdownOption } from "@/types/general";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
} from "antd";
import { FormInstance } from "antd/es/form";
import { ContractFormValues } from "../createOrUpdate.types";
import { v4 as uuidv4 } from "uuid";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import { useState, useEffect } from "react";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
interface PlatformInfoStepProps {
  form: FormInstance<ContractFormValues>;
  osOptions: DropdownOption[];
  requiredMessage: string;
  contractId?: string;
}

interface LogoUploaderProps {
  value?: string;
  onChange?: (value: string | null) => void;
  category: string;
  itemId: string;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({
  value,
  onChange,
  category,
  itemId,
}) => {
  const [file, setFile] = useState<TaiLieuDinhKemType | null>(null);

  const handleFileChange = (f: TaiLieuDinhKemType | null) => {
    setFile(f);
    if (f && !value) {
      onChange?.(f.duongDanFile);
    }
  };

  const handleUploadSuccess = (uploaded: TaiLieuDinhKemType) => {
    setFile(uploaded);
    onChange?.(uploaded.duongDanFile);
  };

  const handleDeleteSuccess = () => {
    setFile(null);
    onChange?.(null);
  };

  useEffect(() => {
    if (!value) {
      setFile(null);
    }
  }, [value]);

  return (
    <SingleFileUploader
      value={file}
      onChange={handleFileChange}
      category={category}
      itemId={itemId}
      onUploadSuccess={handleUploadSuccess}
      onDeleteSuccess={handleDeleteSuccess}
      accept="image/*"
    />
  );
};

const PlatformInfoStep: React.FC<PlatformInfoStepProps> = ({
  form,
  osOptions,
  requiredMessage,
  contractId,
}) => {
  const selectedPlatformType = Form.useWatch("platformType", form) || "website";
  const showWebsite =
    selectedPlatformType === "website" || selectedPlatformType === "both";
  const showApp =
    selectedPlatformType === "app" || selectedPlatformType === "both";
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card title="2.1 Chọn loại nền tảng" size="small">
        <Form.Item<ContractFormValues>
          name="platformType"
          label="Loại nền tảng"
          rules={[{ required: true, message: "Vui lòng chọn loại nền tảng" }]}
        >
          <Radio.Group>
            <Radio value="website">Website</Radio>
            <Radio value="app">Ứng dụng</Radio>
            <Radio value="both">Cả hai</Radio>
          </Radio.Group>
        </Form.Item>
      </Card>

      {showWebsite && (
        <Card title="2.2 Thông tin Website" size="small">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item<ContractFormValues>
                name="name"
                label="Tên nền tảng / website"
                rules={[{ required: true, message: requiredMessage }]}
              >
                <Input placeholder="Nhập tên nền tảng/website" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<ContractFormValues>
                name="domain"
                label="Tên miền chính"
                rules={[
                  { required: true, message: requiredMessage },
                  { type: "url", message: "Tên miền phải có dạng URL hợp lệ" },
                ]}
              >
                <Input placeholder="https://example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<ContractFormValues>
                name="domainAdd"
                label="Tên miền bổ sung"
                rules={[
                  {
                    type: "url",
                    message: "Tên miền bổ sung phải có dạng URL hợp lệ",
                  },
                ]}
              >
                <Input placeholder="https://sub.example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<ContractFormValues>
                name="logo"
                label="Logo website"
                rules={[{ required: true, message: requiredMessage }]}
              >
                <LogoUploader
                  category={FileCategoryConstant.Avatar}
                  itemId={contractId || ""}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      )}

      {showApp && (
        <Card title="2.3 Thông tin Ứng dụng" size="small">
          {!showWebsite && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item<ContractFormValues>
                  name="name"
                  label="Tên nền tảng / ứng dụng"
                  rules={[{ required: true, message: requiredMessage }]}
                >
                  <Input placeholder="Nhập tên nền tảng/ứng dụng" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<ContractFormValues>
                  name="logo"
                  label="Logo nền tảng"
                  rules={[{ required: true, message: requiredMessage }]}
                >
                  <LogoUploader
                    category={FileCategoryConstant.Avatar}
                    itemId={contractId || ""}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.List name="appContractRequests">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    size="small"
                    title={`Ứng dụng ${index + 1}`}
                    extra={
                      fields.length > 1 && (
                        <Button
                          danger
                          type="link"
                          onClick={() => remove(field.name)}
                        >
                          Xóa
                        </Button>
                      )
                    }
                    style={{ marginBottom: 12 }}
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          name={[field.name, "appName"]}
                          label="Tên ứng dụng"
                          rules={[{ required: true, message: requiredMessage }]}
                        >
                          <Input placeholder="Nhập tên ứng dụng" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          name={[field.name, "osCode"]}
                          label="Hệ điều hành"
                          rules={[{ required: true, message: requiredMessage }]}
                        >
                          <Select
                            showSearch
                            placeholder="Chọn hệ điều hành"
                            options={osOptions}
                            optionFilterProp="label"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          name={[field.name, "appLink"]}
                          label="Link ứng dụng"
                          rules={[
                            { required: true, message: requiredMessage },
                            {
                              type: "url",
                              message: "Link ứng dụng không hợp lệ",
                            },
                          ]}
                        >
                          <Input placeholder="https://..." />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          {...field}
                          name={[field.name, "logo"]}
                          label="Logo ứng dụng"
                          rules={[{ required: true, message: requiredMessage }]}
                        >
                          <LogoUploader
                            category={FileCategoryConstant.Avatar}
                            itemId={form.getFieldValue(["appContractRequests", field.name, "id"])}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  block
                  onClick={() =>
                    add({
                      id: uuidv4(),
                      contractId: contractId || "",
                      appName: "",
                      osCode: "",
                      appLink: "",
                      logo: "",
                    })
                  }
                >
                  Thêm ứng dụng
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      )}
    </Space>
  );
};

export default PlatformInfoStep;
