/*
2025-04-22 08:16:46

Zustand 버전으로 분해조립 해보자

2025-04-24 05:19:22
오버레이의 종류를 두면, 여러 종류의 매스킹 애니메이션을 만들 수 있을 것 같다.
Wibowo 와 Candillion 의 애니메이션 두가지를 가능하게 해보자. 

2025-04-28 12:00:11
Changed SystemBars from react-native-bars to react-native-edge-to-edge:
https://github.com/zoontek/react-native-edge-to-edge
Reason:
It was damn hard to control Snapshot Image Scaling with react-native-bars.
Usage:
    <SystemBars style="light" />

*/

// MaskAnimationProvider.tsx
import { useMaskAnimationStore } from "@/contexts/maskAnimationZustand";
import {
  Canvas,
  Circle,
  Group,
  Image,
  Mask,
  Rect,
} from "@shopify/react-native-skia";
import {
  useColorScheme,
  useColorScheme as useNativewindColorScheme,
} from "nativewind";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  PixelRatio,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import tailwindColors from "@/utils/tailwindColors";
// import { SystemBars } from "react-native-edge-to-edge";

export const { width: SCRN_WIDTH, height: SCRN_HEIGHT } =
  Dimensions.get("screen");
export const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } =
  Dimensions.get("window");

const safeAreaViewAndroid =
  Platform.OS === "android"
    ? StatusBar.currentHeight
      ? StatusBar.currentHeight
      : 0
    : 0;

type ColorSchemeProviderProps = {
  children: ReactNode;
};

const MaskAnimationProvider = ({ children }: ColorSchemeProviderProps) => {
  const { colorScheme } = useColorScheme();
  const { setColorScheme } = useNativewindColorScheme();
  const [initStatusBarBGColor, setInitStatusBarBGColor] = useState<string>("");

  const isDark = colorScheme === "dark";

  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];
  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];

  // Pixel Density for Snapshot Image Scaling
  const pd = PixelRatio.get();

  // SharedValue for Mask Animation
  const curtainWidth = useSharedValue(0);
  const circleRadius = useSharedValue(0);
  const circleCoordX = useSharedValue(0);
  const circleCoordY = useSharedValue(0);

  // Derived Values
  const derivedCircleX = useDerivedValue(() => circleCoordX?.value ?? 0);
  const derivedCircleY = useDerivedValue(() => circleCoordY?.value ?? 0);
  const derivedCircleRadius = useDerivedValue(() => circleRadius?.value ?? 0);

  // create ref
  const ref = useRef<View>(null);

  // Zustand hook
  const {
    statusBarStyle,
    curtainOverlay,
    circleOverlay,
    setRef,
    setCurtainOverlay,
    setCircleOverlay,
    setCurtainWidth,
    setCircleRadius,
    setCircleCoordX,
    setCircleCoordY,
  } = useMaskAnimationStore();

  // set ref
  useEffect(() => {
    console.log("safeAreaViewAndroid", safeAreaViewAndroid);
    setRef(ref);
    setCurtainOverlay(curtainOverlay);
    setCurtainWidth(curtainWidth);
    setCircleOverlay(circleOverlay);
    setCircleRadius(circleRadius);
    setCircleCoordX(circleCoordX);
    setCircleCoordY(circleCoordY);
    return () => {
      setRef(null);
      setCurtainOverlay(null);
      setCurtainWidth(curtainWidth);
      setCircleOverlay(null);
      setCircleRadius(circleRadius);
      setCircleCoordX(circleCoordX);
      setCircleCoordY(circleCoordY);
    };
  }, []);

  return (
    <>
      {/* <View className=" bg-blue-300 dark:bg-blue-600" style={{}}></View> */}
      <SafeAreaView>
        {/* <SystemBars style={colorScheme === "dark" ? "light" : "dark"} /> */}
        {/* <ExpoStatusBar
          translucent
          style={colorScheme === "light" ? "dark" : "light"}
        /> */}
        <StatusBar
          animated={false}
          backgroundColor={backgroundTheme}
          // translucent={true}
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        />
      </SafeAreaView>

      {/* <SystemBars
          animated={true}
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        /> */}

      {/* <View ref={ref} style={{ flex: 1 }} collapsable={false}> */}
      <View ref={ref} style={{ flex: 1 }} collapsable={false}>
        {children}
      </View>

      {curtainOverlay && (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          <Mask
            mode="luminance"
            mask={
              <Group>
                <Rect
                  x={0}
                  y={0}
                  width={SCRN_WIDTH}
                  height={SCRN_HEIGHT}
                  color="white"
                />
                <Rect
                  x={0}
                  y={0}
                  // Give the sharedValue itself, not sharedValue.value
                  width={curtainWidth}
                  height={SCRN_HEIGHT}
                  color="black"
                />
              </Group>
            }
          >
            <Image
              image={curtainOverlay}
              x={0}
              y={0}
              width={curtainOverlay.width() / pd}
              height={curtainOverlay.height() / pd} // Device Pixel Ratio Correction
              fit="cover"
            />
          </Mask>
        </Canvas>
      )}

      {circleOverlay && (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          <Mask
            mode="luminance"
            mask={
              <Group>
                <Rect
                  x={0}
                  y={0}
                  width={SCRN_WIDTH}
                  height={SCRN_HEIGHT}
                  color="white"
                />
                <Circle
                  cx={derivedCircleX}
                  cy={derivedCircleY}
                  r={derivedCircleRadius}
                  color="black"
                />
              </Group>
            }
          >
            <Image
              image={circleOverlay}
              x={0}
              y={0}
              width={circleOverlay.width() / pd}
              height={circleOverlay.height() / pd} // Device Pixel Ratio Correction
              fit="cover"
            />
          </Mask>
        </Canvas>
      )}
      {/* </View> */}
    </>
    // </SafeAreaProvider>
  );
};

export default MaskAnimationProvider;
