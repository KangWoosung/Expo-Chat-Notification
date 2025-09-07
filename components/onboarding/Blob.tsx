import { View, Text, Share, Dimensions } from "react-native";
import React from "react";
import onboardingData, { OnboardingItemType } from "@/app/onboarding/data";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

// onboardingData에서 baseColor만 추출하여 배경색 배열 생성
const BGS = onboardingData.map((item) => item.baseColor);

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

type BlobProps = {
  scrollX: SharedValue<number>;
};

const Blob = ({ scrollX }: BlobProps) => {
  const blobColors = BGS.flatMap((color, index) =>
    index === 0 ? [color] : [color, color]
  );

  const inputRange = Array.from(
    { length: onboardingData.length },
    (_, i) => i * WIDTH
  );

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      onboardingData.map((_, i) => {
        // scrollX.value를 WIDTH로 나누어 현재 페이지 위치를 계산
        return i === Math.round(scrollX.value / WIDTH) ? 1 : 0.1;
      }),
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      onboardingData.map((_, i) => {
        // scrollX.value를 WIDTH로 나누어 현재 페이지 위치를 계산
        return i === Math.round(scrollX.value / WIDTH) ? 1 : 0.1;
      }),
      Extrapolation.CLAMP
    );

    const colorIndex = Math.floor(
      interpolate(
        scrollX.value,
        [0, (onboardingData.length - 1) * WIDTH],
        [0, blobColors.length - 1],
        Extrapolation.CLAMP
      )
    );

    // const skewX = interpolate(
    //   scrollX.value,
    //   [0, (onboardingData.length - 1) * WIDTH],
    //   [0, 15],
    //   Extrapolation.CLAMP
    // );

    const backgroundColor = blobColors[colorIndex % blobColors.length];

    // console.log("skewX value:", skewX);
    // console.log("colorIndex ", colorIndex);
    // console.log("backgroundColor ", backgroundColor);
    // console.log("opacity ", opacity);
    // console.log("scale ", scale);
    // { skewX: `${skewX}deg` }

    return {
      opacity,
      backgroundColor,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: HEIGHT * 1.2,
          height: HEIGHT * 1.2,
          borderRadius: (HEIGHT * 1.2) / 2,
          // borderWidth: 1,
          // borderColor: "white",
          top: -HEIGHT * 0.6,
          left: -WIDTH * 0.6,
          position: "absolute",
        },
        animatedStyle,
      ]}
    />
  );
};

export default Blob;
