/*
2025-03-24 12:50:08



*/

import { View, Text, useWindowDimensions, StatusBar } from "react-native";
import React, { useRef } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { onboardingData, OnboardingItemType } from "@/app/onboarding/data";
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import Backdrop from "@/components/onboarding/Backdrop";
import Blob from "@/components/onboarding/Blob";
import { MMKV } from "react-native-mmkv";
import { ONBOARDING_FLAG } from "@/constants/constants";
import OnboardingItem from "@/components/onboarding/OnboardingItem";
import DotPagination from "@/components/onboarding/DotPagination";
import { useOnBoardingStore } from "@/zustand/useOnBoardingStore";
const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

const OnBoardingIndex = () => {
  const { showOnBoarding, setShowOnBoarding } = useOnBoardingStore();
  const storage = new MMKV();
  const flatListRef = useRef<Animated.FlatList<OnboardingItemType>>(null);

  const scrollX = useSharedValue(0);
  const flatListIndex = useSharedValue(0);

  const handleScroll = useAnimatedScrollHandler({
    onScroll: ({ contentOffset }) => {
      scrollX.value = contentOffset.x;
    },
  });

  const handleNext = () => {
    const currentIndex = Math.round(scrollX.value / WIDTH);
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
      });
    } else {
      handleFinishOnboarding();
    }
  };

  const handleFinishOnboarding = () => {
    storage.set(ONBOARDING_FLAG, true);
    const onBoardingFlag = storage.getBoolean(ONBOARDING_FLAG);
    setShowOnBoarding(false);
    console.log("finish onboarding");
    console.log("showOnBoarding", showOnBoarding);
    console.log("onBoardingFlag", onBoardingFlag);
  };

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: any;
  }) => {
    flatListIndex.value = viewableItems[0].index;
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-400">
      <StatusBar hidden />
      <Backdrop scrollX={scrollX} />
      <Blob scrollX={scrollX} />
      <Animated.FlatList
        ref={flatListRef}
        data={onboardingData}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={handleScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item, index }) => (
          <OnboardingItem item={item} index={index} scrollX={scrollX} />
        )}
      />
      <DotPagination
        screenData={onboardingData}
        index={flatListIndex.value}
        scrollX={scrollX}
        handleNext={handleNext}
      />
    </View>
  );
};

export default OnBoardingIndex;
