"use client";
import withAuthorization from "@/libs/authentication";
import { useState } from "react";

import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";

const Page: React.FC = () => {

    const [file, setFile] = useState<TaiLieuDinhKemType | null>(null);


    return (
        <>
            <SingleFileUploader
                value={file}
                onChange={setFile}
                category={FileCategoryConstant.Platform}
                subCategory="NTThongBaoKD"
                taxCode="0918273645"
                itemId="b1757c18-5eb4-47e5-99d0-f07833b408a6"
                loaiTaiLieu="ChuSoHuuWebsite"
            /></>
    );
};

export default withAuthorization(Page, "");
