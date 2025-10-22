import { View, Text, FlatList, ActivityIndicator } from "react-native";
import React from "react";
import tailwindColors from "@/utils/tailwindColors";
import { useColorScheme } from "nativewind";
import { useChatRoomsStore } from "@/zustand/useChatRoomsStore";
import EachChatRoomWithHookData from "./EachChatRoomWithHookData";

const ExistingChatRooms = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  /**
   * Zustand store에서 채팅룸 목록과 unread count 가져오기
   *
   * ChatRoomsProvider가 React Query + Realtime으로 데이터를 관리하며,
   * 이 데이터를 Zustand에 동기화하여 모든 컴포넌트가 공유합니다.
   *
   * 특징:
   * - 앱 포그라운드 복귀 시 자동 refetch
   * - 네트워크 재연결 시 자동 동기화
   * - Realtime 업데이트 자동 반영
   */
  const { chatRooms, unreadCounts, isLoading } = useChatRoomsStore();

  return (
    <View className="gap-4 w-full p-0 pt-md">
      <View className="w-full">
        <Text
          className="w-full p-sm pb-xs pt-md text-start text-lg text-foreground dark:text-foreground-dark
      border-0 border-slate-500 rounded-md font-semibold
      "
        >
          Existing Chat Rooms
        </Text>
      </View>
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={tailwindColors.primary.DEFAULT}
          />
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          renderItem={({ item, index }) => (
            <EachChatRoomWithHookData
              index={index}
              chatRoom={item}
              unreadCount={unreadCounts[item.room_id]}
              isDark={isDark}
            />
          )}
          keyExtractor={(item) => item.room_id.toString()}
          className="w-full"
        />
      )}
    </View>
  );
};

export default ExistingChatRooms;
