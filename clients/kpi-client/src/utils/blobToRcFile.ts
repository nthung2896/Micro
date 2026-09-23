import { RcFile } from "antd/es/upload/interface";

export const blobToRcFile = (blob: Blob, fileName: string): RcFile => {
  return new File([blob], fileName, {
    type: blob.type,
    lastModified: new Date().getTime(),
  }) as RcFile;
};
