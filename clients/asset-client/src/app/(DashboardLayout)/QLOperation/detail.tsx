import React from "react";
import { Image, Modal, Table, Tag } from "antd";
import { OperationType } from "@/types/operation/dto";

interface UserViewProps {
  operation?: OperationType | null;
  isOpen: boolean;
  onClose: () => void;
}

const QLOperationDetail: React.FC<UserViewProps> = ({
  operation,
  isOpen,
  onClose,
}) => {
  const columns = [
    {
      title: "Trường",
      dataIndex: "field",
      key: "field",
      width: 150,
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
    },
  ];

  const data = [
    { key: "2", field: "Tên thao tác", value: operation?.name || "" },
    { key: "3", field: "Mã thao tác", value: operation?.code || "" },
    { key: "4", field: "Thứ tự", value: operation?.order || "" },
    {
      key: "5",
      field: "Trạng thái",
      value: operation?.isShow ? "Hiển thị" : "Không hiển thị",
    },
    {
      key: "6",
      field: "Link",
      value: operation?.url || "",
    },
  ];

  return (
    <Modal
      title="Chi tiết thao tác"
      visible={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Table
        columns={columns}
        bordered
        dataSource={data}
        rowKey="key"
        pagination={false}
        tableLayout="fixed"
      />
    </Modal>
  );
};

export default QLOperationDetail;
