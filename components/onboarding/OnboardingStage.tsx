import { View, Text, Dimensions, StyleSheet } from "react-native";
import React from "react";
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import onboardingData from "@/app/onboarding/data";
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");

// onboardingData에서 baseColor만 추출하여 배경색 배열 생성
const BGS = onboardingData.map((item) => item.baseColor);

type OnboardingStageProps = {
  scrollX: SharedValue<number>;
};

const OnboardingStage = ({ scrollX }: OnboardingStageProps) => {
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
    <LinearGradient
      colors={["purple", "blue", "orange"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    >
      <Text>그라데이션 뷰</Text>
      <Animated.View
        style={[StyleSheet.absoluteFill, animatedStyle]}
      ></Animated.View>
    </LinearGradient>
  );
};

export default OnboardingStage;
