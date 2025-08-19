export type MessageEnumType = "text" | "image" | "video" | "file";

export const mimeTypeToEnum = (mimeType?: string | null): MessageEnumType => {
  // When mimeType is null, return "text"
  if (!mimeType) {
    return "text";
  }

  if (mimeType.startsWith("image/")) {
    return "image";
  }
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  if (
    mimeType === "application/pdf" ||
    mimeType.startsWith("application/") ||
    mimeType.startsWith("text/")
  ) {
    return "file"; // 문서류는 file 로 통합
  }

  return "file"; // fallback
};
