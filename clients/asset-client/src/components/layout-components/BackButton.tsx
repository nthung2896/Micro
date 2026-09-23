"use client";
import { SwapLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useRouter } from "next/navigation";
interface BackButtonProps {
  redicrectUrl?: string;
}
const BackButton = ({ redicrectUrl }: BackButtonProps) => {
  const router = useRouter();
  return (
    <Button
      icon={<SwapLeftOutlined />}
      variant="outlined"
      color="default"
      onClick={() => {
        if (redicrectUrl) {
          router.push(redicrectUrl);
        } else {
          window.history.back();
        }
      }}
    >
      Trở về
    </Button>
  );
};

export default BackButton;
