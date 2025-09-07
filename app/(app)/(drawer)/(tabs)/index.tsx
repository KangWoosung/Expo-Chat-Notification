/*
2025-09-01 14:53:41
Never use useFocusEffect hook in Expo Navigation!!!
Use useIsFocused hook instead!!!  



*/

import { View, Text, ScrollView } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { usePushToken } from "@/contexts/PushTokenProvider";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useIsFocused } from "@react-navigation/native";

import { useColorScheme } from "nativewind";
import InitScreenUserCard from "@/components/app/InitScreenUserCard";
import InitScreenUnreadSection from "@/components/app/InitScreenUnreadSection";
import InitScreenChartSection from "@/components/app/InitScreenChartSection";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useAnimationStore } from "@/zustand/useAnimationStore";
import { ANIMATION_DELAY } from "@/constants/constants";

const Index = () => {
  const { expoPushToken, notification, error, isLoading, isCachedToken } =
    usePushToken();
  const { user: currentUser } = useUser();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { signOut, isSignedIn } = useClerk();

  const isFocused = useIsFocused();
  const animationsEnabled = useAnimationStore((s) => s.animationsEnabled);

  const unreadSectionOpacity = useSharedValue(0);
  const unreadSectionTranslateY = useSharedValue(20);
  const chartSectionOpacity = useSharedValue(0);
  const chartSectionTranslateY = useSharedValue(20);

  useEffect(() => {
    // signOut();
    console.log("isFocused", isFocused);
    // Animation Control by AnimationsEnabled state
    if (animationsEnabled) {
      unreadSectionOpacity.value = withDelay(
        ANIMATION_DELAY * 1,
        withTiming(isFocused ? 1 : 0)
      );
      unreadSectionTranslateY.value = withDelay(
        ANIMATION_DELAY * 1,
        withTiming(isFocused ? 0 : 20)
      );
      chartSectionOpacity.value = withDelay(
        ANIMATION_DELAY * 2,
        withTiming(isFocused ? 1 : 0)
      );
      chartSectionTranslateY.value = withDelay(
        ANIMATION_DELAY * 2,
        withTiming(isFocused ? 0 : 20)
      );
    } else {
      unreadSectionOpacity.value = 1;
      unreadSectionTranslateY.value = 0;
      chartSectionOpacity.value = 1;
      chartSectionTranslateY.value = 0;
    }
  }, [isFocused, animationsEnabled]);

  const unreadSectionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: unreadSectionOpacity.value,
    transform: [{ translateY: unreadSectionTranslateY.value }],
  }));

  const chartSectionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chartSectionOpacity.value,
    transform: [{ translateY: chartSectionTranslateY.value }],
  }));

  if (!isSignedIn) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-foreground dark:text-foreground-dark">
          User information is not found. Please login to continue
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 relative
    bg-background dark:bg-background-dark"
      contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}
    >
      <InitScreenUserCard
        currentUser={currentUser}
        isDark={isDark}
        expoPushToken={expoPushToken || ""}
        className="border-0 border-green-500 relative"
      />

      <Animated.View style={unreadSectionAnimatedStyle} className="w-full">
        <InitScreenUnreadSection
          isDark={isDark}
          className=" border-0 border-green-500 relative"
        />
      </Animated.View>

      <Animated.View style={chartSectionAnimatedStyle} className="w-full">
        <InitScreenChartSection className="border-0 border-green-500 relative" />
      </Animated.View>

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
