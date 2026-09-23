import React from "react";

export const fetchDropdown = async (
  currentData: any[],
  apiService: () => Promise<any>,
  setState: React.Dispatch<React.SetStateAction<any[]>>,
) => {
  if (currentData.length === 0) {
    try {
      const response = await apiService(); // Gọi API
      const options = response.data.map((item: any) => ({
        value: item.value,
        label: item.text ?? item.label,
      }));
      setState(options);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  }
};
