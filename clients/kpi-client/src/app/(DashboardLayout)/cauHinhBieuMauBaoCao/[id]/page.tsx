"use client";

import React, { useMemo } from "react";
import { Tabs, TabsProps, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import InformationTab from "./components/InformationTab";
import TargetsTab from "./components/TargetsTab";
import FormTemplatesTab from "./components/FormTemplatesTab";
import { useBaoCaoDetail } from "./hooks/useBaoCaoDetail";
import { useSelector } from "@/store/hooks";

interface PageProps {
  params: {
    id: string;
  };
}

const BaoCaoDetail: React.FC<PageProps> = ({ params }) => {
  const router = useRouter();
  const { id } = params;
  
  const loading = useSelector((state) => state.general.isLoading);
  const { detailData, targetsList, targetPageData, fetchTargets } = useBaoCaoDetail(id);

  const tabItems: TabsProps['items'] = useMemo(() => [
    {
      key: '1',
      label: 'Thông tin đợt báo cáo',
      children: <InformationTab data={detailData} />,
    },
    {
      key: '2',
      label: 'Đối tượng báo cáo',
      children: <TargetsTab 
                  data={targetsList} 
                  pageData={targetPageData} 
                  onFetch={fetchTargets} 
                  loading={loading} 
                  bcFormTemplatesId={detailData?.bcFormTemplates?.[0]?.id}
                  isGuiMail={detailData?.isGuiMail}
                />,
    },
  ], [detailData, targetsList, targetPageData, fetchTargets, loading]);

  return (
    <>
     <div
        style={{
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(`/cauHinhBieuMauBaoCao`)}
            style={{ padding: "4px 8px" }}
          />
          <AutoBreadcrumb />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg" style={{ background: '#fff', padding: '16px', borderRadius: '8px' }}>
        <Tabs defaultActiveKey="1" items={tabItems} destroyInactiveTabPane={false} />
      </div>
    </>
  );
};

export default BaoCaoDetail;
