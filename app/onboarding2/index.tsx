import { View, Text, FlatList, Dimensions, ViewToken } from "react-native";
import React, { useCallback, useRef } from "react";
import { onboardingData, OnboardingItemType } from "../onboarding/data";
import Onboarding2Item from "@/components/onboarding/Onboarding2Item";
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

const { width: WIDTH } = Dimensions.get("window");

const Onboarding2Index = () => {
  const scrollRef = useAnimatedRef<FlatList<OnboardingItemType>>();
  const x = useSharedValue(0);
  const scrollIndex = useSharedValue(0);

  const keyExtractor = useCallback(
    (_: any, index: number) => index.toString(),
    []
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
      scrollIndex.value = Math.round(event.contentOffset.x / WIDTH);
    },
  });

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisibleItem = viewableItems[0];
      if (firstVisibleItem && firstVisibleItem.index !== null) {
        scrollIndex.value = firstVisibleItem.index;
      }
    },
    []
  );

  const visibilityConfig = useRef({
    minimumViewTime: 300,
    viewAreaCoveragePercentThreshold: 10,
  });

  return (
    <View className="flex flex-1 w-full h-full">
      <Animated.FlatList
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        data={onboardingData}
        renderItem={({ item, index }) => (
          <Onboarding2Item item={item} index={index} scrollX={x} />
        )}
        onScroll={onScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={visibilityConfig.current}
        keyExtractor={keyExtractor}
      />
    </View>
  );
};

export default Onboarding2Index;
