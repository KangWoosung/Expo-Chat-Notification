import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { resourceCache } from "@clerk/clerk-expo/resource-cache";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "@/styles/global.css";
import { NativewindThemeProvider } from "@/contexts/NativewindThemeProvider";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
// import { PushTokenProvider } from "@/contexts/PushTokenProvider";
import SupabaseProvider from "@/contexts/SupabaseProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAnimationStore } from "@/zustand/useAnimationStore";
import { createRef, useEffect, useState } from "react";
import { useOnBoardingStore } from "@/zustand/useOnBoardingStore";
import OnBoardingIndex from "./onboarding";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ONBOARDING_FLAG_ROOT_LAYOUT } from "@/constants/constants";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { GlobalBottomSheet } from "@/components/modals/GlobalBottomSheet";
import { queryClient } from "@/lib/queryClient";
import { NotificationProvider } from "@/contexts/NotificationProvider";
// import UnreadMessagesCountProvider from "@/contexts/UnreadMessagesCountProvider";
import { ChatRoomsProvider } from "@/contexts/ChatRoomsProvider";

// Global Dealing with Bottom Sheet
// export const globalSheetRef = { current: null as BottomSheetModal | null };
// 단순히 이 한 줄만 바꾸면 됩니다:
export const globalSheetRef = createRef<BottomSheetModal>();

export default function RootLayout() {
  const [onBoardingFlag, setOnBoardingFlag] = useState(false);
  const { showOnBoarding, setShowOnBoarding } = useOnBoardingStore();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Global Accessibility Setting for all animations
  const initAccessibility = useAnimationStore((s) => s.initAccessibility);

  useEffect(() => {
    initAccessibility();
  }, []);

  ////////////////////////////////////////////////
  // Dealing with OnBoarding
  // Storage will be negative because there's no value by default.
  // by factory default, onBoardingFlag is true
  useEffect(() => {
    // AsyncStorage에서 onBoardingFlag 가져오기
    // const loadOnBoardingFlag = async () => {
    //   const onBoardingFlag = await AsyncStorage.getItem(
    //     ONBOARDING_FLAG_ROOT_LAYOUT
    //   );
    //   if (onBoardingFlag) {
    //     setOnBoardingFlag(onBoardingFlag === "true");
    //   }
    //   if (!showOnBoarding) {
    //     setOnBoardingFlag(false);
    //   }
    // };
    // loadOnBoardingFlag();
  }, []);
  ////////////////////////////////////////////////

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      __experimental_resourceCache={resourceCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || ""}
    >
      <ClerkLoaded>
        <QueryClientProvider client={queryClient}>
          <SupabaseProvider>
            <NotificationProvider>
              {/* <UnreadMessagesCountProvider> */}
              <ChatRoomsProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <NativewindThemeProvider>
                    <SafeAreaProvider>
                      {/* <SafeAreaView className="flex-1"> */}
                      <BottomSheetModalProvider>
                        {/* 온보딩 플래그에 따라 내부 컨텐츠만 바꾼다 (Provider 순서 불변) */}
                        {!onBoardingFlag ? (
                          <>
                            <Stack
                              initialRouteName="(app)"
                              screenOptions={{
                                headerShown: false,
                              }}
                            >
                              <Stack.Screen
                                name="(app)"
                                options={{ headerShown: false }}
                              />
                              <Stack.Screen
                                name="auth"
                                options={{ headerShown: false }}
                              />
                              <Stack.Screen
                                name="sso-callback"
                                options={{ headerShown: false }}
                              />
                              <Stack.Screen
                                name="+not-found"
                                options={{ headerShown: false }}
                              />
                            </Stack>
                            {/* 전역에서 하나의 모달을 실제로 렌더링 */}
                            <GlobalBottomSheet />
                          </>
                        ) : (
                          <OnBoardingIndex />
                        )}
                      </BottomSheetModalProvider>
                      {/* </SafeAreaView> */}
                      <StatusBar style="auto" />
                    </SafeAreaProvider>
                  </NativewindThemeProvider>
                </GestureHandlerRootView>
              </ChatRoomsProvider>
              {/* </UnreadMessagesCountProvider> */}
            </NotificationProvider>
          </SupabaseProvider>
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
  // }

  // Send to OnBoarding for onBoarding case
  // return (
  //   <GestureHandlerRootView style={{ flex: 1 }}>
  //     <OnBoardingIndex />
  //   </GestureHandlerRootView>
  // );
}
