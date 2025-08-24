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
import { Stack, Tabs } from "expo-router";
import React from "react";

import tailwindColors from "@/utils/tailwindColors";
// import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import DrawerIcon from "@/components/navigator/DrawerIcon";
import { HEADER_ICON_SIZE } from "@/constants/constants";
import { useNavigationState } from "@react-navigation/native";
import { TouchableOpacity, View } from "react-native";

export default function TabLayout() {
  // const { user } = useUser();
  const state = useNavigationState((state) => state);

  const currentRouteName =
    state.routes[state.index]?.state?.routes?.[
      state.routes[state.index]?.state?.index || 0
    ]?.name || "";
  console.log("====TabLayout currentRouteName=====", currentRouteName);

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
          headerRight: () => (
            <IndexHeaderRight
              foregroundTheme={foregroundTheme}
              backgroundTheme={backgroundTheme}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="files/index"
        options={{
          title: "Files .....",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document" color={color} size={size} />
          ),
          headerRight: () => (
            <UploadedFilesHeaderRight
              foregroundTheme={foregroundTheme}
              backgroundTheme={backgroundTheme}
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
            <ChatRoomsHeaderRight
              foregroundTheme={foregroundTheme}
              backgroundTheme={backgroundTheme}
            />
          ),
        }}
      />
    </Tabs>
  );
}

// HeaderRight Components
const IndexHeaderRight = ({
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
        <Ionicons
          name="notifications-outline"
          size={24}
          color={foregroundTheme}
        />
      </TouchableOpacity>
    </View>
  );
};

const UploadedFilesHeaderRight = ({
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
        <Ionicons
          name="cloud-upload-outline"
          size={24}
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
          name="cloud-download-outline"
          size={24}
          color={foregroundTheme}
        />
      </TouchableOpacity>
    </View>
  );
};

const ChatRoomsHeaderRight = ({
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
        <Ionicons
          name="notifications-outline"
          size={24}
          color={foregroundTheme}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          console.log("====StackHeaderRight onPress=====");
        }}
        className="bg-background dark:bg-background-dark rounded-full p-sm"
      >
        <Ionicons name="add-outline" size={24} color={foregroundTheme} />
      </TouchableOpacity>
    </View>
  );
};
