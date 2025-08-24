import React, { createContext, useContext, useState } from "react";
import { useFileById } from "@/hooks/useFileById";

type FileViewContextType = {
  fileId: string;
  setFileId: (id: string) => void;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isLoading: boolean;
  error: Error | null;
};

const FileViewContext = createContext<FileViewContextType | undefined>(
  undefined
);

const FileViewProvider = ({ children }: { children: React.ReactNode }) => {
  const [fileId, setFileId] = useState<string>("");

  // React Query 훅을 사용하여 파일 데이터 가져오기
  const { data: fileData, isLoading, error } = useFileById(fileId);

  const fileUrl = fileData?.public_url || "";
  const fileName = fileData?.file_name || "";
  const fileSize = fileData?.file_size || 0;
  const mimeType = fileData?.mime_type || "";

  return (
    <FileViewContext.Provider
      value={{
        fileId,
        setFileId,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        isLoading,
        error,
      }}
    >
      {children}
    </FileViewContext.Provider>
  );
};

export const useFileView = () => {
  const context = useContext(FileViewContext);
  if (!context) {
    throw new Error("useFileView must be used within a FileViewProvider");
  }
  return context;
};

export default FileViewProvider;
