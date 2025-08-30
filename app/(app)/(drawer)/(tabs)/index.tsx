import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { usePushToken } from "@/contexts/PushTokenProvider";
import { useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { DEFAULT_AVATAR } from "@/constants/constants";
import { useStorageUsage } from "@/hooks/useStorageUsage";
import { FILE_UPLOAD_LIMIT } from "@/constants/usageLimits";
import ChartKitPieChart, {
  defaultChartConfig,
} from "@/components/charts/ChartKitPieChart";
import BadgeWithIcon from "@/components/ui/BadgeWithIcon";
import { hexToRgba } from "@/utils/hexToRgba";
import { capitalizeFirstLetter } from "@/utils/stringFunctions";
import { useColorScheme } from "nativewind";
import InitScreenUserCard from "@/components/app/InitScreenUserCard";
import InitScreenUnreadSection from "@/components/app/InitScreenUnreadSection";
import InitScreenChartSection from "@/components/app/InitScreenChartSection";

/*
data example:
const data = [
  {
    name: "Seoul",
    population: 21500000,
    color: "rgba(131, 167, 234, 1)",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  },
  {
    name: "Toronto",
    population: 2800000,
    color: "#F00",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  },
];
*/

const Index = () => {
  const { expoPushToken, notification, error, isLoading, isCachedToken } =
    usePushToken();
  const { user: currentUser } = useUser();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  console.log("====Index=====");

  return (
    <ScrollView
      className="flex-1 
    bg-background dark:bg-background-dark"
      contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}
    >
      {/* <View
        className="flex flex-row items-center justify-start gap-4 w-full
        p-lg pt-2xl
      "
      >
        <View className="flex items-center justify-center gap-4">
          <Image
            source={currentUser?.imageUrl || DEFAULT_AVATAR}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
            }}
          />
        </View>
        <View className="flex items-center justify-center gap-4">
          <Text className="text-foreground dark:text-foreground-dark text-xl font-bold">
            {currentUser?.username || "No Name"}
          </Text>
          <View className="flex items-center justify-center gap-4">
            <BadgeWithIcon
              iconName="checkmark"
              className="bg-accent-600/20 border-accent-800 
               dark:bg-accent-200/20 dark:border-accent-300 "
              textClassName=" text-accent-800 dark:text-accent-200"
              style={{ backgroundColor: hexToRgba("#c88a04", 0.5) }}
              iconColor={isDark ? "gold" : "crimson"}
              iconSize={16}
              iconPosition="left"
              dot={false}
              dotSize={10}
              maxCount={99}
              pressable={false}
              onPress={() => {}}
              accessibilityLabel="online"
              label="online"
            />
          </View>
        </View>
      </View> */}

      <InitScreenUserCard
        currentUser={currentUser}
        isDark={isDark}
        expoPushToken={expoPushToken || ""}
      />

      <InitScreenUnreadSection isDark={isDark} />

      <InitScreenChartSection />

      <View className="flex items-center justify-center gap-4 my-lg">
        {isLoading ? (
          <Text className="text-foreground dark:text-foreground-dark">
            Loading...
          </Text>
        ) : error ? (
          <Text className="text-foreground dark:text-foreground-dark">
            Error: {error.message}
          </Text>
        ) : (
          <>
            <Text className="text-foreground dark:text-foreground-dark">
              Token: {expoPushToken?.substring(0, 20)}...
            </Text>
            <Text className="text-foreground dark:text-foreground-dark">
              Cache Status: {isCachedToken ? "Cached" : "Fresh"}
            </Text>
            {notification && (
              <Text className="text-foreground dark:text-foreground-dark">
                Latest: {notification.request.content.title}
              </Text>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default Index;
