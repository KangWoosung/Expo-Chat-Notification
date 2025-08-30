import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";
import React, { useEffect, useState } from "react";
import tailwindColors from "@/utils/tailwindColors";
import { Ionicons } from "@expo/vector-icons";
import { HEADER_ICON_SIZE } from "@/constants/constants";
import { useColorScheme } from "nativewind";
import { useUploadedFiles } from "@/hooks/useUploadedFiles";
import { useIncomingFiles } from "@/hooks/useIncomingFiles";
import { useStorageUsage } from "@/hooks/useStorageUsage";
import { router } from "expo-router";
import { FilesCategory, useTabsLayoutStore } from "@/zustand/tabsLayoutStore";

const AnimatedImage = Animated.createAnimatedComponent(Image);

const SCREEN_WIDTH = Dimensions.get("window").width;

const FilesIndex = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [fileListWidth, setFileListWidth] = useState(SCREEN_WIDTH);
  const [eachFileBoxWidth, setEachFileBoxWidth] = useState(
    Math.round((SCREEN_WIDTH - 8) / 2)
  );

  // Zustand 스토어에서 파일 카테고리 상태 가져오기
  const { filesCategory } = useTabsLayoutStore();

  // React Query 훅 사용 - 카테고리에 따라 다른 훅 사용
  const uploadedQuery = useUploadedFiles();
  const incomingQuery = useIncomingFiles();

  console.log("📊 Hook results:", {
    uploadedQuery: uploadedQuery.status,
    incomingQuery: incomingQuery.status,
    currentCategory: filesCategory,
  });

  // 현재 활성화된 쿼리 선택
  const currentQuery =
    filesCategory === FilesCategory.UPLOADED ? uploadedQuery : incomingQuery;

  // 그 객체에서 구조분해할당으로 값들을 추출
  const {
    data: files = [],
    isLoading: isLoadingFiles,
    error: filesError,
    refetch: refetchFiles,
  } = currentQuery;

  // 파일 데이터 변화 로그
  // useEffect(() => {
  //   console.log("=== Files data changed:", {
  //     category: filesCategory,
  //     filesCount: files.length,
  //     files: files,
  //     isLoading: isLoadingFiles,
  //     hasError: !!filesError,
  //   });
  // }, [files, filesCategory, isLoadingFiles, filesError]);

  const { error: storageError } = useStorageUsage();

  useEffect(() => {
    setEachFileBoxWidth(Math.round((fileListWidth - 8) / 2));
  }, [fileListWidth]);

  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];

  // 에러 처리
  if (filesError) {
    console.error("Error fetching files:", filesError);
  }
  if (storageError) {
    console.error("Error fetching storage usage:", storageError);
  }

  return (
    <View className="flex-1 w-full bg-background dark:bg-background-dark">
      {/* Files sent - 상단 */}
      <View className="w-full overflow-hidden">
        {/* <GiftedBarChart /> */}
        {/* <GiftedPieChart
          data={storageUsageData}
          chartConfig={defaultChartConfig}
        /> */}
        {/* <VictoryNativePieChart chartData={storageUsageData} /> */}
        {/* <VictoryNativePieChartV2 /> */}
        {/* <ChartKitPieChart
          data={storageUsageData}
          pieChartWidth={300}
          pieChartHeight={300}
          chartConfig={defaultChartConfig}
        /> */}
        {/* <DistortionCard title="Storage usage" subtitle="0/30MB" /> */}

        <View
          className=" w-full h-full
            bg-background dark:bg-background-dark 
          "
        >
          {/* 로딩 상태 */}
          {isLoadingFiles && (
            <View className="flex-1 items-center justify-center">
              <Text className="text-foreground dark:text-foreground-dark">
                파일 목록을 불러오는 중...
              </Text>
            </View>
          )}

          {/* 에러 상태 */}
          {(filesError || storageError) && (
            <View className="flex-1 items-center justify-center">
              <Text className="text-red-500 mb-md">
                데이터를 불러오는 중 오류가 발생했습니다.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  refetchFiles();
                }}
                className="bg-blue-500 px-lg py-sm rounded-lg"
              >
                <Text className="text-white">다시 시도</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 파일 목록 */}
          {!isLoadingFiles && !filesError && (
            <FlatList
              className="w-full h-full"
              numColumns={2}
              onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setFileListWidth(width);
              }}
              data={files}
              renderItem={({ item, index }) => (
                <View
                  className={`items-center justify-center ${index % 2 === 0 ? "mr-xs" : ""}`}
                  style={{
                    width: eachFileBoxWidth,
                  }}
                >
                  {item.mime_type === "image/jpeg" ? (
                    <Pressable
                      // @ts-ignore
                      onPress={() =>
                        router.push({
                          pathname: "/(stack)/uploaded_files/id/[id]",
                          params: { id: item.file_id },
                        })
                      }
                    >
                      <AnimatedImage
                        source={{ uri: item?.public_url || "" }}
                        style={{
                          width: eachFileBoxWidth,
                          height: eachFileBoxWidth,
                          marginTop: 4,
                          borderRadius: 8,
                          backgroundColor: "transparent",
                        }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        priority="normal"
                        onLoad={() =>
                          console.log("✅ Thumbnail loaded:", item.file_name)
                        }
                        onError={(error) =>
                          console.error(
                            "❌ Thumbnail error:",
                            error,
                            item.file_name
                          )
                        }
                        placeholder={{
                          blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
                        }}
                        transition={150}
                        sharedTransitionTag={`image-${item.file_id}`}
                      />
                    </Pressable>
                  ) : (
                    <Pressable
                      // @ts-ignore
                      onPress={() =>
                        router.push({
                          pathname: "/(stack)/uploaded_files/id/[id]",
                          params: { id: item.file_id },
                        })
                      }
                    >
                      <View className="flex-col items-center justify-center w-full gap-y-sm mt-xs">
                        <Ionicons
                          name="document-text-outline"
                          size={HEADER_ICON_SIZE}
                          color={foregroundTheme}
                        />
                        <Text className="text-sm text-foreground dark:text-foreground-dark">
                          {item.file_name.slice(0, 20)}
                        </Text>
                      </View>
                    </Pressable>
                  )}
                </View>
              )}
              keyExtractor={(item) => item.file_id}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default FilesIndex;
