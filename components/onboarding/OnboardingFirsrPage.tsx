import { View, Platform } from "react-native";
import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { useOnboardingStage } from "@/zustand/onboarding/useOnboardingStage";

const ANIMATION_DELAY = 1000;
const TITLE_ANIMATION_DURATION = 500;
const SUBTITLE_ANIMATION_DURATION = TITLE_ANIMATION_DURATION + 500;

// Title Animation Constants
const TITLE_INITIAL_FONT_SIZE = 60;
const TITLE_FINAL_FONT_SIZE = 40;
const TITLE_INITIAL_TRANSLATE_Y = 0;
const TITLE_FINAL_TRANSLATE_Y = -40;
const TITLE_INITIAL_TRANSLATE_X = 0;
const TITLE_FINAL_TRANSLATE_X = 40;
const TITLE_INITIAL_OPACITY = 1;
const TITLE_FINAL_OPACITY = 0.9;

// Subtitle Animation Constants
const SUBTITLE_INITIAL_FONT_SIZE = 16;
const SUBTITLE_FINAL_FONT_SIZE = 16;
const SUBTITLE_INITIAL_TRANSLATE_Y = 280;
const SUBTITLE_FINAL_TRANSLATE_Y = 240;
const SUBTITLE_INITIAL_TRANSLATE_X = 400;
const SUBTITLE_FINAL_TRANSLATE_X = 60;
const SUBTITLE_INITIAL_OPACITY = 0;
const SUBTITLE_FINAL_OPACITY = 0.9;
const SUBTITLE_RESET_TRANSLATE_Y = 90;

// Image Animation Constants
const IMAGE_1_INITIAL_WIDTH = 180;
const IMAGE_1_INITIAL_HEIGHT = 180;
const IMAGE_1_INITIAL_LEFT = -190;
const IMAGE_1_FINAL_LEFT = -40;
const IMAGE_1_ANIMATION_DURATION = 500;
const IMAGE_1_ANIMATION_DELAY = 1000;

const IMAGE_2_INITIAL_WIDTH = 340;
const IMAGE_2_INITIAL_HEIGHT = 340;
const IMAGE_2_INITIAL_LEFT = -310;
const IMAGE_2_FINAL_LEFT = 0;
const IMAGE_2_ANIMATION_DURATION = 500;
const IMAGE_2_ANIMATION_DELAY = 1000;

type OnboardingFirsrPageProps = {
  showStage: boolean;
  setShowStage: (show: boolean) => void;
};

