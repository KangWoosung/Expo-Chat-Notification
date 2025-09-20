/*
2025-03-24 12:50:08



*/

import { View, StatusBar } from "react-native";
import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { onboardingData, OnboardingItemType } from "@/app/onboarding/data";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";
import { MMKV } from "react-native-mmkv";
import { ONBOARDING_FLAG } from "@/constants/constants";
import OnboardingItem from "@/components/onboarding/OnboardingItem";
import DotPagination from "@/components/onboarding/DotPagination";
import { useOnBoardingStore } from "@/zustand/useOnBoardingStore";
import OnboardingStage from "@/components/onboarding/OnboardingStage";
import { useOnboardingStage } from "@/zustand/onboarding/useOnboardingStage";
import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";
import Backdrop from "@/components/onboarding/Backdrop";
import Blob from "@/components/onboarding/Blob";

const STAGE_DELAY = 1000;

const OnBoardingIndex = () => {
  const { showOnBoarding, setShowOnBoarding } = useOnBoardingStore();
  const { scrollX, flatListIndex, setFlatListRef, setOnFinishCallback } =
    useOnboardingStage();

  const storage = useMemo(() => new MMKV(), []);
  const flatListRef = useRef<Animated.FlatList<OnboardingItemType>>(null);

  const handleScroll = useAnimatedScrollHandler({
    onScroll: ({ contentOffset }) => {
      scrollX.value = contentOffset.x;
    },
  });

  const handleFinishOnboarding = useCallback(() => {
    storage.set(ONBOARDING_FLAG, true);
    const onBoardingFlag = storage.getBoolean(ONBOARDING_FLAG);
    setShowOnBoarding(false);
    console.log("finish onboarding");
    console.log("showOnBoarding", showOnBoarding);
    console.log("onBoardingFlag", onBoardingFlag);
  }, [storage, setShowOnBoarding, showOnBoarding]);

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: any;
  }) => {
    flatListIndex.value = viewableItems[0].index;
  };

  useEffect(() => {
    // FlatList ref를 zustand 스토어에 설정
    setFlatListRef(flatListRef);

    // 온보딩 완료 콜백 설정
    setOnFinishCallback(handleFinishOnboarding);
  }, [setFlatListRef, setOnFinishCallback, handleFinishOnboarding]);

  return (
    <View className="flex-1 items-center justify-center bg-gray-400">
      <StatusBar hidden />
      <Backdrop scrollX={scrollX} />
      <Blob scrollX={scrollX} />
      <OnboardingStage stageDelay={STAGE_DELAY} />
      <OnboardingOverlay />
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
          <OnboardingItem item={item} index={index} />
        )}
        style={{ zIndex: 200 }} // FlatList를 최상위로
      />
      <DotPagination screenData={onboardingData} />
    </View>
  );
};

export default OnBoardingIndex;
