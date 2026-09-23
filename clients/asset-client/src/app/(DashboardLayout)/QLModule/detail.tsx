import React from "react";
import { Image, Modal, Table, Tag } from "antd";
import { ModuleType } from "@/types/module/dto";

interface UserViewProps {
  module?: ModuleType | null;
  isOpen: boolean;
  onClose: () => void;
}

const QLModuleDetail: React.FC<UserViewProps> = ({
  module,
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
    { key: "2", field: "Tên chức năng", value: module?.name || "" },
    { key: "3", field: "Mã chức năng", value: module?.code || "" },
    { key: "4", field: "Thứ tự", value: module?.order || "" },
    {
      key: "5",
      field: "Trạng thái",
      value: module?.isShow ? "Hiển thị" : "Không hiển thị",
    },
    {
      key: "6",
      field: "Icon",
      value: (
        <>
          <div>
            <Image
              style={{ width: "50px" }}
              className="img-fluid"
              src={`${module?.icon ? module.icon : "/logo.png"} `}
              alt=""
              preview={false}
            />
          </div>
        </>
      ),
    },
  ];

  return (
    <Modal
      title="Chi tiết chức năng"
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
      {/* {module?.vaiTro_txt_response && user.vaiTro_txt_response.length > 0 && (
        <div className="mt-4">
          <h6 className="text-muted text-uppercase mb-2">Vai trò</h6>
          {user.vaiTro_txt_response.map((role, index) => (
            <Tag className="mb-1" color="cyan" key={index}>
              {role}
            </Tag>
          ))}
        </div>
      )} */}
    </Modal>
  );
};

export default QLModuleDetail;
