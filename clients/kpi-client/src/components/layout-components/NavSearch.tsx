"use client";
import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const NavSearch = () => {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchValue.trim()) {
      router.push(`/traCuu?keyword=${encodeURIComponent(searchValue.trim())}`);
    } else {
      router.push("/traCuu");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Input
      style={{ width: 240, height: 36 }}
      placeholder="Tìm kiếm..."
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      onKeyDown={handleKeyDown}
      suffix={
        <SearchOutlined
          onClick={handleSearch}
          className="cursor-pointer text-gray-400 hover:text-blue-600"
        />
      }
    />
  );
};

export default NavSearch;
