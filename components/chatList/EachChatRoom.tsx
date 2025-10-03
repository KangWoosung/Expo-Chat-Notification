import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "../chatRoom/Avatar";
import { Database } from "@/db/supabase/supabase";
import { router } from "expo-router";
import ChatRoomLoading from "../chatRoom/ChatRoomLoading";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useAnimationStore } from "@/zustand/useAnimationStore";
import { useIsFocused } from "@react-navigation/native";
import { ANIMATION_DELAY } from "@/constants/constants";

type GetUserChatRoomsRowType =
  Database["public"]["Functions"]["get_user_chat_rooms"]["Returns"][0];

type EachChatRoomProps = {
  msg: GetUserChatRoomsRowType;
  isDark: boolean;
  index: number;
  animationProp?: boolean;
};

const EachChatRoom = ({
  msg,
  isDark,
  index,
  animationProp = true,
}: EachChatRoomProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const isFocused = useIsFocused();
  const animationsEnabled = useAnimationStore((s) => s.animationsEnabled);

  const moveToChatRoom = () => {
    setIsLoading(true);
    router.push(`/(stack)/chat_room/id/${msg.room_id}`);
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
  const isDirectChat = msg.other_user_id !== null;

  // Determine chat room name
  const chatRoomName = isDirectChat ? msg.other_user_name : msg.room_name;

  // Name for avatar display (group chat: group name, direct: opponent's name)
  const avatarName = isDirectChat ? msg.other_user_name : msg.room_name;

  // Generate last message string
  const getLastMessageString = () => {
    if (!msg.last_message_content) return "No messages yet";

    const senderName = isDirectChat ? "" : "Someone"; // Direct: omit sender name, Group: show "Someone"

    switch (msg.last_message_type) {
      case "text":
        const content =
          msg.last_message_content.length > 30
            ? msg.last_message_content.substring(0, 30) + "..."
            : msg.last_message_content;
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
          key={`chat-room-view-${msg.room_id}`}
        >
          <TouchableOpacity
            key={msg.room_id}
            onPress={moveToChatRoom}
            className="flex flex-row items-center space-x-3 p-sm py-sm gap-md rounded-lg 
    w-full "
          >
            {isDirectChat ? (
              <Avatar
                name={avatarName}
                avatar={msg.other_user_avatar}
                className="w-12 h-12"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-primary dark:bg-primary-dark items-center justify-center">
                <Ionicons name="people" size={24} color="white" />
              </View>
            )}
            <View
              className="flex-1 flex flex-row w-full "
              id={`msg-content-${msg.room_id}`}
            >
              <View className="flex flex-1 items-start justify-between w-full gap-0">
                <View className="flex flex-row items-end justify-center gap-x-sm">
                  <Text className="text-lg font-light text-foreground dark:text-foreground-dark ">
                    {chatRoomName}
                  </Text>
                  <Ionicons
                    name={isDirectChat ? "mail-outline" : "people-outline"}
                    size={16}
                    color={isDark ? "silver" : "gray"}
                  />
                </View>
                <Text className="text-md text-foreground-tertiary dark:text-foreground-tertiaryDark truncate ">
                  {lastMessageString}
                </Text>
              </View>
              <View className="flex flex-row items-center gap-x-xs">
                {msg.last_message_sent_at ? (
                  <>
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={isDark ? "silver" : "gray"}
                    />
                    <Text className="text-sm text-foreground-secondary dark:text-foreground-secondaryDark ">
                      {formatDistanceToNow(
                        new Date(msg.last_message_sent_at || new Date()),
                        {
                          addSuffix: true,
                          locale: ko,
                        }
                      )}
                    </Text>
                  </>
                ) : (
                  <Text className="text-sm text-foreground-secondary dark:text-foreground-secondaryDark ">
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

export default EachChatRoom;
