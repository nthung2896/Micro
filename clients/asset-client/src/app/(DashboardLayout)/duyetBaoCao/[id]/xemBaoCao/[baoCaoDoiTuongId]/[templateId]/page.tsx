"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, Form, message, Spin, Space, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
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
    baoCaoDoiTuongId: string; // Assignment ID
    templateId: string; // Id của form template
  };
}

const ManagerViewReportTemplatePage: React.FC<PageProps> = ({ params }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { id, baoCaoDoiTuongId, templateId } = params;
  
  const loading = useSelector((state: any) => state.general.isLoading);
  const [templateData, setTemplateData] = useState<any>(null);

  const [form] = Form.useForm();

  const fetchTemplate = useCallback(async () => {
    if (!templateId) return;
    dispatch(setIsLoading(true));
    try {
      const response = await bcFormTemplateService.get(templateId);
      if (response?.data) {
        setTemplateData(response.data);
      } else {
        message.warning("Không thể tải cấu trúc biểu mẫu báo cáo. Vui lòng thử lại sau.");
      }

      // Fetch draft data
      if (baoCaoDoiTuongId) {
        const draftRes = await bcSubmissionService.getSubmission(baoCaoDoiTuongId, templateId);
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
  }, [templateId, baoCaoDoiTuongId, dispatch, form]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

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
            onClick={() => router.push(`/duyetBaoCao/${id}/xemBaoCao/${baoCaoDoiTuongId}`)}
            style={{ padding: '4px 8px' }}
          />
          <AutoBreadcrumb />
        </Flex>
      </Flex>
      
      <Card title={`Xem biểu mẫu: ${templateData?.name || ""}`} bordered={false} style={{ minHeight: '60vh' }}>
        <Spin spinning={loading}>
          {!templateData ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text type="secondary">Chưa có dữ liệu biểu mẫu</Text>
            </div>
          ) : (
            <Form form={form} layout="vertical" disabled={true} style={{ paddingBottom: 24 }}>
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {templateData?.thanhPhanForms?.map((thanhPhan: any, tpIndex: number) => (
                  <div key={tpIndex} style={{ marginBottom: 24 }}>
                    {thanhPhan.name && <Title level={5}>{thanhPhan.name}</Title>}
                    <HtmlFormRenderer
                      htmlContent={thanhPhan.htmlContent || ""}
                      inputs={thanhPhan.inputs || []}
                    />
                  </div>
                ))}
              </Space>
            </Form>
          )}
        </Spin>
      </Card>
    </>
  );
};

export default ManagerViewReportTemplatePage;
