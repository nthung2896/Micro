import React, { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextType {
  isShowModalCreate: boolean;
  setIsShowModalCreate: (value: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isShowModalCreate, setIsShowModalCreate] = useState(false);

  return (
    <ModalContext.Provider value={{ isShowModalCreate, setIsShowModalCreate }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
