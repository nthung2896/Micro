"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, Form, message, Spin, Space, Typography } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import bcSubmissionService from "@/services/bcSubmission/bcSubmission.service";
import bcFormTemplateService from "@/services/bcFormTemplate/bcFormTemplate.service";
import HtmlFormRenderer from "@/app/(DashboardLayout)/cauHinhBieuMau/components/HtmlFormRenderer";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";

const { Title, Text } = Typography;

interface PageProps {
  params: {
    id: string; // IdDotBaoCao
    templateId: string; // Id của form template
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

const ReportSubmissionPage: React.FC<PageProps> = ({
  params,
  searchParams,
}) => {
  const router = useRouter();
  const assignmentId = searchParams?.assignmentId as string | undefined;
  const dispatch = useDispatch<AppDispatch>();
  const { id, templateId } = params;

  const loading = useSelector((state) => state.general.isLoading);
  const [templateData, setTemplateData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [form] = Form.useForm();

  const fetchTemplate = useCallback(async () => {
    if (!templateId) return;
    dispatch(setIsLoading(true));
    try {
      const response = await bcFormTemplateService.get(templateId);
      if (response?.data) {
        setTemplateData(response.data);
      } else {
        message.warning(
          "Không thể tải cấu trúc biểu mẫu báo cáo. Vui lòng thử lại sau.",
        );
      }

      // Fetch draft data
      if (assignmentId) {
        // Dùng API mới GetSubmission
        const draftRes = await bcSubmissionService.getSubmission(
          assignmentId,
          templateId,
        );

        // DataResponse<BCSubmissionData> -> draftRes.data.data là object BCSubmissionData
        const draftData = draftRes?.data?.data || draftRes?.data;

        if (draftData && draftData.dataValues) {
          const formValues: Record<string, any> = {};
          draftData.dataValues.forEach((item: any) => {
            if (item.colKey) {
              let val: any = item.value;
              if (val === "true") val = true;
              else if (val === "false") val = false;
              formValues[item.colKey] = val;
            }
          });
          form.setFieldsValue(formValues);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải biểu mẫu báo cáo:", error);
      message.error("Lỗi khi tải thông tin báo cáo");
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [templateId, assignmentId, dispatch, form]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const formatSubmitData = (values: any, status: string) => {
    const submittedValues = Object.keys(values || {}).map((key) => ({
      Type: "FLAT",
      ColKey: key,
      Value: values[key]?.toString() || "",
    }));

    return {
      baoCaoDoiTuongId: assignmentId as string,
      formTemplateId: templateId,
      submittedValues,
      status,
    };
  };

  const handleSaveDraft = async () => {
    if (!assignmentId) {
      message.error(
        "Thiếu ID đối tượng báo cáo (assignmentId). Không thể lưu dữ liệu.",
      );
      return;
    }
    setSaving(true);
    try {
      const values = form.getFieldsValue();
      await bcSubmissionService.saveDraft(formatSubmitData(values, "TAM_LUU"));
      message.success("Lưu dữ liệu biểu mẫu thành công!");
      router.push(`/doanhNghiepBaoCao`);
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!assignmentId) {
      message.error(
        "Thiếu ID đối tượng báo cáo (assignmentId). Không thể gửi dữ liệu.",
      );
      return;
    }
    setSaving(true);
    try {
      const values = form.getFieldsValue();
      await bcSubmissionService.saveDraft(formatSubmitData(values, "SUBMITTED"));
      message.success("Gửi báo cáo thành công!");
      router.push(`/doanhNghiepBaoCao`);
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi gửi báo cáo");
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ marginBottom: 16, flexWrap: "wrap", gap: 8 }}
      >
        <Flex gap={8} alignItems="center">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              router.push(
                `/doanhNghiepBaoCao/${id}?assignmentId=${assignmentId}`,
              )
            }
            style={{ padding: "4px 8px" }}
          />
          <AutoBreadcrumb />
        </Flex>

        <Space>
          {/* Nút Submit chính thức được chuyển ra ngoài trang danh sách đợt báo cáo */}
        </Space>
      </Flex>

      <Card
        title={`Làm báo cáo: ${templateData?.name || ""}`}
        bordered={false}
        style={{ minHeight: "60vh" }}
      >
        <Spin spinning={loading}>
          {!templateData ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Text type="secondary">Chưa có dữ liệu biểu mẫu</Text>
            </div>
          ) : (
            <Form form={form} layout="vertical" style={{ paddingBottom: 24 }}>
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                {templateData?.thanhPhanForms?.map(
                  (thanhPhan: any, tpIndex: number) => (
                    <div key={tpIndex} style={{ marginBottom: 24 }}>
                      {thanhPhan.name && (
                        <Title level={5}>{thanhPhan.name}</Title>
                      )}
                      <HtmlFormRenderer
                        htmlContent={thanhPhan.htmlContent || ""}
                        inputs={thanhPhan.inputs || []}
                      />
                    </div>
                  ),
                )}
              </Space>

              <div
                style={{
                  position: "sticky",
                  bottom: 0,
                  background: "#fff",
                  padding: "16px 24px",
                  margin: "32px -24px -24px -24px",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  zIndex: 99,
                  borderTop: "1px solid #f0f0f0",
                  boxShadow: "0 -4px 12px rgba(0,0,0,0.03)",
                }}
              >
                <Button
                  size="large"
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSaveDraft}
                  loading={saving}
                >
                  Lưu dữ liệu biểu mẫu
                </Button>
                <Button
                  size="large"
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                  loading={saving}
                >
                  Gửi báo cáo
                </Button>
              </div>
            </Form>
          )}
        </Spin>
      </Card>
    </>
  );
};

export default ReportSubmissionPage;
