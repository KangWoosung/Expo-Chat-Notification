import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { ErrorBoundary, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { resourceCache } from "@clerk/clerk-expo/resource-cache";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

import { useColorScheme } from "@/hooks/useColorScheme";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "@/styles/global.css";
import { NativewindThemeProvider } from "@/contexts/NativewindThemeProvider";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { PushTokenProvider } from "@/contexts/PushTokenProvider";
import SupabaseProvider from "@/contexts/SupabaseProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분간 데이터를 fresh로 간주
      gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

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
            <PushTokenProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <NativewindThemeProvider>
                  <SafeAreaProvider>
                    {/* <SafeAreaView className="flex-1"> */}
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
                    {/* </SafeAreaView> */}
                    <StatusBar style="auto" />
                  </SafeAreaProvider>
                </NativewindThemeProvider>
              </GestureHandlerRootView>
            </PushTokenProvider>
          </SupabaseProvider>
        </QueryClientProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
