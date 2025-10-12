import { View, Text, FlatList, ActivityIndicator } from "react-native";
import React from "react";
import { useFetchMyChatRooms } from "@/hooks/useFetchMyChatRooms";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/contexts/SupabaseProvider";
import tailwindColors from "@/utils/tailwindColors";
import EachChatRoom from "./EachChatRoom";
import { useColorScheme } from "nativewind";
import { useUnreadMessagesCount } from "@/contexts/UnreadMessagesCountProvider";
import { useMyChatRoomsWithUnread } from "@/hooks/useMyChatRoomsWithUnread";
import EachChatRoomWithHookData from "./EachChatRoomWithHookData";

const ExistingChatRooms = () => {
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  // const { unreadMessagesCountArray } = useUnreadMessagesCount();

  // const { data: chatRooms, isLoading } = useFetchMyChatRooms({
  //   supabase,
  //   currentUserId: currentUser?.id || null,
  // });

  /**
   * 내 채팅룸 목록과 각 룸의 unread count를 가져오는 훅
   *
   *   chatRooms: 내가 속한 채팅룸 목록
   *   unreadCounts: 각 룸별 내가 읽지 않은 메시지 수
   *   totalUnreadCount: 모든 룸의 unread 합계
   *   isLoading: 로딩 상태
   *   error: 에러
   *   refetch: 수동 refetch 함수
   */
  const { chatRooms, unreadCounts, totalUnreadCount, isLoading } =
    useMyChatRoomsWithUnread();

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
