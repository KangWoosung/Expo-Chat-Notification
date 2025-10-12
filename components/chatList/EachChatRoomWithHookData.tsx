/*
2025-10-12 14:30:00
useMyChatRoomsWithUnread Hook 데이터를 사용하는 채팅룸 아이템 컴포넌트

기존 EachChatRoom과 동일한 UI를 유지하면서 새로운 Hook 데이터 구조 사용:
- chatRoom: 단일 채팅룸 데이터
- unreadCount: 해당 룸의 내가 읽지 않은 메시지 수 (number)
- animationProp: 애니메이션 활성화 여부
*/

import { View, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { Database } from "@/db/supabase/supabase";
import { useIsFocused } from "@react-navigation/native";
import { useAnimationStore } from "@/zustand/useAnimationStore";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  withDelay,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { ANIMATION_DELAY } from "@/constants/constants";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import ChatRoomLoading from "../chatRoom/ChatRoomLoading";
import Avatar from "../chatRoom/Avatar";
import { Ionicons } from "@expo/vector-icons";
import ChatRoomUnreadCountBadge from "../chatRoom/ChatRoomUnreadCountBadge";
import ChatRoomTypeBadge from "../chatRoom/ChatRoomTypeBadge";

type ChatRoom =
  Database["public"]["Functions"]["get_user_chat_rooms"]["Returns"][0];

type EachChatRoomWithHookDataProps = {
  chatRoom: ChatRoom; // ✅ 단일 채팅룸
  unreadCount: number; // ✅ 해당 룸의 unread count (number)
  isDark: boolean;
  index: number;
  animationProp?: boolean;
};

const EachChatRoomWithHookData = ({
  chatRoom,
  unreadCount,
  isDark,
  index,
  animationProp = true,
}: EachChatRoomWithHookDataProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const isFocused = useIsFocused();
  const animationsEnabled = useAnimationStore((s) => s.animationsEnabled);

  const moveToChatRoom = () => {
    setIsLoading(true);
    router.push(`/(stack)/chat_room/id/${chatRoom.room_id}`);
    setIsLoading(false);
  };

  const chatRoomsOpacity = useSharedValue(0);
  const chatRoomsTranslateY = useSharedValue(12);

  const chatRoomsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chatRoomsOpacity.value,
    transform: [{ translateY: chatRoomsTranslateY.value }],
  }));

  useEffect(() => {
    if (isFocused && animationsEnabled && animationProp) {
      chatRoomsOpacity.value = withDelay(
        ANIMATION_DELAY * (index + 1),
        withTiming(1)
      );
      chatRoomsTranslateY.value = withDelay(
        ANIMATION_DELAY * (index + 1),
        withTiming(1)
      );
    } else {
      chatRoomsOpacity.value = 1;
      chatRoomsTranslateY.value = 0;
    }

    return () => {
      chatRoomsOpacity.value = 0;
      chatRoomsTranslateY.value = 12;
    };
  }, [isFocused, animationsEnabled, animationProp]);

  // Direct vs Group chat room distinction
  const isDirectChat = chatRoom.other_user_id !== null;

  // Determine chat room name
  const chatRoomName = isDirectChat
    ? chatRoom.other_user_name
    : chatRoom.room_name;

  // Name for avatar display (group chat: group name, direct: opponent's name)
  const avatarName = isDirectChat
    ? chatRoom.other_user_name
    : chatRoom.room_name;

  // Generate last message string
  const getLastMessageString = () => {
    if (!chatRoom.last_message_content) return "No messages yet";

    const senderName = isDirectChat ? "" : "Someone";

    switch (chatRoom.last_message_type) {
      case "text":
        const content =
          chatRoom.last_message_content?.length > 30
            ? chatRoom.last_message_content?.substring(0, 30) + "..."
            : chatRoom.last_message_content;
        return isDirectChat ? content : `${senderName}: ${content}`;
      case "image":
        return isDirectChat ? "Photo 🖼" : `${senderName} sent a photo 🖼`;
      case "video":
        return isDirectChat ? "Video 🎥" : `${senderName} sent a video 🎥`;
      case "file":
        return isDirectChat ? "File 📄" : `${senderName} sent a file 📄`;
      default:
        return isDirectChat ? "File 📄" : `${senderName} sent a file 📄`;
    }
  };

  const lastMessageString = getLastMessageString();

  return (
    <>
      {isLoading ? (
        <ChatRoomLoading />
      ) : (
        <Animated.View
          style={chatRoomsAnimatedStyle}
          key={`chat-room-view-${chatRoom.room_id}`}
        >
          <TouchableOpacity
            key={chatRoom.room_id}
            onPress={moveToChatRoom}
            className="flex flex-row items-center space-x-3 p-sm py-sm gap-md rounded-lg w-full"
          >
            {isDirectChat ? (
              <Avatar
                name={avatarName}
                avatar={chatRoom.other_user_avatar}
                className="w-12 h-12"
                unreadMessagesCount={unreadCount}
                type={isDirectChat ? "direct" : "group"}
              />
            ) : (
              <View className="relative w-12 h-12 rounded-full bg-primary dark:bg-primary-dark items-center justify-center">
                <Ionicons name="people" size={24} color="white" />
                <ChatRoomUnreadCountBadge unreadCount={unreadCount ?? 0} />
                <ChatRoomTypeBadge type="group" />
              </View>
            )}
            <View
              className="flex-1 flex flex-row w-full"
              id={`msg-content-${chatRoom.room_id}`}
            >
              <View className="flex flex-1 items-start justify-between w-full gap-0">
                <View className="flex flex-row items-end justify-center gap-x-sm">
                  <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
                    {chatRoomName}
                  </Text>
                  <Ionicons
                    name={isDirectChat ? "mail-outline" : "people-outline"}
                    size={16}
                    color={isDark ? "silver" : "gray"}
                  />
                </View>
                <Text className="text-md text-foreground-tertiary dark:text-foreground-tertiaryDark truncate">
                  {lastMessageString}
                </Text>
              </View>
              <View className="flex flex-row items-center gap-x-xs">
                {chatRoom.last_message_sent_at ? (
                  <>
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={isDark ? "silver" : "gray"}
                    />
                    <Text className="text-sm text-foreground-secondary dark:text-foreground-secondaryDark">
                      {formatDistanceToNow(
                        new Date(chatRoom.last_message_sent_at || new Date()),
                        {
                          addSuffix: true,
                          locale: ko,
                        }
                      )}
                    </Text>
                  </>
                ) : (
                  <Text className="text-sm text-foreground-secondary dark:text-foreground-secondaryDark">
                    No messages yet
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
};

export default EachChatRoomWithHookData;
