import { View, Text, Dimensions } from "react-native";
import React, { useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

type StageAnimationProps = {
  setShowStage: (show: boolean) => void;
};

const StageAnimation = ({ setShowStage }: StageAnimationProps) => {
  const isFocused = useIsFocused();
  const titleFontSize = useSharedValue(36);
  const titleTranslateX = useSharedValue(0);
  const titleTranslateY = useSharedValue(0);
  const subtitleFontSize = useSharedValue(24);
  const subtitleTranslateX = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(0);

  // mount 후 애니메이션 실행
  useEffect(() => {
    let titleTimeout: number;
    let subtitleTimeout: number;
    let showStageTimeout: number;

    titleTimeout = setTimeout(() => {
      titleAnimation();
    }, 500);

    subtitleTimeout = setTimeout(() => {
      subtitleAnimation();
      showStageTimeout = setTimeout(() => {
        setShowStage(true);
      }, 500);
    }, 1000);

    return () => {
      // Clear all timeouts to prevent state updates on unmounted component
      if (titleTimeout) clearTimeout(titleTimeout);
      if (subtitleTimeout) clearTimeout(subtitleTimeout);
      if (showStageTimeout) clearTimeout(showStageTimeout);

      // Reset animation values
      titleFontSize.value = 36;
      titleTranslateX.value = 0;
      titleTranslateY.value = 0;
      subtitleFontSize.value = 24;
      subtitleTranslateX.value = 0;
      subtitleTranslateY.value = 0;
    };
  }, [isFocused]);

  // timeout functions
  const titleAnimation = useCallback(() => {
    titleFontSize.value = withTiming(isFocused ? 20 : 36, { duration: 500 }); // text-xl = 20
    titleTranslateX.value = withTiming(isFocused ? 100 : 0, { duration: 500 });
    titleTranslateY.value = withTiming(isFocused ? -40 : 0, { duration: 500 });
  }, [isFocused]);
  const subtitleAnimation = useCallback(() => {
    subtitleFontSize.value = withTiming(isFocused ? 14 : 24, { duration: 500 }); // text-xl = 20
    subtitleTranslateX.value = withTiming(isFocused ? 100 : 0, {
      duration: 500,
    });
    subtitleTranslateY.value = withTiming(isFocused ? -40 : 0, {
      duration: 500,
    });
  }, [isFocused]);

  // reanimated 스타일
  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      fontSize: titleFontSize.value,
      transform: [
        { translateX: titleTranslateX.value },
        { translateY: titleTranslateY.value },
      ],
    };
  });
  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    return {
      fontSize: subtitleFontSize.value,
      transform: [
        { translateX: subtitleTranslateX.value },
        { translateY: subtitleTranslateY.value },
      ],
    };
  });

  return (
    <View
      className="absolute top-0 left-0 right-0 bottom-0 justify-between items-center p-xl
      border-0 border-blue-500"
      pointerEvents="none"
      style={{
        width: WINDOW_WIDTH,
        height: WINDOW_WIDTH,
      }}
    >
      <View className="absolute top-0 border-0 border-green-500 w-full p-0 pt-2xl">
        <Animated.Text
          className="text-center font-pbold text-foreground dark:text-foreground-dark
          border-0 border-red-500"
          style={[titleAnimatedStyle, { zIndex: 999 }]}
        >
          Expo Notification App
        </Animated.Text>
      </View>

      <View className="absolute bottom-0 border-0 border-green-500 w-full py-2xl">
        <Animated.Text
          className="text-center font-pbold text-foreground dark:text-foreground-dark 
          border-0 border-blue-500"
          style={[subtitleAnimatedStyle, { zIndex: 999 }]}
        >
          {`Stay informed. Stay connected.\n Smart notifications,\n powered by Expo.`}
        </Animated.Text>
      </View>
    </View>
  );
};

export default StageAnimation;
