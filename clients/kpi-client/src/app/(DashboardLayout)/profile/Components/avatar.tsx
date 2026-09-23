"use client";
import React from "react";
import { Button, Image } from "antd";
import styles from "./avatar.module.css";

const Avatar = ({
  src,
  onClose,
  onSuccess,
  onOpen,
}: {
  src?: string;
  onClose: () => void;
  onSuccess: () => void;
  onOpen: () => void;
}) => {
  return (
    <div className={styles.avatarContainer}>
      <div className={styles.avatarImage}>
        <Image
          width={200}
          height={200}
          src={src || "/images/default-avatar.svg"}
          fallback="/images/default-avatar.svg"
          style={{ display: "inline" }}
        />
      </div>
      <Button
        className={`primary ${styles.changeButton}`}
        color="cyan"
        variant="solid"
        onClick={onOpen}
      >
        Thay đổi ảnh đại diện
      </Button>
    </div>
  );
};
export default Avatar;
