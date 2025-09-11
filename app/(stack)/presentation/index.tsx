/*
2025-09-09 06:54:11

Try to implement presentation work at:
https://www.youtube.com/shorts/ZDieZ1OA0Wc

with Reanimated and SVG

Animation Conti... 
1. Fade In Hero Section
2. transition Hero Section to 50%
3. Split Stage
4. Slide In Square
5. Slide In Circle
6. Slide In Wide Rect


*/

import { View, Text, Dimensions, StyleSheet, Pressable } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Canvas, Group, Mask, Rect } from "@shopify/react-native-skia";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";
import StageAnimation from "./StageAnimation";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// Animation Conti Constants
const STAGE_SPLIT_OFFSET = 60;
const STAGE_SPLIT_WIDTH = 30;
const STAGE_SPLIT_DURATION = 1000;
const STAGE_SPLIT_DELAY = 500;
const STAGE_RIGHT_POS = WINDOW_WIDTH - STAGE_SPLIT_OFFSET - STAGE_SPLIT_WIDTH;
const STAGE_RIGHT_WIDTH = WINDOW_WIDTH - STAGE_RIGHT_POS - STAGE_SPLIT_WIDTH;
const INITIAL_SQUARE_X_OFFSET = 30;
const SQUARE_X_MOVE_LIMIT = 30;
const INITIAL_CIRCLE_X_OFFSET = 0;
const CIRCLE_X_MOVE_LIMIT = 20;
const INITIAL_WIDE_RECT_X_OFFSET = 30;
const WIDE_RECT_X_MOVE_LIMIT = 20;
const WIDE_RECT_WIDTH_MOVE_LIMIT = 20;
const INSIDE_STAGE_ANIMATION_DELAY = 200;

