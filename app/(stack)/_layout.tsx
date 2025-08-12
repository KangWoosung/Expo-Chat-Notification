import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import tailwindColors from "@/utils/tailwindColors";
import { useNavigationState } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ChatRoomProvider, useChatRoom } from "@/contexts/ChatRoomContext";

function ChatRoomHeader() {
  const { chatRoomName } = useChatRoom();

  return (
    <Text className="text-foreground dark:text-foreground-dark font-semibold text-lg">
      {chatRoomName}
    </Text>
  );
}

const StackLayout = () => {
  const state = useNavigationState((state) => state);

  const currentRouteName =
    state.routes[state.index]?.state?.routes?.[
      state.routes[state.index]?.state?.index || 0
    ]?.name || "";
  console.log(currentRouteName);

  const hideTabBarScreens = ["chats/chat_room"];

  const shouldHideTabBar = hideTabBarScreens.includes(currentRouteName);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];
  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];

  return (
    <ChatRoomProvider>
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
          headerTintColor: foregroundTheme,
        }}
      >
        <Stack.Screen
          name="chat_room"
          options={{
            headerTitle: () => <ChatRoomHeader />,
          }}
        />
      </Stack>
    </ChatRoomProvider>
  );
};

export default StackLayout;
