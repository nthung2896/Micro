import React from "react";
import { Drawer, Divider, Tag, Modal, Button, Row, Col } from "antd";
import Link from "next/link";
import { DropdownOption } from "@/types/general";
import dynamic from "next/dynamic";
import { console } from "inspector/promises";
import { NotificationType as Notification } from "@/types/notification/dto";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const StaticFileUrl = process.env.NEXT_PUBLIC_API_URL;

interface NotificationViewProps {
  isOpen: boolean;
  data: Notification;
  dropdownUser?: DropdownOption[];
  onClose: () => void;
}

const notificationDetail: React.FC<NotificationViewProps> = ({
  isOpen,
  data,
  dropdownUser,
  onClose,
}) => {
  return (
    <>
      <Modal
        title={`Chi tiết ${data?.tieuDe}`}
        onCancel={() => onClose()}
        footer={[
          <Button key="cancel" onClick={onClose}>
            Đóng
          </Button>,
        ]}
        open={isOpen}
        width="50%"
      >
        <Row gutter={[16, 24]}>
          <Col span={8} style={{ fontWeight: "bold" }}>
            Tiêu đề
          </Col>
          <Col span={16}>{data?.tieuDe}</Col>
          <Col span={8} style={{ fontWeight: "bold" }}>
            Loại thông báo
          </Col>
          <Col span={16}>{data?.loaiThongBao}</Col>

          <Col span={8} style={{ fontWeight: "bold" }}>
            Người tạo
          </Col>
          <Col span={16}>{data?.createdBy}</Col>

          <Col span={8} style={{ fontWeight: "bold" }}>
            Ngày tạo
          </Col>
          <Col span={16}>
            {data?.createdDate
              ? new Date(data.createdDate).toLocaleDateString("vi-VN")
              : ""}
          </Col>

          <Col span={8} style={{ fontWeight: "bold" }}>
            Tài liệu đính kèm
          </Col>
          <Col span={16}>
            {data?.fileDinhKem ? (
              <a
                href={`${StaticFileUrl}/Uploads/${data?.fileDinhKem}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                `
                {data?.fileDinhKem
                  .split("/")
                  .pop()
                  ?.split("_")
                  .slice(1)
                  .join("_")}
                `
              </a>
            ) : (
              <span>Không có tài liệu</span>
            )}
          </Col>

          <Col span={8} style={{ fontWeight: "bold" }}>
            Nội dung
          </Col>
          <Col span={16}>
            {<ReactQuill readOnly value={data?.noiDung} theme="snow" />}
          </Col>
        </Row>
      </Modal>
      {/* <Drawer
        title="Thông tin thông báo doanh nghiệp"
        width="60%"
        placement="right"
        onClose={onClose}
        closable={true}
        open={isOpen}
      >
        <Divider dashed />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ flex: "0 0 50%", padding: "10px" }}>
            <p>
              <span className=" text-dark">Tiêu đề: {data?.tieuDe}</span>
            </p>
            <p>
              <span className=" text-dark">Người tạo: {data?.createdBy}</span>
            </p>
            <p>
              <span className="text-dark">
                File đính kèm:{" "}
                <a
                  href={`${StaticFileUrl}/${data?.fileDinhKem}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  tài liệu đính kèm
                </a>
              </span>
            </p>
          </div>
          <div style={{ flex: 1, padding: "10px" }}>
            <p>
              <span className=" text-dark">
                Loại thông báo: {data?.loaiThongBao}
              </span>
            </p>
            <p>
              <span className=" text-dark">
                Ngày tạo:{" "}
                {data?.createdDate
                  ? new Date(data.createdDate).toLocaleDateString("vi-VN")
                  : ""}
              </span>
            </p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ flex: 1, padding: "10px" }}>
            <p>
              <span className=" text-dark">Nội dung:</span>
            </p>
            <ReactQuill readOnly value={data?.noiDung} theme="snow" />
          </div>
        </div>
      </Drawer> */}
    </>
  );
};

export default notificationDetail;
