import { Dimensions } from "react-native";
import React from "react";
import Animated, {
  useDerivedValue,
  interpolate,
  Extrapolation,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useOnboardingStage } from "@/zustand/onboarding/useOnboardingStage";
import {
  INITIAL_CIRCLE_POS_X,
  INITIAL_CIRCLE_POS_Y,
  INITIAL_CIRCLE_R,
} from "./OnboardingStage";
import { onboardingData } from "@/app/onboarding/data";
import {
  convertSkiaCenterToViewLeft,
  convertSkiaCenterToViewTop,
} from "@/utils/convertSkiaToView";

const { width: WINDOW_WIDTH } = Dimensions.get("window");

// onboardingData에서 baseColor만 추출하여 배경색 배열 생성
const BGS = onboardingData.map((item) => item.baseColor);

const OnboardingOverlay = () => {
  const { scrollX, circleAnimatePosX, flatListIndex } = useOnboardingStage();
  const currentBgColor = BGS[flatListIndex.value];

  // OnboardingStage의 Circle.black과 동일한 interpolation 로직
  const interpolatedCircleX = useDerivedValue(() => {
    const currentIndex = Math.floor(scrollX.value / WINDOW_WIDTH);

    // Set inputRange for each page
    // The start point of the current page, the middle point(0.5), the start point of the next page
    const inputRange = [
      currentIndex * WINDOW_WIDTH, // The start point of the current page (0, WIDTH, 2*WIDTH...)
      (currentIndex + 0.5) * WINDOW_WIDTH, // The middle point of the page (0.5*WIDTH, 1.5*WIDTH...)
      (currentIndex + 1) * WINDOW_WIDTH, // The start point of the next page (WIDTH, 2*WIDTH...)
    ];

    // In the current page, the animation position, in the middle point, the original position, in the next page the original position
    return interpolate(
      scrollX.value,
      inputRange,
      [
        convertSkiaCenterToViewLeft(circleAnimatePosX.value),
        convertSkiaCenterToViewLeft(INITIAL_CIRCLE_POS_X),
        convertSkiaCenterToViewLeft(INITIAL_CIRCLE_POS_X),
      ],
      Extrapolation.CLAMP
    );
  }, [scrollX, circleAnimatePosX]);

  const overlayStyle = useAnimatedStyle(() => {
    return {
      left: interpolatedCircleX.value,
    };
  });

  return (
    <Animated.View
      pointerEvents="none" // 터치 이벤트를 통과시켜 스크롤 방해하지 않음
      style={[
        {
          position: "absolute",
          top: convertSkiaCenterToViewTop(INITIAL_CIRCLE_POS_Y), // Skia 중심점을 View 위쪽 모서리로 변환
          width: INITIAL_CIRCLE_R * 2, // Circle의 지름
          height: INITIAL_CIRCLE_R * 2, // Circle의 지름
          borderRadius: INITIAL_CIRCLE_R, // 완전한 원형
          backgroundColor: currentBgColor, // 반투명하게 설정하여 디버깅 가능
          zIndex: 900, // OnboardingStage 위에 위치
        },
        overlayStyle,
      ]}
    />
  );
};

export default OnboardingOverlay;
