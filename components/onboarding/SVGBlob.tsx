import { View, Text, Dimensions } from "react-native";
import React, { useEffect } from "react";
import {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import Animated from "react-native-reanimated";
import { OnboardingItemType } from "@/app/onboarding/data";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

type OnboardingItemProps = {
  item: OnboardingItemType;
  index: number;
  scrollX: SharedValue<number>;
};

const SVGBlob = ({ item, index, scrollX }: OnboardingItemProps) => {
  const animationRange = [
    (index - 1) * WIDTH,
    index * WIDTH,
    (index + 1) * WIDTH,
  ];

  // 회전 애니메이션을 위한 SharedValue
  const rotation = useSharedValue(0);

  // 컴포넌트가 마운트될 때 회전 애니메이션 시작
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 10000,
        easing: Easing.linear, // 선형 easing으로 일정한 속도 유지
      }),
      -1, // 무한 반복
      false // 역방향 없이 계속 같은 방향으로 회전
    );
  }, []);

  // SVG 회전 애니메이션 스타일
  const svgRotationStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotation.value}deg`,
      },
    ],
  }));

  return (
    <View className="absolute inset-0 items-center justify-start">
      <Animated.View
        className="absolute "
        style={[
          {
            width: WIDTH * 1.5,
            height: WIDTH * 1.5,
            top: -WIDTH * 0.75 + 200,
            right: -WIDTH * 0.75 - 80,
          },
        ]}
      >
        <AnimatedSvg
          viewBox="0 0 200 200"
          className="absolute top-0 right-0"
          width={500}
          height={500}
          style={svgRotationStyle}
        >
          <Path
            fill={"#FFFFFF"}
            d="M44.6,-77.3C57.9,-69.5,69.1,-57.9,77.4,-44.4C85.8,-30.9,91.4,-15.4,89.2,-1.3C87,12.9,77,25.8,69,39.9C60.9,53.9,54.8,69.1,43.6,75.5C32.5,81.9,16.2,79.4,0.8,78C-14.5,76.5,-29.1,76,-42.5,71C-56,65.9,-68.3,56.2,-73.7,43.6C-79,31,-77.4,15.5,-75.3,1.3C-73.1,-13,-70.4,-26,-64.3,-37.4C-58.2,-48.7,-48.7,-58.3,-37.4,-67.4C-26.2,-76.4,-13.1,-84.8,1.3,-87C15.6,-89.2,31.2,-85.1,44.6,-77.3Z"
            transform="translate(100 100)"
            opacity={0.2}
          />
        </AnimatedSvg>
      </Animated.View>
    </View>
  );
};

export default SVGBlob;
