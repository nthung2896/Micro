"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Table,
  Typography,
  message,
  Tag,
  TableColumnsType,
  Form,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import bcSubmissionService from "@/services/bcSubmission/bcSubmission.service";
import bcFormTemplateService from "@/services/bcFormTemplate/bcFormTemplate.service";
import HtmlFormRenderer from "@/app/(DashboardLayout)/cauHinhBieuMau/components/HtmlFormRenderer";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setIsLoading } from "@/store/general/GeneralSlice";
import dayjs from "dayjs";
import PlatformManageTypeConstant from "@/constants/PlatformManageTypeConstant";

const { Title } = Typography;

interface PageProps {
  params: {
    id: string; // IdDotBaoCao
  };
  searchParams: {
    assignmentId?: string;
  };
}

const DoanhNghiepBaoCaoDetailPage: React.FC<PageProps> = ({
  params,
  searchParams,
}) => {
  const router = useRouter();
  const assignmentId = searchParams?.assignmentId || "";
  const dispatch = useDispatch<AppDispatch>();
  const { id } = params;
  const { Paragraph } = Typography;

  const [detailData, setDetailData] = useState<any>(null);
  const [assignmentDetail, setAssignmentDetail] = useState<any>(null);
  const descRef = React.useRef<HTMLDivElement>(null);

  // State for the submission modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    if (descRef.current) {
      const { scrollHeight, clientHeight } = descRef.current;
      // Nếu scrollHeight > clientHeight khi đang bị clamp (line-clamp: 1)
      setIsOverflow(scrollHeight > clientHeight);
    }
  }, [detailData?.description, expanded]);

  const handleFinalSubmit = async () => {
    if (!assignmentId) {
      message.error("Lỗi: Không tìm thấy mã đối tượng báo cáo (assignmentId).");
      return;
    }
    setSubmitting(true);
    try {
      let status = "SUBMITTED";
      if (detailData.timeEnd < dayjs().format("YYYY-MM-DD")) {
        status = "NOP_MUON";
      }
      // Chỉ gửi assignmentId, Backend tự update Status = SUBMITTED
      await bcSubmissionService.submit({
        baoCaoDoiTuongId: assignmentId,
        formTemplateId: null,
        submittedValues: [],
        status: status,
      });
      message.success("Đã nộp toàn bộ báo cáo chính thức thành công!");
      router.push("/doanhNghiepBaoCao");
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi nộp báo cáo.");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    dispatch(setIsLoading(true));
    try {
      // Fetch Period Detail
      const response = await bcSubmissionService.getDotBaoCaoDetail(id);
      if (response?.data) {
        setDetailData(response.data);
      } else {
        message.warning("Không thể tải thông tin đợt báo cáo.");
      }

      // Fetch Assignment Detail if assignmentId exists
      if (assignmentId) {
        const assignResponse =
          await bcSubmissionService.getDetail(assignmentId);
        if (assignResponse?.data) {
          setAssignmentDetail(assignResponse.data);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết:", error);
      message.error("Lỗi khi tải thông tin");
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [id, assignmentId, dispatch]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const openReportModal = async (templateId: string, templateName: string) => {
    dispatch(setIsLoading(true));
    try {
      // Get the full template which contains thanhPhanForms
      const response = await bcFormTemplateService.get(templateId);
      if (response?.data) {
        setCurrentTemplate({ ...response.data, displayName: templateName });
        form.resetFields();
        setIsModalOpen(true);
      } else {
        message.error("Không lấy được nội dung biểu mẫu báo cáo.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy biểu mẫu báo cáo:", error);
      message.error("Lỗi tải biểu mẫu báo cáo.");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTemplate(null);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      console.log("Submit values: ", values);

      setSubmitting(true);
      // Giả lập gọi API Submit
      // await bcSubmissionService.submit({ ... });
      message.success("Nộp báo cáo thành công (Chưa có API thực tế)");
      setIsModalOpen(false);
    } catch (error) {
      message.error("Vui lòng kiểm tra lại các trường bắt buộc.");
    } finally {
      setSubmitting(false);
    }
  };

  const templateColumns: TableColumnsType<any> = [
    {
      title: "STT",
      width: 70,
      align: "center",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tên biểu mẫu báo cáo",
      dataIndex: "name",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Loại đối tượng",
      dataIndex: "doiTuongTypes",
      width: 250,
      render: (vals: string[]) => (
        <>
          {vals?.map((val) => {
            switch (val) {
              case "DOANH_NGHIEP":
                return (
                  <Tag key={val} color="geekblue">
                    Doanh nghiệp
                  </Tag>
                );

              case "NEN_TANG":
                return (
                  <Tag key={val} color="purple">
                    Nền tảng
                  </Tag>
                );

              case "HO_KINH_DOANH":
                return (
                  <Tag key={val} color="cyan">
                    Hộ kinh doanh
                  </Tag>
                );

              default:
                return <Tag key={val}>{val}</Tag>;
            }
          })}
        </>
      ),
    },
    {
      title: "Thao tác",
      width: 150,
      align: "center",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          
          icon={<EditOutlined />}
          onClick={() => {
            const url = assignmentId
              ? `/doanhNghiepBaoCao/${id}/${record.id}?assignmentId=${assignmentId}`
              : `/doanhNghiepBaoCao/${id}/${record.id}`;
            router.push(url);
          }}
        >
          Làm báo cáo
        </Button>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/doanhNghiepBaoCao")}
            style={{ padding: "4px 8px" }}
          />
          <AutoBreadcrumb />
        </div>
        <Button
          type="primary"
          size="large"
          icon={<SendOutlined />}
          onClick={handleFinalSubmit}
          loading={submitting}
        >
          Nộp báo cáo chính thức
        </Button>
      </div>

      {assignmentDetail && (
        <Card
          title="Thông tin báo cáo"
          bordered={false}
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Tên đợt báo cáo">
              <strong>{detailData?.name || "-"}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian bắt đầu">
              {detailData?.timeStart
                ? dayjs(detailData.timeStart).format("DD/MM/YYYY")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Hạn nộp báo cáo">
              {detailData?.timeEnd
                ? dayjs(detailData.timeEnd).format("DD/MM/YYYY")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              <div style={{ position: "relative" }}>
                <div
                  ref={descRef}
                  style={
                    expanded
                      ? { overflow: "visible" }
                      : {
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }
                  }
                  dangerouslySetInnerHTML={{
                    __html: detailData?.description || "",
                  }}
                />
                {(isOverflow || expanded) && (
                  <Button
                    type="link"
                    
                    onClick={() => setExpanded(!expanded)}
                    style={{ padding: 0 }}
                  >
                    {expanded ? "Thu gọn" : "Xem thêm"}
                  </Button>
                )}
              </div>
            </Descriptions.Item>
          </Descriptions>
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Doanh nghiệp">
              <strong>{assignmentDetail.companyName || "-"}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Mã số thuế / Mã ĐD">
              {assignmentDetail.companyTaxcode || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên nền tảng">
              <strong>{assignmentDetail.nameNenTang || "-"}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Loại nền tảng">
              {PlatformManageTypeConstant.getDisplayName(
                assignmentDetail.platformManageTypeName,
              ) || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên miền">
              {assignmentDetail.domain || "-"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
      {/* 
      <Card
        title="Thông tin Đợt báo cáo"
        bordered={false}
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Tên đợt báo cáo">
            <strong>{detailData?.name || "-"}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian bắt đầu">
            {detailData?.timeStart
              ? dayjs(detailData.timeStart).format("DD/MM/YYYY")
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Hạn nộp báo cáo">
            {detailData?.timeEnd
              ? dayjs(detailData.timeEnd).format("DD/MM/YYYY")
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả">
            <div style={{ position: "relative" }}>
              <div
                ref={descRef}
                style={
                  expanded
                    ? { overflow: "visible" }
                    : {
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }
                }
                dangerouslySetInnerHTML={{
                  __html: detailData?.description || "",
                }}
              />
              {(isOverflow || expanded) && (
                <Button
                  type="link"
                  
                  onClick={() => setExpanded(!expanded)}
                  style={{ padding: 0 }}
                >
                  {expanded ? "Thu gọn" : "Xem thêm"}
                </Button>
              )}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Card> */}

      <Card title="Danh sách Biểu mẫu yêu cầu nộp" bordered={false}>
        <Table
          columns={templateColumns}
          dataSource={detailData?.bcFormTemplates || []}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: "Không có biểu mẫu báo cáo nào" }}
        />
      </Card>
    </>
  );
};

export default DoanhNghiepBaoCaoDetailPage;
