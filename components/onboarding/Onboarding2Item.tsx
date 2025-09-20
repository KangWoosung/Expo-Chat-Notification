import { View, Text, Dimensions, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { OnboardingItemType } from "@/app/onboarding/data";
import { Image } from "expo-image";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import SVGBlob from "./SVGBlob";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

type OnboardingItemProps = {
  item: OnboardingItemType;
  index: number;
  scrollX: SharedValue<number>;
};

const Onboarding2Item = ({ item, index, scrollX }: OnboardingItemProps) => {
  const circleSize = WIDTH;

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
    [scrollX, index]
  );

  return (
    <View
      className="flex-1 items-center justify-center border-0 border-blue-500"
      style={[{ width: WIDTH, height: HEIGHT }]}
    >
      <View className="absolute inset-0 items-center justify-start ">
        <Animated.View
          className="rounded-full"
          style={[
            {
              width: circleSize,
              height: circleSize,
              backgroundColor: item.baseColor,
            },
            circleAnimatedStyle,
          ]}
        />
        {/* <Animated.View
          className="absolute rounded-full"
          style={[
            {
              width: lottieSize,
              height: lottieSize,
              backgroundColor: "silver",
              top: -lottieSize / 2 + 80,
              right: -lottieSize / 2,
            },
          ]}
        /> */}
      </View>
      <SVGBlob item={item} index={index} scrollX={scrollX} />
      <Text>Onboarding2Item</Text>
      <Image
        source={item.imageUrl}
        style={{ width: WIDTH / 2, height: WIDTH / 2 }}
      />
      <Text>{item.title}</Text>
      <Text>{item.description}</Text>
    </View>
  );
};

export default Onboarding2Item;
