import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import tailwindColors from "@/utils/tailwindColors";
import { useNavigationState } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { ChatRoomProvider, useChatRoom } from "@/contexts/ChatRoomProvider";
import ChatRoomSubmenuTrigger from "@/components/chatRoom/ChatRoomSubmenuTrigger";
import ChatRoomNotificationTrigger from "@/components/chatRoom/ChatRoomNotificationTrigger";
import FileViewProvider from "@/contexts/FileViewProvider";
import { Ionicons } from "@expo/vector-icons";

// useChatRoom uses already cached chatRoomName from Context
// So, it's fast enough.
function ChatRoomHeaderTitle() {
  const { chatRoomName } = useChatRoom();
  return (
    <Text className="text-foreground dark:text-foreground-dark font-semibold text-lg">
      {chatRoomName}
    </Text>
  );
}

// useChatRoom uses already cached chatRoomId from Context
function ChatRoomHeaderRight() {
  const { chatRoomId } = useChatRoom();
  return (
    <View className="flex flex-row gap-x-xs">
      <ChatRoomNotificationTrigger chatRoomId={chatRoomId!} />
      <ChatRoomSubmenuTrigger chatRoomId={chatRoomId!} />
    </View>
  );
}

const FileViewerHeaderRight = ({
  foregroundTheme,
  backgroundTheme,
}: {
  foregroundTheme: string;
  backgroundTheme: string;
}) => {
  return (
    <View className="flex-row items-center gap-x-sm mr-sm">
      <TouchableOpacity
        onPress={() => {
          console.log("====StackHeaderRight onPress=====");
        }}
        className="bg-background dark:bg-background-dark rounded-full p-sm"
      >
        <Ionicons name="download-outline" size={24} color={foregroundTheme} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          console.log("====StackHeaderRight onPress=====");
        }}
        className="bg-background dark:bg-background-dark rounded-full p-sm"
      >
        <Ionicons name="trash-outline" size={24} color={foregroundTheme} />
      </TouchableOpacity>
    </View>
  );
};

const StackLayout = () => {
  const state = useNavigationState((state) => state);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const currentRouteName =
    state.routes[state.index]?.state?.routes?.[
      state.routes[state.index]?.state?.index || 0
    ]?.name || "";
  console.log(currentRouteName);

  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];
  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];

  return (
    <ChatRoomProvider>
      <FileViewProvider>
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
          <Stack.Screen
            name="uploaded_files"
            options={{
              headerLargeTitle: true,
              headerTitle: "Files ....",
              headerTransparent: true,
              headerBlurEffect: "light",
              headerRight: () => {
                return (
                  <FileViewerHeaderRight
                    foregroundTheme={foregroundTheme}
                    backgroundTheme={backgroundTheme}
                  />
                );
              },
            }}
          />
        </Stack>
      </FileViewProvider>
    </ChatRoomProvider>
  );
};

export default StackLayout;
