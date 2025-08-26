/*
2025-08-24 19:22:42

헤더의 아이콘, 노티피케이션 벨 등이 모두 여기서 관리되고 있기 때문에, 
해당 데이터 및 펑션이 여기서 확보되어야만 한다. 
Zustand 가 등장해야 이 과제가 해결될 수 있다. 

(tabs)/_layout.tsx 에서 필요로 하는 데이터와 펑션들의 목록을 정리해보자. 
-index
-- notification.count --unread
-files
-- setFilesCategory
-chats
-- notification.count --unread
-- createChatRoom

Zustand Store tabsLayoutStore 를 추가해 주었다. 
- 파일 카테고리 관리
- 채팅방 생성
- 노티피케이션 카운트 관리


*/
import { router, Stack, Tabs } from "expo-router";
import React from "react";

import tailwindColors from "@/utils/tailwindColors";
// import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import DrawerIcon from "@/components/navigator/DrawerIcon";
import { HEADER_ICON_SIZE } from "@/constants/constants";
import { useNavigationState } from "@react-navigation/native";
import { Text, TouchableOpacity, View } from "react-native";
import { FilesCategory, useTabsLayoutStore } from "@/zustand/tabsLayoutStore";
// import { useFileView } from "@/contexts/FileViewProvider";

export default function TabLayout() {
  const state = useNavigationState((state) => state);
  const { filesCategory, setFilesCategory, notificationCount } =
    useTabsLayoutStore();

  const currentRouteName =
    state.routes[state.index]?.state?.routes?.[
      state.routes[state.index]?.state?.index || 0
    ]?.name || "";
  console.log("====TabLayout currentRouteName=====", currentRouteName);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];
  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];

  const fileViewerTitle =
    filesCategory === FilesCategory.UPLOADED
      ? "Uploaded Files"
      : "Incoming Files";

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
        tabBarStyle: {
          backgroundColor: backgroundTheme,
        },
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
          headerRight: () => (
            <IndexHeaderRight
              foregroundTheme={foregroundTheme}
              notificationCount={notificationCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="files/index"
        options={{
          title: fileViewerTitle,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document" color={color} size={size} />
          ),
          headerRight: () => (
            <UploadedFilesHeaderRight
              foregroundTheme={foregroundTheme}
              filesCategory={filesCategory}
              setFilesCategory={setFilesCategory}
            />
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
          headerRight: () => (
            <ChatRoomsHeaderRight foregroundTheme={foregroundTheme} />
          ),
        }}
      />
    </Tabs>
  );
}

type IndexHeaderRightProps = {
  foregroundTheme: string;
  notificationCount: number;
};

// HeaderRight Components
const IndexHeaderRight = ({
  foregroundTheme,
  notificationCount,
}: {
  foregroundTheme: string;
  notificationCount: number;
}) => {
  return (
    <View className="flex-row items-center gap-x-sm mr-sm">
      {notificationCount > 0 ? (
        <TouchableOpacity
          onPress={() => {
            console.log("====IndexHeaderRight onPress=====");
            // @ts-ignore
            router.push("chats/index");
          }}
          className="relative bg-background dark:bg-background-dark rounded-full p-sm"
        >
          <Ionicons
            name="notifications-outline"
            size={HEADER_ICON_SIZE}
            color={foregroundTheme}
          />
          <Text
            className="absolute -top-[-2px] -right-[-0px] bg-red-500 rounded-full 
            w-[20px] h-[20px] text-center pt-[2px] items-center justify-center
            text-white text-sm font-bold"
          >
            {notificationCount}
          </Text>
        </TouchableOpacity>
      ) : (
        <View className="bg-background dark:bg-background-dark rounded-full p-sm">
          <Ionicons
            name="notifications-outline"
            size={HEADER_ICON_SIZE}
            color={foregroundTheme}
          />
        </View>
      )}
    </View>
  );
};

type UploadedFilesHeaderRightProps = {
  foregroundTheme: string;
  filesCategory: FilesCategory;
  setFilesCategory: (category: FilesCategory) => void;
};

const UploadedFilesHeaderRight = ({
  foregroundTheme,
  filesCategory,
  setFilesCategory,
}: UploadedFilesHeaderRightProps) => {
  return (
    <View className="flex-row items-center gap-x-sm mr-sm">
      <TouchableOpacity
        onPress={() => {
          setFilesCategory(FilesCategory.UPLOADED);
          console.log("=== Header: Set category to UPLOADED");
        }}
        className={`bg-background dark:bg-background-dark rounded-full p-sm ${
          filesCategory === FilesCategory.UPLOADED
            ? "bg-primary dark:bg-primary-dark"
            : ""
        }`}
      >
        <Ionicons
          name="cloud-upload-outline"
          size={HEADER_ICON_SIZE}
          color={foregroundTheme}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setFilesCategory(FilesCategory.INCOMING);
          console.log("=== Header: Set category to INCOMING");
        }}
        className={`bg-background dark:bg-background-dark rounded-full p-sm ${
          filesCategory === FilesCategory.INCOMING
            ? "bg-primary dark:bg-primary-dark"
            : ""
        }`}
      >
        <Ionicons
          name="cloud-download-outline"
          size={HEADER_ICON_SIZE}
          color={foregroundTheme}
        />
      </TouchableOpacity>
    </View>
  );
};

const ChatRoomsHeaderRight = ({
  foregroundTheme,
}: {
  foregroundTheme: string;
}) => {
  return (
    <View className="flex-row items-center gap-x-sm mr-sm">
      <TouchableOpacity
        onPress={() => {
          console.log("====StackHeaderRight onPress=====");
        }}
        className="bg-background dark:bg-background-dark rounded-full p-sm"
      >
        <Ionicons
          name="notifications-outline"
          size={HEADER_ICON_SIZE}
          color={foregroundTheme}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          console.log("====StackHeaderRight onPress=====");
        }}
        className="bg-background dark:bg-background-dark rounded-full p-sm"
      >
        <Ionicons
          name="add-outline"
          size={HEADER_ICON_SIZE}
          color={foregroundTheme}
        />
      </TouchableOpacity>
    </View>
  );
};
