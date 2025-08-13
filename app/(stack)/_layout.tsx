import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import tailwindColors from "@/utils/tailwindColors";
import { useNavigationState } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { ChatRoomProvider, useChatRoom } from "@/contexts/ChatRoomContext";
import ChatRoomSubmenuTrigger from "@/components/chatRoom/ChatRoomSubmenuTrigger";
import ChatRoomNotificationTrigger from "@/components/chatRoom/ChatRoomNotificationTrigger";

function ChatRoomHeaderTitle() {
  const { chatRoomName } = useChatRoom();

  return (
    <Text className="text-foreground dark:text-foreground-dark font-semibold text-lg">
      {chatRoomName}
    </Text>
  );
}

function ChatRoomHeaderRight() {
  const { chatRoomId } = useChatRoom();

  return (
    <View className="flex flex-row gap-x-xs">
      <ChatRoomNotificationTrigger chatRoomId={chatRoomId!} />
      <ChatRoomSubmenuTrigger chatRoomId={chatRoomId!} />
    </View>
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
            headerTitle: () => <ChatRoomHeaderTitle />,
            headerRight: () => <ChatRoomHeaderRight />,
          }}
        />
      </Stack>
    </ChatRoomProvider>
  );
};

export default StackLayout;
