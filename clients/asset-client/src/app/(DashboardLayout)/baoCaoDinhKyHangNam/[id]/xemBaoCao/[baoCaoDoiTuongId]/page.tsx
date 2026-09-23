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
} from "antd";
import { ArrowLeftOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import bcSubmissionService from "@/services/bcSubmission/bcSubmission.service";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setIsLoading } from "@/store/general/GeneralSlice";
import dayjs from "dayjs";

interface PageProps {
  params: {
    id: string; // IdDotBaoCao
    baoCaoDoiTuongId: string; // Assignment ID
  };
}

const ManagerViewReportDetailPage: React.FC<PageProps> = ({ params }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { id, baoCaoDoiTuongId } = params;

  const [detailData, setDetailData] = useState<any>(null);

  const [expanded, setExpanded] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const descRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (descRef.current) {
      const { scrollHeight, clientHeight } = descRef.current;
      setIsOverflow(scrollHeight > clientHeight);
    }
  }, [detailData?.description, expanded]);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    dispatch(setIsLoading(true));
    try {
      const response = await bcSubmissionService.getDotBaoCaoDetail(id);
      if (response?.data) {
        setDetailData(response.data);
      } else {
        message.warning("Không thể tải thông tin đợt báo cáo.");
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đợt báo cáo:", error);
      message.error("Lỗi khi tải thông tin đợt báo cáo");
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [id, dispatch]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

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
          
          icon={<EyeOutlined />}
          onClick={() => {
            router.push(
              `/baoCaoDinhKyHangNam/${id}/xemBaoCao/${baoCaoDoiTuongId}/${record.id}`,
            );
          }}
        >
          Xem biểu mẫu
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
            onClick={() => router.push(`/baoCaoDinhKyHangNam/${id}`)}
            style={{ padding: "4px 8px" }}
          />
          <AutoBreadcrumb />
        </div>
      </div>

        <Card
          title="Thông tin Đợt báo cáo"
          bordered={false}
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Tên đợt báo cáo">
              <strong>{detailData?.name || "-"}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Biểu mẫu báo cáo">
              {detailData?.bieuMauBaoCao || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Gửi Email">
              {detailData?.isGuiMail ? "Gửi mail nhắc nhở" : "Không gửi mail nhắc nhở"}
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
             <Descriptions.Item label="Người duyệt báo cáo">
              {detailData?.nameNguoiDuyetBaoCaos?.join(", ")}
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
                    style={{ padding: 0, marginTop: 4 }}
                  >
                    {expanded ? "Thu gọn" : "Xem thêm"}
                  </Button>
                )}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

      <Card title="Danh sách Biểu mẫu doanh nghiệp đã nộp" bordered={false}>
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

export default ManagerViewReportDetailPage;
