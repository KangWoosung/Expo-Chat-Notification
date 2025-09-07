import { View, Dimensions, Text } from "react-native";
import React, { useEffect } from "react";
import { useFileView } from "@/contexts/FileViewProvider";
import { WebView } from "react-native-webview";
import Pdf from "react-native-pdf";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";
import { useAnimationStore } from "@/zustand/useAnimationStore";

const AnimatedImage = Animated.createAnimatedComponent(Image);

const FileViewer = () => {
  const { fileId, fileUrl, fileName, mimeType, isLoading, error } =
    useFileView();

  useEffect(() => {
    console.log("====FileViewer Debug Info=====");
  }, [fileId, mimeType, fileUrl, fileName, isLoading, error]);

  // 로딩 상태
  if (isLoading) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark justify-center items-center">
        <Text className="text-foreground dark:text-foreground-dark">
          파일을 불러오는 중...
        </Text>
      </View>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark justify-center items-center">
        <Text className="text-red-500">
          파일을 불러올 수 없습니다: {error.message}
        </Text>
      </View>
    );
  }

  // 파일 데이터가 없는 경우
  if (!fileUrl || !mimeType) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark justify-center items-center">
        <Text className="text-foreground dark:text-foreground-dark">
          파일 정보를 찾을 수 없습니다.
        </Text>
        <Text className="text-foreground dark:text-foreground-dark text-sm mt-2">
          fileId: {fileId}
        </Text>
        <Text className="text-foreground dark:text-foreground-dark text-sm">
          fileUrl: {fileUrl}
        </Text>
        <Text className="text-foreground dark:text-foreground-dark text-sm">
          mimeType: {mimeType}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <Text className="text-foreground dark:text-foreground-dark font-semibold text-lg p-4">
        eeeeeeeeee {fileName} ({mimeType})
      </Text>

      {mimeType.startsWith("image/") ? (
        //* Image file *//
        <View style={{ flex: 1, padding: 0 }}>
          <AnimatedImage
            source={{ uri: fileUrl }}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
            }}
            contentFit="contain"
            cachePolicy="memory-disk"
            priority="high"
            onLoad={() => {
              console.log("✅ Image loaded successfully:", fileUrl);
            }}
            placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
            transition={200}
            sharedTransitionTag={`image-${fileId}`}
          />
        </View>
      ) : mimeType.startsWith("application/pdf") ? (
        //* PDF file *//
        <View style={{ flex: 1 }}>
          <Pdf
            source={{ uri: fileUrl }}
            style={{ flex: 1, width: Dimensions.get("window").width }}
          />
        </View>
      ) : (
        //* Office file *//
        <View style={{ flex: 1 }}>
          <WebView
            source={{
              uri: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                fileUrl
              )}`,
            }}
            style={{ flex: 1 }}
          />
        </View>
      )}
    </View>
  );
};

export default FileViewer;
