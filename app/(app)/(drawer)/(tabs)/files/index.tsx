import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import tailwindColors from "@/utils/tailwindColors";
import { Ionicons } from "@expo/vector-icons";
import { HEADER_ICON_SIZE } from "@/constants/constants";
import { useColorScheme } from "nativewind";
import { useUploadedFiles } from "@/hooks/useUploadedFiles";
import { useStorageUsage } from "@/hooks/useStorageUsage";
import { router } from "expo-router";

const SCREEN_WIDTH = Dimensions.get("window").width;

const FilesIndex = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [fileListWidth, setFileListWidth] = useState(SCREEN_WIDTH);
  const [eachFileBoxWidth, setEachFileBoxWidth] = useState(
    Math.round((SCREEN_WIDTH - 8) / 2)
  );

  // React Query 훅 사용
  const {
    data: uploadedFiles = [],
    isLoading: isLoadingFiles,
    error: filesError,
    refetch: refetchFiles,
  } = useUploadedFiles();

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
        <TouchableOpacity
          className={`w-full p-md border-b border-border dark:border-border-dark `}
        >
          <View className="flex-row w-full items-center gap-x-sm">
            <Ionicons
              name="cloud-upload-outline"
              size={HEADER_ICON_SIZE}
              color={foregroundTheme}
            />
            <Text className="text-lg font-bold text-foreground dark:text-foreground-dark flex-1">
              Files sent
            </Text>
            <Ionicons
              name="chevron-up"
              size={HEADER_ICON_SIZE}
              color={foregroundTheme}
            />
          </View>
        </TouchableOpacity>

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
              data={uploadedFiles}
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
                      <Image
                        source={{ uri: item?.public_url || "" }}
                        className="rounded-lg"
                        style={{
                          width: eachFileBoxWidth,
                          height: eachFileBoxWidth,
                          marginTop: 4,
                          borderRadius: 8,
                        }}
                        contentFit="cover"
                        cachePolicy="disk"
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
