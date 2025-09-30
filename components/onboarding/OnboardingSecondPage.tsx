import { View, Text, Platform, Dimensions } from "react-native";
import React, { useEffect } from "react";
import Animated from "react-native-reanimated";
import { Image } from "expo-image";
import { useOnboardingStage } from "@/zustand/onboarding/useOnboardingStage";
import { useIsFocused } from "@react-navigation/native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { onboardingData } from "@/app/onboarding/data";

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

const OnboardingSecondPage = () => {
  const { setTitleAnimationFinished, scrollX } = useOnboardingStage();
  const isFocused = useIsFocused();

  const index = 1;
  const circleSize = WIDTH;

  const animationRange = [
    (index - 1) * WIDTH,
    index * WIDTH,
    (index + 1) * WIDTH,
  ];

  const titleFontSize = useSharedValue(60);
  const titleOpacity = useSharedValue(1);
  const subtitleFontSize = useSharedValue(16);
  const subtitleOpacity = useSharedValue(0);

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      fontSize: titleFontSize.value,
      opacity: titleOpacity.value,
    };
  });
  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    return {
      fontSize: subtitleFontSize.value,
      opacity: subtitleOpacity.value,
    };
  });

  const circleAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: interpolate(
            scrollX.value,
            animationRange,
            [1, 4, 5],
            Extrapolation.CLAMP
          ),
        },
      ],
    }),
    [scrollX]
  );

  return (
    <View className="flex-1 flex-col items-center justify-center w-full h-full p-2xl ">
      <View className="absolute inset-0 items-center justify-start ">
        <Animated.View
          className="rounded-full"
          style={[
            {
              width: circleSize,
              height: circleSize,
              backgroundColor: onboardingData[index].baseColor,
            },
            circleAnimatedStyle,
          ]}
        />
      </View>
      <View className="flex flex-col items-center justify-center w-full h-[140px] border-0 border-blue-500">
        <Animated.Text
          className="text-white font-extrabold tracking-wide"
          style={[
            titleAnimatedStyle,
            {
              zIndex: 99,
              fontWeight: Platform.OS === "ios" ? "900" : "bold",
              letterSpacing: 1,
              textShadowColor: "rgba(0, 0, 0, 0.8)",
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 8,
              fontFamily: Platform.select({
                ios: "SF Pro Display",
                android: "Roboto",
                default: "System",
              }),
              textAlign: "center",
              includeFontPadding: false, // Android에서 폰트 패딩 제거
            },
          ]}
        >
          {`EXPO \nNOTIFICATION`}
        </Animated.Text>
        <Animated.Text
          className="text-white font-normal tracking-wide text-right"
          style={[subtitleAnimatedStyle, { top: -260, zIndex: 99 }]}
        >
          {`Stay informed. Stay connected.\n Smart notifications,\n powered by Expo.`}
        </Animated.Text>
      </View>

      {/* expo-image version */}
      <Image
        source={require("@/assets/images/20462748.png")}
        style={{
          width: 250,
          height: 250,
        }}
        contentFit="contain"
        priority="high"
      />
    </View>
  );
};

export default OnboardingSecondPage;
