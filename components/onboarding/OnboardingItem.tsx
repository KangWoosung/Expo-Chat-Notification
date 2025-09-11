import React from "react";
import { View, Dimensions, StyleSheet, Text } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { OnboardingItemType } from "@/app/onboarding/data";
import OnboardingDefaultItem from "./OnboardingDefaultItem";
import OnboardingFirsrPage from "./OnboardingFirsrPage";

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

type OnboardingItemProps = {
  item: OnboardingItemType;
  index: number;
  scrollX: SharedValue<number>;
};

function OnboardingItem({ item, index, scrollX }: OnboardingItemProps) {
  return (
    <View
      className="flex-1 items-center justify-center p-5"
      style={[{ width: WIDTH }]}
    >
      {index === 0 ? (
        <OnboardingFirsrPage />
      ) : (
        <OnboardingDefaultItem item={item} index={index} scrollX={scrollX} />
      )}
    </View>
  );
}

export default OnboardingItem;
