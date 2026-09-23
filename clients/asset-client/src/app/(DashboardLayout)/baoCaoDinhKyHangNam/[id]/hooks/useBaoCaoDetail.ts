import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import bcSubmissionService from "@/services/bcSubmission/bcSubmission.service";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { apiService } from "@/services/index";

export const useBaoCaoDetail = (id: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const [detailData, setDetailData] = useState<any>(null);
  
  // States for Targets Tab
  const [targetsList, setTargetsList] = useState<any[]>([]);
  const [targetPageData, setTargetPageData] = useState<any>({ pageIndex: 1, pageSize: 20, totalCount: 0 });
  
  const fetchDetail = useCallback(async () => {
    if (!id) return;
    dispatch(setIsLoading(true));
    try {
      const response = await bcSubmissionService.getDotBaoCaoDetail(id);
      if (response?.data) {
        setDetailData(response.data);
      } else {
        message.error(response?.message || "Không thể tải thông tin đợt báo cáo");
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đợt báo cáo:", error);
      message.error("Đã xảy ra lỗi khi lấy thông tin chi tiết");
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [id, dispatch]);

  const fetchTargets = useCallback(async (customSearch?: any) => {
    if (!id) return;
    try {
      const searchParams = {
        pageIndex: customSearch?.pageIndex ?? targetPageData.pageIndex,
        pageSize: customSearch?.pageSize ?? targetPageData.pageSize,
        IdDotBaoCao: id,
        ...customSearch,
      };

      // Giả định API cho đối tượng báo cáo. Cần điều chỉnh theo API thực tế
      const response = await apiService.post<any>("/BCBaoCaoDoiTuong/GetData", searchParams);
      
      if (response?.data) {
        setTargetsList(response.data.items || []);
        setTargetPageData({
          pageIndex: response.data.pageIndex,
          pageSize: response.data.pageSize,
          totalCount: response.data.totalCount,
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải đối tượng báo cáo:", error);
      // message.error("Đã xảy ra lỗi khi tải danh sách đối tượng báo cáo");
    }
  }, [id, targetPageData.pageIndex, targetPageData.pageSize]);

  useEffect(() => {
    fetchDetail();
    fetchTargets();
  }, [fetchDetail, fetchTargets]);

  return {
    detailData,
    targetsList,
    targetPageData,
    fetchTargets,
    refetchDetail: fetchDetail,
  };
};