const PresentationIndex = () => {
  const [showStage, setShowStage] = useState(false);
  const isFocused = useIsFocused();
  const curtainWidth = useSharedValue(STAGE_SPLIT_OFFSET + STAGE_SPLIT_WIDTH);
  const squareOpacity = useSharedValue(0);
  const squareX = useSharedValue(INITIAL_SQUARE_X_OFFSET);
  const circleOpacity = useSharedValue(0);
  const circleX = useSharedValue(INITIAL_CIRCLE_X_OFFSET);
  const wideRectOpacity = useSharedValue(0);
  const wideRectX = useSharedValue(INITIAL_WIDE_RECT_X_OFFSET);
  const wideRectWidth = useSharedValue(WINDOW_WIDTH / 2);

  useEffect(() => {
    console.log("wideRectWidth", wideRectWidth.value);
    return () => {
      setShowStage(false);
    };
  }, []);

  useEffect(() => {
    if (isFocused) {
      setShowStage(false);
    }
  }, [isFocused]);

  const squareAnimationStyle = useAnimatedStyle(() => ({
    opacity: squareOpacity.value,
    left: squareX.value,
  }));

  const circleAnimationStyle = useAnimatedStyle(() => ({
    opacity: circleOpacity.value,
    left: circleX.value,
  }));

  const wideRectAnimationStyle = useAnimatedStyle(() => ({
    opacity: wideRectOpacity.value,
    left: wideRectX.value,
  }));

  const animateAction = useCallback(() => {
    // curtainWidth.value = STAGE_SPLIT_OFFSET + STAGE_SPLIT_WIDTH;
    setTimeout(() => {
      curtainWidth.value = withTiming(STAGE_SPLIT_OFFSET, {
        duration: STAGE_SPLIT_DURATION,
      });
    }, STAGE_SPLIT_DELAY);
  }, [curtainWidth]);

  const squareAction = useCallback(() => {
    squareOpacity.value = 0;
    squareX.value = INITIAL_SQUARE_X_OFFSET;
    setTimeout(() => {
      squareOpacity.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      squareX.value = withSpring(
        INITIAL_SQUARE_X_OFFSET + SQUARE_X_MOVE_LIMIT,
        {
          damping: 15,
          stiffness: 150,
        }
      );
    }, STAGE_SPLIT_DELAY + STAGE_SPLIT_DURATION);
  }, [squareOpacity, squareX]);

  const circleAction = useCallback(() => {
    circleOpacity.value = 0;
    circleX.value = INITIAL_CIRCLE_X_OFFSET;
    setTimeout(
      () => {
        circleOpacity.value = withSpring(1, {
          damping: 15,
          stiffness: 150,
        });
        circleX.value = withSpring(
          INITIAL_CIRCLE_X_OFFSET + CIRCLE_X_MOVE_LIMIT,
          {
            damping: 15,
            stiffness: 150,
          }
        );
      },
      STAGE_SPLIT_DELAY + STAGE_SPLIT_DURATION + INSIDE_STAGE_ANIMATION_DELAY
    );
  }, [circleOpacity, circleX]);

  const wideRectAction = useCallback(() => {
    wideRectOpacity.value = 0;
    wideRectX.value = INITIAL_WIDE_RECT_X_OFFSET;
    wideRectWidth.value = WINDOW_WIDTH / 2;
    setTimeout(
      () => {
        wideRectOpacity.value = withSpring(1, {
          damping: 15,
          stiffness: 150,
        });
        wideRectX.value = withSpring(
          INITIAL_WIDE_RECT_X_OFFSET + WIDE_RECT_X_MOVE_LIMIT,
          {
            damping: 15,
            stiffness: 150,
          }
        );
        wideRectWidth.value = withSpring(
          WINDOW_WIDTH / 2 + WIDE_RECT_WIDTH_MOVE_LIMIT,
          {
            damping: 15,
            stiffness: 150,
          }
        );
      },
      STAGE_SPLIT_DELAY +
        STAGE_SPLIT_DURATION +
        INSIDE_STAGE_ANIMATION_DELAY * 2
    );
  }, [wideRectOpacity, wideRectX, wideRectWidth]);

  // 애니메이션 실행
  // useEffect(() => {
  //   animateAction();
  // }, [animateAction]);

  // // Square Animation
  // useEffect(() => {
  //   squareAction();
  //   circleAction();
  //   wideRectAction();
  // }, [squareAction]);

  useEffect(() => {
    setTimeout(() => {
      // setShowStage(true);
      animateAction();
      squareAction();
      circleAction();
      wideRectAction();
    }, 0);
  }, [showStage]);

  return (
    <View
      className="flex-1 relative justify-start items-start 
        bg-background dark:bg-background-dark w-full h-full
        border-0 border-red-500"
    >
      <StageAnimation setShowStage={setShowStage} />

      {showStage && (
        <View>
          <Canvas
            style={{ width: WINDOW_WIDTH, height: WINDOW_WIDTH }}
            pointerEvents="none"
          >
            <Mask
              mode="luminance"
              mask={
                <Group>
                  {/* mask 전체 영역을 흰색으로 채움 */}
                  <Rect
                    key="Rect_white"
                    x={0}
                    y={0}
                    width={WINDOW_WIDTH}
                    height={WINDOW_WIDTH}
                    color="white"
                  />
                  <Rect
                    key="Rect_black_right"
                    x={WINDOW_WIDTH - STAGE_RIGHT_POS}
                    y={0}
                    width={WINDOW_WIDTH - STAGE_RIGHT_WIDTH}
                    height={WINDOW_WIDTH}
                    color="black"
                  />
                  {/* Rect 영역만 검정으로 → 구멍 */}
                  <Rect
                    key="Rect_black_left"
                    x={0}
                    y={0}
                    // Give the sharedValue itself, not sharedValue.value
                    width={curtainWidth}
                    height={WINDOW_WIDTH}
                    color="black"
                  />
                </Group>
              }
            >
              {/* 이 children이 마스크 적용 대상이 됨 */}
              {/* 단색 tomato Rect를 넣으면 foreground 전체 */}
              <Rect
                x={0}
                y={0}
                width={WINDOW_WIDTH}
                height={WINDOW_HEIGHT}
                color="tomato"
              />

              {/*  Additional Reanimated Components  */}
              {/* 여기서 중간 레이어 추가 가능 */}
            </Mask>
          </Canvas>
          <Animated.View
            style={[
              squareAnimationStyle,
              {
                top: 40,
                width: WINDOW_WIDTH / 3,
                height: WINDOW_WIDTH / 4,
                backgroundColor: "gold",
                position: "absolute",
                zIndex: 80,
              },
            ]}
          >
            <Text>Gold</Text>
          </Animated.View>
          <Animated.View
            style={[
              circleAnimationStyle,
              {
                top: 100,
                width: WINDOW_WIDTH / 1.5,
                height: WINDOW_WIDTH / 1.5,
                backgroundColor: "silver",
                borderRadius: WINDOW_WIDTH / 2.5,
                position: "absolute",
                zIndex: 90,
              },
            ]}
          >
            <Text>Silver</Text>
          </Animated.View>
          <Animated.View
            style={[
              wideRectAnimationStyle,
              {
                top: 340,
                height: 80,
                width: WINDOW_WIDTH / 2 + WIDE_RECT_WIDTH_MOVE_LIMIT,
                backgroundColor: "cyan",
                position: "absolute",
                zIndex: 100,
              },
            ]}
          >
            <Text>Cyan</Text>
          </Animated.View>
          <Animated.View
            className="absolute top-0 h-full bg-background dark:bg-background-dark"
            style={{
              width: STAGE_SPLIT_OFFSET,
              zIndex: 110,
            }}
          />
        </View>
      )}
      <Pressable
        className="absolute bottom-0 left-0 right-0 m-4 p-4 rounded-lg bg-primary dark:bg-primary-dark"
        onPress={() => {
          setShowStage(true);
          animateAction();
          squareAction();
          circleAction();
          wideRectAction();
        }}
      >
        <Text className="text-foreground dark:text-foreground-dark">
          Press me
        </Text>
      </Pressable>
    </View>
  );
};

export default PresentationIndex;
