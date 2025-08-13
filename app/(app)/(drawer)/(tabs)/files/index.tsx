import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import tailwindColors from "@/utils/tailwindColors";
import { Ionicons } from "@expo/vector-icons";
import { HEADER_ICON_SIZE } from "@/constants/constants";
import { useColorScheme } from "nativewind";
import { FILE_UPLOAD_LIMIT } from "@/constants/usageLimits";

const FilesIndex = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedSection, setSelectedSection] = useState<"sent" | "received">(
    "sent"
  );

  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];
  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];

  const toggleSection = (section: "sent" | "received") => {
    setSelectedSection(section);
  };

  return (
    <View className="flex-1 w-full bg-background dark:bg-background-dark">
      {/* Files sent - 상단 */}
      <TouchableOpacity
        onPress={() => toggleSection("sent")}
        className={`${
          selectedSection === "sent" ? "flex-1" : "h-16"
        } w-full p-md border-b border-border dark:border-border-dark `}
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

        {selectedSection === "sent" && (
          <View className="w-full mt-md p-md bg-background dark:bg-background-dark rounded-lg flex-1">
            <Text className="text-foreground dark:text-foreground-dark">
              Storage usage: 0/{FILE_UPLOAD_LIMIT}MB
            </Text>
            {/* 여기에 파일 목록이나 추가 내용을 넣을 수 있습니다 */}
          </View>
        )}
      </TouchableOpacity>

      {/* Files received - 하단 */}
      <TouchableOpacity
        onPress={() => toggleSection("received")}
        className={`${
          selectedSection === "received" ? "flex-1" : "h-16"
        } w-full p-md`}
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
    </View>
  );
};

export default FilesIndex;
