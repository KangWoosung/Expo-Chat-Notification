import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import tailwindColors from "@/utils/tailwindColors";
import { useNavigationState } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { ChatRoomProvider, useChatRoom } from "@/contexts/ChatRoomProvider";
import ChatRoomSubmenuTrigger from "@/components/chatRoom/ChatRoomSubmenuTrigger";
import ChatRoomNotificationTrigger from "@/components/chatRoom/ChatRoomNotificationTrigger";
import FileViewProvider, { useFileView } from "@/contexts/FileViewProvider";
import { Ionicons } from "@expo/vector-icons";
import { deleteFileCompletely } from "@/utils/deleteFileCompletely";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { HEADER_ICON_SIZE } from "@/constants/constants";
import { FilesCategory, useTabsLayoutStore } from "@/zustand/tabsLayoutStore";
import { handleFileDownload } from "@/utils/handleDownload";

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
  const { supabase } = useSupabase();
  const { fileId, setFileId, fileUrl, fileName } = useFileView();
  const { user } = useUser();
  const { filesCategory } = useTabsLayoutStore();

  if (!supabase || !user) {
    console.error("====StackHeaderRight supabase or user not available=====");
    return null;
  }

  return (
    <View className="flex-row items-center gap-x-sm mr-sm">
      <TouchableOpacity
        onPress={() => {
          console.log("====StackHeaderRight onPress=====");
          handleFileDownload(fileUrl!);
        }}
        className="bg-background dark:bg-background-dark rounded-full p-sm"
      >
        <Ionicons name="download-outline" size={24} color={foregroundTheme} />
      </TouchableOpacity>
      {filesCategory === FilesCategory.UPLOADED ? (
        <TouchableOpacity
          onPress={() => {
            console.log("====StackHeaderRight onPress=====");
            deleteFileCompletely({
              supabase,
              fileId: fileId,
              userId: user.id,
            });
          }}
          className="bg-background dark:bg-background-dark rounded-full p-sm"
        >
          <Ionicons
            name="trash-outline"
            size={HEADER_ICON_SIZE}
            color={foregroundTheme}
          />
        </TouchableOpacity>
      ) : (
        <Ionicons
          name="ban-outline"
          size={HEADER_ICON_SIZE}
          color={foregroundTheme}
        />
      )}
    </View>
  );
};

const StackLayout = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { filesCategory } = useTabsLayoutStore();

  // const state = useNavigationState((state) => state);
  // const currentRouteName =
  //   state.routes[state.index]?.state?.routes?.[
  //     state.routes[state.index]?.state?.index || 0
  //   ]?.name || "";
  // console.log(currentRouteName);

  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];
  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];

  const fileViewerTitle =
    filesCategory === FilesCategory.UPLOADED
      ? "Uploaded Files"
      : "Incoming Files";

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
              headerTitle: fileViewerTitle,
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
          <Stack.Screen
            name="app_options"
            options={{
              headerTitle: "App Options",
            }}
          />
          <Stack.Screen
            name="bottomsheet"
            options={{
              headerTitle: "Bottom Sheet",
            }}
          />
        </Stack>
      </FileViewProvider>
    </ChatRoomProvider>
  );
};

export default StackLayout;
