import { Dimensions, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import {
  withTiming,
  interpolate,
  Extrapolation,
  useDerivedValue,
} from "react-native-reanimated";
import { onboardingData } from "@/app/onboarding/data";
import { useOnboardingStage } from "@/zustand/onboarding/useOnboardingStage";
// import LinearGradient from "react-native-linear-gradient";
import {
  vec,
  Canvas,
  Circle,
  Mask,
  Rect,
  LinearGradient,
  Group,
} from "@shopify/react-native-skia";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// onboardingData에서 baseColor만 추출하여 배경색 배열 생성
const BGS = onboardingData.map((item) => item.baseColor);

export const INITIAL_CIRCLE_POS_X = -420;
export const INITIAL_CIRCLE_POS_Y = WINDOW_HEIGHT / 2 + 220;
export const INITIAL_CIRCLE_R = 600;
export const CIRCLE_ANIMATE_POS_X = INITIAL_CIRCLE_POS_X - 60;

type OnboardingStageProps = {
  stageDelay: number;
};

const OnboardingStage = ({ stageDelay }: OnboardingStageProps) => {
  const {
    scrollX,
    flatListIndex,
    titleAnimationFinished,
    setStageAnimationFinished,
    circleAnimatePosX,
  } = useOnboardingStage();
  const currentBgColor = BGS[flatListIndex.value];

  // Control Circle position by interpolate based on scrollX
  const interpolatedCircleX = useDerivedValue(() => {
    const currentIndex = Math.floor(scrollX.value / WINDOW_WIDTH);

    // Set inputRange for each page
    // The start point of the current page, the middle point(0.5), the start point of the next page
    const inputRange = [
      currentIndex * WINDOW_WIDTH, // The start point of the current page (0, WIDTH, 2*WIDTH...)
      (currentIndex + 0.5) * WINDOW_WIDTH, // The middle point of the page (0.5*WIDTH, 1.5*WIDTH...)
      (currentIndex + 1) * WINDOW_WIDTH, // The start point of the next page (WIDTH, 2*WIDTH...)
    ];

    // 원래 로직 복원: 애니메이션 위치 사용
    return interpolate(
      scrollX.value,
      inputRange,
      [circleAnimatePosX.value, INITIAL_CIRCLE_POS_X, INITIAL_CIRCLE_POS_X],
      Extrapolation.CLAMP
    );
  }, [scrollX, circleAnimatePosX]);

  // 첫 번째 페이지 애니메이션
  useEffect(() => {
    let stageAnimationTimeout: number;

    if (titleAnimationFinished) {
      stageAnimationTimeout = setTimeout(() => {
        circleAnimatePosX.value = withTiming(CIRCLE_ANIMATE_POS_X, {
          duration: 500,
        });
        setStageAnimationFinished(true);
      }, stageDelay);
    }

    return () => {
      if (stageAnimationTimeout) clearTimeout(stageAnimationTimeout);
      circleAnimatePosX.value = INITIAL_CIRCLE_POS_X;
    };
  }, [
    titleAnimationFinished,
    circleAnimatePosX,
    setStageAnimationFinished,
    stageDelay,
  ]);

  // 페이지 변경 시 애니메이션 트리거 (2페이지 이상)
  useEffect(() => {
    const currentIndex = flatListIndex.value;
    let pageChangeAnimationTimeout: number;

    if (currentIndex > 0) {
      // 페이지가 변경되면 즉시 초기 위치로 리셋
      circleAnimatePosX.value = INITIAL_CIRCLE_POS_X;

      // 잠시 후 애니메이션 시작
      pageChangeAnimationTimeout = setTimeout(() => {
        circleAnimatePosX.value = withTiming(CIRCLE_ANIMATE_POS_X, {
          duration: 500,
        });
      }, stageDelay);
    }

    return () => {
      if (pageChangeAnimationTimeout) clearTimeout(pageChangeAnimationTimeout);
    };
  }, [flatListIndex.value, circleAnimatePosX, stageDelay]);

  return (
    <Canvas style={styles.container}>
      {/* Black Background */}
      <Rect
        x={0}
        y={0}
        width={WINDOW_WIDTH}
        height={WINDOW_HEIGHT}
        color={currentBgColor}
      />

      {/* Show the Gradient only in the transparent Circle */}
      <Mask
        mode="luminance"
        mask={
          <Group>
            <Circle
              cx={INITIAL_CIRCLE_POS_X}
              cy={INITIAL_CIRCLE_POS_Y}
              r={INITIAL_CIRCLE_R}
              color="white" // Show the transparent Circle
            />
            <Circle
              cx={interpolatedCircleX}
              cy={INITIAL_CIRCLE_POS_Y}
              r={INITIAL_CIRCLE_R}
              color="black" // Hide the transparent Circle
            />
          </Group>
        }
      >
        <Rect x={0} y={0} width={WINDOW_WIDTH} height={WINDOW_HEIGHT}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(WINDOW_WIDTH, WINDOW_HEIGHT)}
            colors={["purple", "blue", "orange"]}
          />
        </Rect>
      </Mask>
    </Canvas>
  );
};

export default OnboardingStage;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});

/*

    <LinearGradient
      colors={["purple", "blue", "orange"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          animatedStyle,
          { backgroundColor: "transparent" },
        ]}
      ></Animated.View>
    </LinearGradient>


      <Canvas style={styles.container}>
       <Mask
        mode="luminance"
        mask={
          <Circle
            cx={width / 2}
            cy={height / 2}
            r={100}
            color="white" // 흰 부분만 보임
          />
        }
      >
        <Rect x={0} y={0} width={width} height={height} color="#888" />
      </Mask>

      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={["purple", "blue", "orange"]}
        />
      </Rect>
        </Canvas> 

    */
