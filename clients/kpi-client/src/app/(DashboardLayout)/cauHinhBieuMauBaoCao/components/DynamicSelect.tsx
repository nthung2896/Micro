import React, { useEffect, useState } from "react";
import { Select, Spin } from "antd";
import { BCCategoryItemType } from "@/types/bcFormTemplate/dto";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";

interface DynamicSelectProps {
  placeholder?: string;
  style?: React.CSSProperties;
  localOptions?: BCCategoryItemType[];
  globalCategoryCode?: string | null;
  value?: any;
  onChange?: (val: any) => void;
}

export default function DynamicSelect({
  placeholder,
  style,
  localOptions,
  globalCategoryCode,
  value,
  onChange,
}: DynamicSelectProps) {
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    localOptions || []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (globalCategoryCode) {
      const fetchGlobalOptions = async () => {
        setLoading(true);
        try {
          const res = await duLieuDanhMucService.getDropdownCode(globalCategoryCode);
          if (res.data && isMounted) {
             const mappedOptions = res.data.map((item: any) => ({
               label: item.text || item.label || item.name,
               value: item.value || item.id || item.code,
             }));
             setOptions(mappedOptions);
          }
        } catch (error) {
          console.error("Lỗi tải danh mục động:", error);
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      fetchGlobalOptions();
    } else {
      setOptions(localOptions || []);
    }
    return () => {
      isMounted = false;
    };
  }, [globalCategoryCode, localOptions]);

  return (
    <Select
      placeholder={placeholder}
      style={style}
      options={options}
      value={value}
      onChange={onChange}
      loading={loading}
      showSearch
      optionFilterProp="label"
      notFoundContent={loading ? <Spin size="small" /> : null}
    />
  );
}
