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
  DatePicker,
  Alert,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  SendOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
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
  const [selectedThangBaoCao, setSelectedThangBaoCao] = useState<Dayjs | null>(dayjs());
  const [historyData, setHistoryData] = useState<any[]>([]);

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
    if (!selectedThangBaoCao) {
      message.warning("Vui lòng chọn tháng báo cáo trước khi nộp.");
      return;
    }

    setSubmitting(true);
    try {
      let status = "SUBMITTED";
      if (detailData?.timeEnd && detailData.timeEnd < dayjs().format("YYYY-MM-DD")) {
        status = "NOP_MUON";
      }

      await bcSubmissionService.submit({
        baoCaoDoiTuongId: assignmentId,
        formTemplateId: null,
        submittedValues: [
          { type: "FLAT", colKey: "ThangBaoCao", value: String(selectedThangBaoCao.month() + 1) },
          { type: "FLAT", colKey: "NamBaoCao", value: String(selectedThangBaoCao.year()) },
        ],
        status: status,
        thangBaoCao: selectedThangBaoCao.month() + 1 ,
        namBaoCao: selectedThangBaoCao.year(),
      });
      message.success(`Đã nộp báo cáo tháng ${selectedThangBaoCao.month() + 1}/${selectedThangBaoCao.year()} thành công!`);
      fetchDetail(); // Refresh history
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

        // Fetch history
        const historyRes = await bcSubmissionService.getListHistory(assignmentId);
        if (historyRes?.data) {
          setHistoryData(historyRes.data);
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
    // {
    //   title: "Loại đối tượng",
    //   dataIndex: "doiTuongTypes",
    //   width: 250,
    //   render: (vals: string[]) => (
    //     <>
    //       {vals?.map((val) => {
    //         switch (val) {
    //           case "DOANH_NGHIEP":
    //             return (
    //               <Tag key={val} color="geekblue">
    //                 Doanh nghiệp
    //               </Tag>
    //             );

    //           case "NEN_TANG":
    //             return (
    //               <Tag key={val} color="purple">
    //                 Nền tảng
    //               </Tag>
    //             );

    //           case "HO_KINH_DOANH":
    //             return (
    //               <Tag key={val} color="cyan">
    //                 Hộ kinh doanh
    //               </Tag>
    //             );

    //           default:
    //             return <Tag key={val}>{val}</Tag>;
    //         }
    //       })}
    //     </>
    //   ),
    // },
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
              ? `/bao-cao-ke-khai/${id}/${record.id}?assignmentId=${assignmentId}&month=${selectedThangBaoCao?.month() ? selectedThangBaoCao.month() + 1 : ""}&year=${selectedThangBaoCao?.year() || ""}`
              : `/bao-cao-ke-khai/${id}/${record.id}`;
            router.push(url);
          }}
        >
          Làm báo cáo
        </Button>
      ),
    },
  ];

  const historyColumns: TableColumnsType<any> = [
    {
      title: "Tháng/Năm",
      key: "period",
      align: "center",
      width: 120,
      render: (record) => (
        <Tag color="blue" style={{ fontSize: "14px", padding: "4px 8px" }}>
          {record.thangBaoCao}/{record.namBaoCao}
        </Tag>
      ),
    },
    {
      title: "Ngày nộp/cập nhật",
      dataIndex: "updatedDate",
      key: "updatedDate",
      render: (val) => val ? dayjs(val).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: "Trạng thái",
      key: "status",
      align: "center",
      render: (record: any) => {
        if (record.status === "APPROVED")
          return <Tag color="purple">Đã duyệt</Tag>;
        if (record.status === "NOP_MUON")
          return <Tag color="warning">Nộp muộn</Tag>;
        // Mặc định hoặc SUBMITTED
        return <Tag color="green">Đã nộp</Tag>;
      },
    },
    {
      title: "Thao tác",
      align: "center",
      render: (record: any) => (
        <Button
          type="link"
          
          onClick={() => {
             const url = `/bao-cao-ke-khai/${id}/${record.formTemplateId || detailData?.bcFormTemplates?.[0]?.id}?assignmentId=${assignmentId}&month=${record.thangBaoCao}&year=${record.namBaoCao}`;
             router.push(url);
          }}
        >
          Xem/Sửa
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
            onClick={() => router.push("/bao-cao-ke-khai")}
            style={{ padding: "4px 8px" }}
          />
          <AutoBreadcrumb />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Button
            size="large"
            icon={<HistoryOutlined />}
            onClick={() => {
              const el = document.getElementById("submission-history");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Xem lịch sử nộp
          </Button>
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
      </div>

      {assignmentDetail && (
        <Card
          title="Thông tin Nền tảng / Doanh nghiệp"
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

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircleOutlined style={{ color: "#0355a2" }} />
            <span>Thực hiện nộp báo cáo cho tháng</span>
          </div>
        }
        bordered={false}
        style={{ marginBottom: 16, border: "1px solid #0355a2", background: "#f0f5ff" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: "16px", fontWeight: 500 }}>
            Bạn đang chọn nộp cho tháng:
          </div>
          <DatePicker
            picker="month"
            value={selectedThangBaoCao}
            onChange={(val) => setSelectedThangBaoCao(val)}
            format="MM/YYYY"
            size="large"
            allowClear={false}
            style={{ width: 200 }}
          />
          {selectedThangBaoCao && (
            <Alert
              message={`Dữ liệu sẽ được ghi nhận cho kỳ báo cáo tháng ${selectedThangBaoCao.month() + 1}/${selectedThangBaoCao.year()}`}
              type="info"
              showIcon
              style={{ flex: 1 }}
            />
          )}
        </div>
      </Card>

      <Card title="Danh sách Biểu mẫu yêu cầu nộp" bordered={false} style={{ marginBottom: 16 }}>
        <Table
          columns={templateColumns}
          dataSource={detailData?.bcFormTemplates || []}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: "Không có biểu mẫu báo cáo nào" }}
        />
      </Card>

      <Card
        id="submission-history"
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <HistoryOutlined />
            <span>Lịch sử các tháng đã nộp trong đợt này</span>
          </div>
        }
        bordered={false}
      >
        <Table
          columns={historyColumns}
          dataSource={historyData}
          rowKey={(record) => `${record.thangBaoCao}-${record.namBaoCao}`}
          pagination={false}
          locale={{ emptyText: "Chưa có báo cáo tháng nào được nộp" }}
        />
      </Card>
    </>
  );
};

export default DoanhNghiepBaoCaoDetailPage;
