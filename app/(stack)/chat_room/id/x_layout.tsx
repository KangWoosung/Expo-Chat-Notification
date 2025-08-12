import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import tailwindColors from "@/utils/tailwindColors";
import { useColorScheme } from "nativewind";

const ChatUILayout = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];
  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: backgroundTheme,
        },
        headerTitleStyle: {
          color: foregroundTheme,
        },
      }}
    >
      <Stack.Screen name="[id]" />
    </Stack>
  );
};

export default ChatUILayout;
