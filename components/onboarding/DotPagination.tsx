import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import React, { useState } from "react";
import onboardingData, { OnboardingItemType } from "@/app/onboarding/data";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

type DotPaginationProps = {
  screenData: OnboardingItemType[];
  index: number;
  scrollX: SharedValue<number>;
  handleNext: () => void;
};

const DotPagination = ({
  screenData,
  index,
  scrollX,
  handleNext,
}: DotPaginationProps) => {
  return (
    <View className="absolute bottom-28 flex flex-row items-center justify-between gap-20">
      <View className="flex flex-row items-center justify-center gap-4">
        {screenData.map((_, i) => {
          return (
            <DotIndicator
              key={`dot-indicator-${i}`}
              index={i}
              scrollX={scrollX}
            />
          );
        })}
      </View>
      <NextButton
        scrollX={scrollX}
        totalSize={screenData.length}
        onPress={handleNext}
        style={{
          right: 0,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 100,
          backgroundColor: "rgb(243 244 246)",
        }}
      />
    </View>
  );
};

type NextButtonProps = {
  scrollX: SharedValue<number>;
  totalSize: number;
  onPress: () => void;
  style?: ViewStyle;
};

function NextButton({ scrollX, totalSize, onPress, style }: NextButtonProps) {
  const isPressed = useSharedValue(false);
  const rippleScale = useSharedValue(1);
  const [isLastPage, setIsLastPage] = useState(false);

  useAnimatedReaction(
    () => Math.round(scrollX.value / WIDTH) === totalSize - 1,
    (isLast) => {
      runOnJS(setIsLastPage)(isLast);
    },
    [totalSize]
  );

  const handlePress = () => {
    onPress();
  };

  const handlePressIn = () => {
    isPressed.value = true;
    rippleScale.value = withSpring(0.7, {
      damping: 15,
      stiffness: 100,
    });
  };

  const handlePressOut = () => {
    isPressed.value = false;
    rippleScale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: rippleScale.value },
        { translateY: withSpring(isPressed.value ? 2 : 0) },
      ],
      opacity: withSpring(isPressed.value ? 0.8 : 1),
    };
  });

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[{}, style, buttonAnimatedStyle]}
    >
      <Text>{isLastPage ? "Start" : "Next"}</Text>
    </AnimatedTouchableOpacity>
  );
}

type DotIndicatorProps = {
  index: number;
  scrollX: SharedValue<number>;
};

function DotIndicator({ index, scrollX }: DotIndicatorProps) {
  const inputRange = [(index - 1) * WIDTH, index * WIDTH, (index + 1) * WIDTH];

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1.4, 0.8],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [
        {
          scale: withSpring(scale, {
            damping: 10,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  return (
    <Animated.View
      key={`dot-indicator-${index}`}
      style={[
        {
          height: 10,
          width: 10,
          borderRadius: 5,
          backgroundColor: "rgb(243 244 246)",
        },
        animatedStyle,
      ]}
    />
  );
}

export default DotPagination;
