import React from "react";
import { View, Dimensions, StyleSheet, Text } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { OnboardingItemType } from "@/app/onboarding/data";

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

type OnboardingItemProps = {
  item: OnboardingItemType;
  index: number;
  scrollX: SharedValue<number>;
};

function OnboardingItem({ item, index, scrollX }: OnboardingItemProps) {
  const inputRange = [(index - 1) * WIDTH, index * WIDTH, (index + 1) * WIDTH];

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

  return (
    <View
      className="flex-1 items-center justify-center p-5"
      style={[{ width: WIDTH }]}
    >
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
    </View>
  );
}

export default OnboardingItem;

const styles = StyleSheet.create({
  onboardingImage: {
    width: WIDTH / 2,
    height: WIDTH / 2,
    // objectFit: "contain",
  },
});
