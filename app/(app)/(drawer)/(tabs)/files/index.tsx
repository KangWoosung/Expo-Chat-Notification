import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import tailwindColors from "@/utils/tailwindColors";
import { Ionicons } from "@expo/vector-icons";
import { HEADER_ICON_SIZE } from "@/constants/constants";
import { useColorScheme } from "nativewind";
import { FILE_UPLOAD_LIMIT } from "@/constants/usageLimits";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { Tables } from "@/db/supabase/supabase";
import VictoryNativePieChart, {
  ChartDataType,
} from "@/components/charts/VictoryNativePieChart";

type UploadedFile = Tables<"uploaded_files">;
type StorageUsage = Tables<"user_storage_usage">;

const minSectionHeight = 64;

const FilesIndex = () => {
  const { height: screenHeight } = useWindowDimensions();

  // Layout measurements for accurate height calculation
  const [containerHeight, setContainerHeight] = useState(0);
  const [sentHeaderHeight, setSentHeaderHeight] = useState(0);
  const [receivedHeaderHeight, setReceivedHeaderHeight] = useState(0);
  const [calculatedMaxHeight, setCalculatedMaxHeight] = useState(0);

  const { colorScheme } = useColorScheme();
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const isDark = colorScheme === "dark";
  const [selectedSection, setSelectedSection] = useState<"sent" | "received">(
    "sent"
  );
  const [storageUsage, setStorageUsage] = useState(0);
  const [storageUsageData, setStorageUsageData] = useState<ChartDataType[]>([]);

  // Reanimated shared values
  const sentSectionHeight = useSharedValue(minSectionHeight); // h-16 = 64px
  const receivedSectionHeight = useSharedValue(minSectionHeight);

  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];
  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];

  // Layout measurement callbacks
  const onContainerLayout = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    setContainerHeight(height);
  }, []);

  const onSentHeaderLayout = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    setSentHeaderHeight(height);
  }, []);

  const onReceivedHeaderLayout = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    setReceivedHeaderHeight(height);
  }, []);

  // Calculate max height based on actual rendered elements
  useEffect(() => {
    if (
      containerHeight > 0 &&
      sentHeaderHeight > 0 &&
      receivedHeaderHeight > 0
    ) {
      // Total height used by fixed elements
      const totalHeadersHeight = sentHeaderHeight + receivedHeaderHeight;

      // Available space for one expanded section
      // containerHeight - both headers - one minimized section
      const availableHeight =
        containerHeight - totalHeadersHeight - minSectionHeight - 20; // 20px margins

      const maxHeight = Math.max(availableHeight, minSectionHeight * 2);
      setCalculatedMaxHeight(maxHeight);
    }
  }, [containerHeight, sentHeaderHeight, receivedHeaderHeight]);

  const toggleSection = (section: "sent" | "received") => {
    setSelectedSection(section);

    // Only proceed if we have accurate measurements
    if (calculatedMaxHeight > 0) {
      // Animate heights using precisely calculated values
      if (section === "sent") {
        sentSectionHeight.value = withTiming(calculatedMaxHeight, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
        receivedSectionHeight.value = withTiming(minSectionHeight, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        sentSectionHeight.value = withTiming(minSectionHeight, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
        receivedSectionHeight.value = withTiming(calculatedMaxHeight, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
      }
    }
  };

  useEffect(() => {
    if (!supabase || !currentUser?.id) return;

    const fetchUploadedFiles = async () => {
      const { data, error } = await supabase
        .from("uploaded_files")
        .select("*")
        .eq("user_id", currentUser?.id);
      if (error) {
        console.error("Error fetching files:", error);
      } else {
        setUploadedFiles(data || []);
      }
    };
    fetchUploadedFiles();

    const fetchStorageUsage = async () => {
      const { data: storageUsage, error: storageUsageError } = await supabase
        .from("user_storage_usage")
        .select("*")
        .eq("user_id", currentUser?.id);
      if (storageUsageError) {
        console.error("Error fetching storage usage:", storageUsageError);
      } else {
        setStorageUsage(storageUsage?.[0].total_file_size || 0);
      }
      const chartData = [
        {
          label: "Used",
          value: storageUsage?.[0].total_file_size || 0,
          color: "rgba(131, 167, 234, 1)",
        },
        {
          label: "Available",
          value: FILE_UPLOAD_LIMIT - (storageUsage?.[0].total_file_size || 0),
          color: "rgb(40, 64, 167)",
        },
      ];
      setStorageUsageData(chartData);
    };
    fetchStorageUsage();

    if (!storageUsage || !uploadedFiles) return;
  }, [supabase, currentUser?.id]);

  // Initialize animation values based on selected section
  useEffect(() => {
    if (calculatedMaxHeight > 0) {
      const targetHeight = calculatedMaxHeight;
      if (selectedSection === "sent") {
        sentSectionHeight.value = withTiming(targetHeight, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
        receivedSectionHeight.value = withTiming(minSectionHeight, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        sentSectionHeight.value = withTiming(minSectionHeight, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
        receivedSectionHeight.value = withTiming(targetHeight, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
      }
    }
  }, [selectedSection, calculatedMaxHeight]);

  // Animated styles
  const sentSectionStyle = useAnimatedStyle(() => ({
    height: sentSectionHeight.value,
  }));

  const receivedSectionStyle = useAnimatedStyle(() => ({
    height: receivedSectionHeight.value,
  }));

  return (
    <View
      className="flex-1 w-full bg-background dark:bg-background-dark"
      onLayout={onContainerLayout}
    >
      {/* Files sent - 상단 */}
      <Animated.View
        style={sentSectionStyle}
        className="w-full overflow-hidden"
      >
        <TouchableOpacity
          onPress={() => toggleSection("sent")}
          className={`w-full p-md border-b border-border dark:border-border-dark `}
          onLayout={onSentHeaderLayout}
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
              name={selectedSection === "sent" ? "chevron-up" : "chevron-down"}
              size={HEADER_ICON_SIZE}
              color={foregroundTheme}
            />
          </View>
        </TouchableOpacity>

        {/* <VictoryNativePieChart chartData={storageUsageData} /> */}
        {/* <DistortionCard title="Storage usage" subtitle="0/30MB" /> */}

        {selectedSection === "sent" && (
          <View className="w-full mt-md p-md bg-background dark:bg-background-dark rounded-lg flex-1">
            <Text className="text-foreground dark:text-foreground-dark">
              Storage usage: 0/{FILE_UPLOAD_LIMIT}MB
            </Text>
            {/* 여기에 파일 목록이나 추가 내용을 넣을 수 있습니다 */}
            <FlatList
              data={uploadedFiles}
              renderItem={({ item }) => (
                <View className="flex-row items-center gap-x-sm p-sm">
                  <Ionicons
                    name="document-text-outline"
                    size={HEADER_ICON_SIZE}
                    color={foregroundTheme}
                  />
                  <Text className="text-foreground dark:text-foreground-dark">
                    {item.file_name}
                  </Text>
                </View>
              )}
              keyExtractor={(item) => item.file_id}
            />
          </View>
        )}
      </Animated.View>

      {/* Files received - 하단 */}
      <Animated.View
        style={receivedSectionStyle}
        className="w-full overflow-hidden"
      >
        <TouchableOpacity
          onPress={() => toggleSection("received")}
          className="w-full p-md"
          onLayout={onReceivedHeaderLayout}
        >
          <View className="flex-row w-full items-center gap-x-sm">
            <Ionicons
              name="cloud-download-outline"
              size={HEADER_ICON_SIZE}
              color={foregroundTheme}
            />
            <Text className="text-lg font-bold text-foreground dark:text-foreground-dark flex-1">
              Files received
            </Text>
            <Ionicons
              name={
                selectedSection === "received" ? "chevron-up" : "chevron-down"
              }
              size={HEADER_ICON_SIZE}
              color={foregroundTheme}
            />
          </View>

          {selectedSection === "received" && (
            <View className="w-full mt-md p-md bg-background dark:bg-background-dark rounded-lg flex-1">
              <Text className="text-foreground dark:text-foreground-dark">
                Storage usage: 0/30MB
              </Text>
              {/* 여기에 파일 목록이나 추가 내용을 넣을 수 있습니다 */}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default FilesIndex;
