import { View, Text, Dimensions, StyleSheet } from "react-native";
import React from "react";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolateColor,
  interpolate,
} from "react-native-reanimated";
import { onboardingData } from "@/app/onboarding/data";

const { width, height } = Dimensions.get("window");

// onboardingData에서 baseColor만 추출하여 배경색 배열 생성
const BGS = onboardingData.map((item) => item.baseColor);

type BackdropProps = {
  scrollX: SharedValue<number>;
};

const Backdrop = ({ scrollX }: BackdropProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value,
      BGS.map((_, index) => index * width),
      BGS
    );

    return {
      backgroundColor,
      opacity: 0.8,
    };
  });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, animatedStyle]}
    ></Animated.View>
  );
};

export default Backdrop;