const OnboardingFirsrPage = () => {
  const { setTitleAnimationFinished, titleAnimationFinished } =
    useOnboardingStage();
  const isFocused = useIsFocused();

  const titleFontSize = useSharedValue(TITLE_INITIAL_FONT_SIZE);
  const titleTranslateY = useSharedValue(TITLE_INITIAL_TRANSLATE_Y);
  const titleTranslateX = useSharedValue(TITLE_INITIAL_TRANSLATE_X);
  const titleOpacity = useSharedValue(TITLE_INITIAL_OPACITY);
  const subtitleFontSize = useSharedValue(SUBTITLE_INITIAL_FONT_SIZE);
  const subtitleTranslateY = useSharedValue(SUBTITLE_INITIAL_TRANSLATE_Y);
  const subtitleTranslateX = useSharedValue(SUBTITLE_INITIAL_TRANSLATE_X);
  const subtitleOpacity = useSharedValue(SUBTITLE_INITIAL_OPACITY);
  const image1TranslateX = useSharedValue(IMAGE_1_INITIAL_LEFT);
  const image2TranslateX = useSharedValue(IMAGE_2_INITIAL_LEFT);

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      fontSize: titleFontSize.value,
      opacity: titleOpacity.value,
      transform: [
        { translateY: titleTranslateY.value },
        { translateX: titleTranslateX.value },
      ],
    };
  });
  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    return {
      fontSize: subtitleFontSize.value,
      opacity: subtitleOpacity.value,
      transform: [
        { translateY: subtitleTranslateY.value },
        { translateX: subtitleTranslateX.value },
      ],
    };
  });

  const image1AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: image1TranslateX.value }],
    };
  });
  const image2AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: image2TranslateX.value }],
    };
  });

  useEffect(() => {
    if (isFocused) {
      setTimeout(() => {
        titleFontSize.value = withTiming(TITLE_FINAL_FONT_SIZE, {
          duration: TITLE_ANIMATION_DURATION,
        });
        titleTranslateY.value = withTiming(TITLE_FINAL_TRANSLATE_Y, {
          duration: TITLE_ANIMATION_DURATION,
        });
        titleTranslateX.value = withTiming(TITLE_FINAL_TRANSLATE_X, {
          duration: TITLE_ANIMATION_DURATION,
        });
        titleOpacity.value = withTiming(TITLE_FINAL_OPACITY, {
          duration: TITLE_ANIMATION_DURATION,
        });
        subtitleFontSize.value = withTiming(SUBTITLE_FINAL_FONT_SIZE, {
          duration: SUBTITLE_ANIMATION_DURATION,
        });
        subtitleTranslateY.value = withTiming(SUBTITLE_FINAL_TRANSLATE_Y, {
          duration: SUBTITLE_ANIMATION_DURATION,
        });
        subtitleTranslateX.value = withTiming(SUBTITLE_FINAL_TRANSLATE_X, {
          duration: SUBTITLE_ANIMATION_DURATION,
        });
        subtitleOpacity.value = withTiming(SUBTITLE_FINAL_OPACITY, {
          duration: SUBTITLE_ANIMATION_DURATION,
        });
        setTimeout(() => {
          setTitleAnimationFinished(true);
        }, SUBTITLE_ANIMATION_DURATION);
      }, ANIMATION_DELAY);
      setTimeout(() => {
        image1TranslateX.value = withTiming(IMAGE_1_FINAL_LEFT, {
          duration: IMAGE_1_ANIMATION_DURATION,
        });
        image2TranslateX.value = withTiming(IMAGE_2_FINAL_LEFT, {
          duration: IMAGE_2_ANIMATION_DURATION,
        });
      }, IMAGE_1_ANIMATION_DELAY);
    }
    return () => {
      titleFontSize.value = TITLE_INITIAL_FONT_SIZE;
      titleTranslateY.value = TITLE_INITIAL_TRANSLATE_Y;
      titleTranslateX.value = TITLE_INITIAL_TRANSLATE_X;
      titleOpacity.value = TITLE_INITIAL_OPACITY;
      subtitleFontSize.value = SUBTITLE_INITIAL_FONT_SIZE;
      subtitleTranslateY.value = SUBTITLE_RESET_TRANSLATE_Y;
      subtitleTranslateX.value = SUBTITLE_INITIAL_TRANSLATE_X;
      subtitleOpacity.value = SUBTITLE_INITIAL_OPACITY;
      image1TranslateX.value = IMAGE_1_INITIAL_LEFT;
      image2TranslateX.value = IMAGE_2_INITIAL_LEFT;
    };
  }, [
    isFocused,
    setTitleAnimationFinished,
    titleFontSize,
    titleTranslateY,
    titleTranslateX,
    titleOpacity,
    subtitleFontSize,
    subtitleTranslateY,
    subtitleTranslateX,
    subtitleOpacity,
  ]);

  return (
    <View className="flex-1 flex-col items-center justify-center w-full h-full p-2xl ">
      <View
        className="flex flex-col items-center justify-center w-full h-[140px] 
      border-0 border-blue-500"
      >
        <Animated.Text
          className="text-white font-extrabold tracking-wide"
          style={[
            titleAnimatedStyle,
            {
              zIndex: 99,
              fontWeight: Platform.OS === "ios" ? "900" : "bold",
              letterSpacing: 1,
              textShadowColor: "rgba(0, 0, 0, 0.8)",
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 8,
              fontFamily: Platform.select({
                ios: "SF Pro Display",
                android: "Roboto",
                default: "System",
              }),
              textAlign: "center",
              includeFontPadding: false, // Android에서 폰트 패딩 제거
            },
          ]}
        >
          {`EXPO \nNOTIFICATION`}
        </Animated.Text>
        <Animated.Text
          className="text-white font-normal tracking-wide text-right"
          style={[subtitleAnimatedStyle, { top: -260, zIndex: 99 }]}
        >
          {`Stay informed. Stay connected.\n Smart notifications,\n powered by Expo.`}
        </Animated.Text>
      </View>
      {/* <View
        className="flex flex-col items-center justify-center w-full h-[250px]"
        // style={{
        //   borderWidth: 2,
        //   borderColor: "blue",
        //   backgroundColor: "rgba(255, 255, 255, 0.1)", // 디버깅을 위한 배경색
        // }}
      >
      </View> */}
      {/* expo-image 버전 */}
      {titleAnimationFinished && (
        <>
          <Animated.Image
            source={require("@/assets/images/3962334.png")}
            style={[
              image1AnimatedStyle,
              {
                width: IMAGE_1_INITIAL_WIDTH,
                height: IMAGE_1_INITIAL_HEIGHT,
                position: "relative",
                top: 100,
              },
            ]}
          />
          <Animated.Image
            source={require("@/assets/images/20462748.png")}
            style={[
              image2AnimatedStyle,
              {
                width: IMAGE_2_INITIAL_WIDTH,
                height: IMAGE_2_INITIAL_HEIGHT,
                position: "relative",
                top: 0,
              },
            ]}
          />
        </>
      )}

      {/* React Native 기본 Image로 백업 테스트 */}
      {/* <RNImage
          source={require("@/assets/images/20462748.png")}
          style={{
            width: 150,
            height: 150,
            backgroundColor: "rgba(0, 255, 0, 0.2)",
            position: "absolute",
            top: 10,
            right: 10,
          }}
          resizeMode="contain"
        /> */}
    </View>
  );
};

export default OnboardingFirsrPage;
