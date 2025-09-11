import { View, Text, StyleSheet, Dimensions } from "react-native";
import React from "react";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { OnboardingItemType } from "@/app/onboarding/data";

type OnboardingDefaultItemProps = {
  item: OnboardingItemType;
  index: number;
  scrollX: SharedValue<number>;
};

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

const OnboardingDefaultItem = ({
  item,
  index,
  scrollX,
}: OnboardingDefaultItemProps) => {
  const inputRange = [(index - 1) * WIDTH, index * WIDTH, (index + 1) * WIDTH];

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const opacityAnimation = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateYAnimation = interpolate(
      scrollX.value,
      inputRange,
      [100, 0, 100],
      Extrapolation.CLAMP
    );

    return {
      opacity: opacityAnimation,
      transform: [{ translateY: translateYAnimation }],
    };
  }, [index]);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolation.CLAMP
    );
    const rotate = `${interpolate(
      scrollX.value,
      inputRange,
      [30, 0, -30],
      Extrapolation.CLAMP
    )}deg`;
    const opacityAnimation = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    // console.log("scrollX.value", scrollX.value);
    // console.log("index", index);
    // console.log(`Item ${index} - Scale:`, scale); // scale 값 확인

    return {
      transform: [{ scale }, { rotate }],
      opacity: opacityAnimation,
      width: WIDTH * 0.4,
      height: WIDTH * 0.4,
    };
  }, [index]);

  return (
    <>
      <View className=" items-center justify-center" style={{ flex: 0.7 }}>
        <Animated.Image
          source={item.imageUrl}
          style={[styles.onboardingImage, imageAnimatedStyle]}
        />
      </View>
      <Animated.View
        className="items-center justify-center"
        style={[{ flex: 0.3 }, titleAnimatedStyle]}
      >
        <Text className="text-2xl font-bold mb-2 text-white text-center">
          {item.title}
        </Text>
        <Text className="text-base font-light mb-2 text-white text-center">
          {item.description}
        </Text>
      </Animated.View>
    </>
  );
};

export default OnboardingDefaultItem;

const styles = StyleSheet.create({
  onboardingImage: {
    width: WIDTH / 2,
    height: WIDTH / 2,
    // objectFit: "contain",
  },
});
