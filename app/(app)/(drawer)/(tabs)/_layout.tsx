import { Stack, Tabs } from "expo-router";
import React from "react";

import tailwindColors from "@/utils/tailwindColors";
// import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import DrawerIcon from "@/components/navigator/DrawerIcon";
import { HEADER_ICON_SIZE } from "@/constants/constants";
import { useNavigationState } from "@react-navigation/native";

export default function TabLayout() {
  // const { user } = useUser();
  const state = useNavigationState((state) => state);

  const currentRouteName =
    state.routes[state.index]?.state?.routes?.[
      state.routes[state.index]?.state?.index || 0
    ]?.name || "";
  console.log(currentRouteName);

  const hideTabBarScreens = ["chats/chat_room"]; // 여기에 숨기고 싶은 화면 이름 추가

  const shouldHideTabBar = hideTabBarScreens.includes(currentRouteName);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];
  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: backgroundTheme,
        },
        headerTitleStyle: {
          color: foregroundTheme,
        },
        headerLeft: () => {
          return <DrawerIcon color={foregroundTheme} size={HEADER_ICON_SIZE} />;
        },
        headerTintColor: foregroundTheme,
        tabBarActiveTintColor: foregroundTheme,
        tabBarStyle: shouldHideTabBar
          ? { display: "none" }
          : {
              backgroundColor: backgroundTheme,
            },
        // detachInactiveScreens: true,
        tabBarInactiveTintColor: "gray",
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="files/index"
        options={{
          title: "Files",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats/index"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbox" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
