"use client";

import Flex from "@/components/shared-components/Flex";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  SettingOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  message,
  Modal,
  Form,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  Badge,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import bcFormTemplateService from "@/services/bcFormTemplate/bcFormTemplate.service";
import {
  BCFormTemplateType,
  BCThanhPhanFormType,
  BCInputConfigType,
} from "@/types/bcFormTemplate/dto";
import HtmlTemplatePreview from "../../../components/HtmlTemplatePreview";
import HtmlFormRenderer from "../../../components/HtmlFormRenderer";
import InputConfigModal from "../../../components/InputConfigModal";
import FastConfigKeyModal from "../../../components/FastConfigKeyModal";

const { Title, Text } = Typography;

interface PageProps {
  params: {
    id: string;
    templateId: string;
  };
}

const TemplateConfigPage: React.FC<PageProps> = ({ params }) => {
  const { id: baoCaoId, templateId } = params;
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const loading = useSelector((state) => state.general.isLoading);

  const [templateData, setTemplateData] = useState<BCFormTemplateType | null>(
    null
  );
  const [localForms, setLocalForms] = useState<BCThanhPhanFormType[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  const [modalState, setModalState] = useState<{
    visible: boolean;
    idThanhPhan: number | null;
    input: BCInputConfigType | null;
  }>({ visible: false, idThanhPhan: null, input: null });

  const [fastConfigModalState, setFastConfigModalState] = useState<{
    visible: boolean;
    idThanhPhan: number | null;
  }>({ visible: false, idThanhPhan: null });

  /** Fetch template data */
  const fetchTemplate = useCallback(async () => {
    if (!templateId) return;
    dispatch(setIsLoading(true));
    try {
      const res = await bcFormTemplateService.get(templateId);
      if (res?.data) {
        setTemplateData(res.data);
        setLocalForms(
          (res.data.thanhPhanForms || []).map((f) => ({
            ...f,
            inputs: f.inputs || [],
          }))
        );
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Lỗi tải template:", error);
      message.error("Không thể tải thông tin template");
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [templateId, dispatch]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  /** Open config modal */
  const handleOpenConfig = (idThanhPhan: number, key: string) => {
    const formPart = localForms.find((f) => f.idThanhPhan === idThanhPhan);
    const existingInput = formPart?.inputs?.find((i) => i.inputKey === key);

    setModalState({
      visible: true,
      idThanhPhan,
      input: existingInput ||
        ({
          inputKey: key,
          displayName: key,
          dataType: key.startsWith("ck.")
            ? "CHECKBOX"
            : key.startsWith("rbn.")
            ? "RADIO"
            : "TEXT",
          required: false,
          isCombobox: false,
        } as BCInputConfigType),
    });
  };

  /** Save config from modal */
  const handleSaveConfig = async (
    inputKey: string,
    updatedValues: Partial<BCInputConfigType>
  ) => {
    if (modalState.idThanhPhan === null) return;
    const currentIdThanhPhan = modalState.idThanhPhan;

    setLocalForms((prev) =>
      prev.map((f) => {
        if (f.idThanhPhan === currentIdThanhPhan) {
          const currentInputs = f.inputs || [];
          const exists = currentInputs.some((i) => i.inputKey === inputKey);

          let newInputs;
          if (exists) {
            newInputs = currentInputs.map((i) =>
              i.inputKey === inputKey ? { ...i, ...updatedValues } : i
            );
          } else {
            newInputs = [
              ...currentInputs,
              { inputKey, ...updatedValues } as BCInputConfigType,
            ];
          }
          return { ...f, inputs: newInputs };
        }
        return f;
      })
    );
    setHasChanges(true);
    setModalState({ visible: false, idThanhPhan: null, input: null });

    // Immediate save via API if it is a Combobox
    if (updatedValues.isCombobox && templateData?.id) {
      try {
        await bcFormTemplateService.updateDropdownInput({
          id: templateData.id,
          idThanhPhan: currentIdThanhPhan,
          inputKey: inputKey,
          displayName: updatedValues.displayName || inputKey,
          dataType: updatedValues.dataType || "TEXT",
          required: updatedValues.required || false,
          placeHolder: updatedValues.placeHolder || "",
          isCombobox: true,
          localOptions: updatedValues.localOptions || [],
          globalCategoryCode: updatedValues.globalCategoryCode || null,
        });
      } catch (error) {
        console.error("Lỗi cập nhật dropdown config:", error);
      }
    }
  };

  /** Save configuration to server */
  const handleSave = async () => {
    if (!templateData?.id || !baoCaoId) return;
    setSaving(true);
    try {
      // Gửi từng phần cấu hình lên API Config-Key do API tổng không tồn tại
      const promises = localForms.map((f) =>
        bcFormTemplateService.updateConfigKey({
          id: templateData.id,
          idBaoCao: baoCaoId,
          idThanhPhan: f.idThanhPhan,
          inputs: f.inputs || [],
        })
      );
      
      const results = await Promise.all(promises);
      const allSuccess = results.every((res) => res.status);

      if (allSuccess) {
        message.success("Lưu cấu hình thành công!");
        setHasChanges(false);
        fetchTemplate();
      } else {
        message.error("Lưu cấu hình có lỗi xảy ra ở một số thành phần");
      }
    } catch (error) {
      console.error("Lỗi lưu cấu hình:", error);
      message.error("Có lỗi xảy ra khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  /** Render đối tượng tags */
  const renderDoiTuongTags = (types?: string[]) => {
    if (!types || types.length === 0) return <Text type="secondary">-</Text>;
    const labelMap: Record<string, { color: string; label: string }> = {
      DOANH_NGHIEP: { color: "geekblue", label: "Doanh nghiệp" },
      HTX: { color: "purple", label: "Hợp tác xã" },
      HO_KINH_DOANH: { color: "cyan", label: "Hộ kinh doanh" },
    };
    return (
      <Space wrap size={[4, 4]}>
        {types.map((t) => {
          const info = labelMap[t] || { color: "blue", label: t };
          return (
            <Tag color={info.color} key={t}>
              {info.label}
            </Tag>
          );
        })}
      </Space>
    );
  };

  return (
    <>
      <style jsx global>{`
      .docx-page-wrapper {
        max-width: none !important;
        width: 100% !important;
      }
    `}</style>
      {/* Header */}
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ marginBottom: 16, flexWrap: "wrap", gap: 8 }}
      >
        <AutoBreadcrumb />
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(`/cauHinhBieuMau/${baoCaoId}`)}
          >
            Quay lại
          </Button>
          <Button
            type="dashed"
            icon={<EyeOutlined />}
            onClick={() => setPreviewModalVisible(true)}
          >
            Xem thử form
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            disabled={!hasChanges}
          >
            Lưu cấu hình
          </Button>
        </Space>
      </Flex>

      {/* Template info card */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space direction="vertical" size={2} style={{ width: "100%" }}>
              <Space align="center">
                <SettingOutlined style={{ fontSize: 18, color: "#0355a2" }} />
                <Title level={4} style={{ margin: 0 }}>
                  Cấu hình biểu mẫu
                </Title>
                {hasChanges && (
                  <Tag color="warning" style={{ marginLeft: 8 }}>
                    Chưa lưu
                  </Tag>
                )}
              </Space>
              {templateData && (
                <div style={{ marginTop: 4 }}>
                  <Text strong style={{ fontSize: 15 }}>
                    {templateData.name}
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    {renderDoiTuongTags(templateData.doiTuongTypes)}
                    <Tag
                      style={{ marginLeft: 8 }}
                      color={
                        templateData.huongTrang === "PORTRAIT" ? "blue" : "green"
                      }
                    >
                      {templateData.huongTrang === "PORTRAIT"
                        ? "Trang dọc"
                        : "Trang ngang"}
                    </Tag>
                  </div>
                </div>
              )}
            </Space>
          </Col>
          <Col>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {localForms.length} thành phần ·{" "}
              {localForms.reduce((sum, f) => sum + (f.inputs?.length || 0), 0)}{" "}
              inputs đã lưu
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Main content */}
      <Spin spinning={loading}>
        {localForms.length === 0 && !loading ? (
          <Card>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <FileTextOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <div>
                <Text type="secondary">
                  Template này chưa có thành phần form nào
                </Text>
              </div>
            </div>
          </Card>
        ) : (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {localForms.map((formPart) => (
              <Card 
                key={String(formPart.idThanhPhan)} 
                title={
                  <Space>
                    <AppstoreOutlined style={{ color: "#0355a2" }} />
                    <Text strong>{formPart.name}</Text>
                    <Badge
                      count={formPart.inputs?.length || 0}
                      style={{ backgroundColor: "#0355a2" }}
                      overflowCount={999}
                      title={`${formPart.inputs?.length || 0} inputs đã lưu`}
                    />
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: "normal" }}>
                      (Click vào các trường có icon bút chì để cấu hình)
                    </Text>
                    <Button 
                       
                      type="primary" 
                      ghost
                      icon={<SettingOutlined />}
                      onClick={() => setFastConfigModalState({ visible: true, idThanhPhan: formPart.idThanhPhan })}
                    >
                      Cấu hình nhanh (Fast Config)
                    </Button>
                  </Space>
                }
                headStyle={{ backgroundColor: "#fafafa" }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ background: "#fff", borderRadius: 8 }}>
                  <HtmlTemplatePreview
                    htmlContent={formPart.htmlContent || ""}
                    inputs={formPart.inputs || []}
                    onClickPlaceholder={(key) =>
                      handleOpenConfig(formPart.idThanhPhan, key)
                    }
                  />
                </div>
              </Card>
            ))}
          </Space>
        )}
      </Spin>

      {/* Sticky Bottom Actions */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "#fff",
          padding: "16px 24px",
          margin: "16px -24px -24px -24px",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
          borderTop: "1px solid #f0f0f0",
          zIndex: 99,
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push(`/cauHinhBieuMau/${baoCaoId}`)}
        >
          Quay lại
        </Button>
        <Button
          type="dashed"   
          icon={<EyeOutlined />}
          onClick={() => setPreviewModalVisible(true)}
        >
          Xem thử form
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
          disabled={!hasChanges}
        >
          Lưu cấu hình
        </Button>
      </div>

      {/* Config Modal */}
      <InputConfigModal
        visible={modalState.visible}
        input={modalState.input}
        onCancel={() =>
          setModalState({ visible: false, idThanhPhan: null, input: null })
        }
        onSave={handleSaveConfig}
      />

      {/* Fast Config Modal */}
      {fastConfigModalState.visible && fastConfigModalState.idThanhPhan !== null && (
        <FastConfigKeyModal
          visible={fastConfigModalState.visible}
          onCancel={() => setFastConfigModalState({ visible: false, idThanhPhan: null })}
          idBaoCao={baoCaoId}
          templateId={templateId}
          idThanhPhan={fastConfigModalState.idThanhPhan}
          htmlContent={localForms.find(f => f.idThanhPhan === fastConfigModalState.idThanhPhan)?.htmlContent || ''}
          existingInputs={localForms.find(f => f.idThanhPhan === fastConfigModalState.idThanhPhan)?.inputs || []}
          onSuccess={(updatedInputs) => {
            // Update local state without losing other unsaved changes
            setLocalForms(prev => prev.map(f => {
              if (f.idThanhPhan === fastConfigModalState.idThanhPhan) {
                const currentInputs = [...(f.inputs || [])];
                updatedInputs.forEach(upd => {
                  const idx = currentInputs.findIndex(i => i.inputKey === upd.inputKey);
                  if (idx >= 0) {
                    currentInputs[idx] = upd;
                  } else {
                    currentInputs.push(upd);
                  }
                });
                return { ...f, inputs: currentInputs };
              }
              return f;
            }));
            setFastConfigModalState({ visible: false, idThanhPhan: null });
            fetchTemplate(); // We fetchTemplate to sync other potential changes or just let the user see the updated DB state.
          }}
        />
      )}

      {/* End-User Preview Modal */}
      <Modal
        title="Xem thử form (Giao diện người dùng cuối)"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={null}
        width={"90%"}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
            console.log("Form values:", values);
            message.success("Lưu thành công! (Dữ liệu đã được log ra console)");
          }}
        >
          <Space direction="vertical" style={{ width: "100%", marginTop: 16 }}>
            {localForms.map((formPart) => (
              <Card
                key={"preview-" + formPart.idThanhPhan}
                title={<Text strong>{formPart.name}</Text>}
                headStyle={{ backgroundColor: "#fafafa" }}
                style={{ width: "100%" }}
              >
                <HtmlFormRenderer
                  htmlContent={formPart.htmlContent || ""}
                  inputs={formPart.inputs || []}
                />
              </Card>
            ))}
            <Flex justifyContent="flex-end">
              <Button onClick={() => setPreviewModalVisible(false)} style={{ marginRight: 8 }}>
                Đóng
              </Button>
              <Button type="primary" htmlType="submit">
                Hoàn thành / Lưu dữ liệu
              </Button>
            </Flex>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default withAuthorization(TemplateConfigPage, "");
