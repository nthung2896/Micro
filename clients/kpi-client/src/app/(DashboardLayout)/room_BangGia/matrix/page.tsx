"use client";

import React from "react";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import Flex from "@/components/shared-components/Flex";
import { Button, Card } from "antd";
import { ArrowLeftOutlined, ExportOutlined } from "@ant-design/icons";
import Link from "next/link";
import RoomBangGiaMatrix from "@/components/room-banggia/RoomBangGiaMatrix";
import withAuthorization from "@/libs/authentication";

const Room_BangGiaMatrixPage: React.FC = () => {
  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-3 flex-wrap gap-2"
      >
        <AutoBreadcrumb />
        <Flex alignItems="center" gap={8}>
          <Link href="/room_BangGia">
            <Button icon={<ArrowLeftOutlined />}>Quay lại danh sách</Button>
          </Link>
          <Button
            icon={<ExportOutlined />}
            onClick={() => window.open("/bang-gia", "_blank")}
          >
            Mở trang Portal
          </Button>
        </Flex>
      </Flex>

      <Card className="customCardShadow">
        <RoomBangGiaMatrix isAdmin={true} />
      </Card>
    </>
  );
};

export default withAuthorization(Room_BangGiaMatrixPage, "");
