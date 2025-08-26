import { Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

const fileExtensions = [
  "pdf",
  "xlsx",
  "xls",
  "docx",
  "doc",
  "txt",
  "csv",
  "pptx",
  "ppt",
];
const imageExtensions = ["jpg", "jpeg", "png"];

export const handleFileDownload = async (fileUrl: string) => {
  try {
    // 1. 파일 확장자 추출
    const extension = fileUrl.split(".").pop()?.toLowerCase();
    if (!extension) {
      throw new Error("Unknown file extension");
    }

    // 2. 앱 내 캐시 디렉토리에 다운로드
    const fileUri = FileSystem.cacheDirectory + `temp.${extension}`;
    const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);

    if (fileExtensions.includes(extension)) {
      // ✅ PDF → Download 폴더에 저장
      const downloadDir = FileSystem.documentDirectory + "downloads/";
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });

      const dest = downloadDir + `file_${Date.now()}.pdf`;
      await FileSystem.moveAsync({ from: uri, to: dest });

      Alert.alert("저장 완료", "파일이 다운로드 폴더에 저장되었습니다.");
      return dest;
    } else if (imageExtensions.includes(extension)) {
      // ✅ 이미지 → MediaLibrary (갤러리)에 저장
      console.log("====handleFileDownload imageExtensions=====", extension);
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("권한 필요", "갤러리에 저장하려면 권한이 필요합니다.");
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);

      Alert.alert("저장 완료", "이미지가 갤러리에 저장되었습니다.");
      return uri;
    } else {
      throw new Error("Unsupported file type");
    }
  } catch (err) {
    console.error(err);
    throw new Error("File download failed");
  }
};
