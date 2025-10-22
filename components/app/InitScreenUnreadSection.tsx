import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import BadgeWithIcon from "../ui/BadgeWithIcon";
import { Ionicons } from "@expo/vector-icons";
import EachChatRoom from "../chatList/EachChatRoom";
import { Database } from "@/db/supabase/supabase";
import { cn } from "@/lib/utils";
import { useChatRoomsStore } from "@/zustand/useChatRoomsStore";

const UNREAD_MESSAGES_IN_SECTION_MAX_COUNT = 3;

type GetUserChatRoomsRowType =
  Database["public"]["Functions"]["get_user_chat_rooms"]["Returns"][0];

type InitScreenUnreadSectionProps = {
  isDark: boolean;
  className?: string;
};

const InitScreenUnreadSection = ({
  isDark,
  className,
}: InitScreenUnreadSectionProps) => {
  const [unreadMessages, setUnreadMessages] = useState<
    GetUserChatRoomsRowType[]
  >([]);
  const [moreCnt, setMoreCnt] = useState(0);

  // Zustand store에서 채팅룸 + unread count 데이터 가져오기
  const { chatRooms, unreadCounts } = useChatRoomsStore();

  useEffect(() => {
    if (!chatRooms || chatRooms.length === 0) {
      setUnreadMessages([]);
      return;
    }

    // unread_count > 0 인 채팅룸만 필터링하고 unread_count 필드 추가
    const chatRoomsWithUnreadCount = chatRooms
      .map((item) => ({
        ...item,
        unread_count: unreadCounts[item.room_id] || 0,
      }))
      .filter((item) => item.unread_count > 0);

    // last_message_sent_at 기준으로 정렬 (최신순)
    chatRoomsWithUnreadCount.sort(
      (a, b) =>
        new Date(b.last_message_sent_at).getTime() -
        new Date(a.last_message_sent_at).getTime()
    );

    setUnreadMessages(chatRoomsWithUnreadCount);
  }, [chatRooms, unreadCounts]);

  useEffect(() => {
    const moreCntNum =
      unreadMessages?.length > UNREAD_MESSAGES_IN_SECTION_MAX_COUNT
        ? unreadMessages?.length - UNREAD_MESSAGES_IN_SECTION_MAX_COUNT
        : 0;
    setMoreCnt(moreCntNum);
  }, [unreadMessages]);

  return (
    <View
      className={cn(`flex flex-row items-center justify-start gap-4 w-full
    p-sm pt-lg
    ${className}`)}
    >
      {/* Unread Messages Section */}
      <Card className="bg-card dark:bg-card-dark border-border w-full p-0">
        <CardHeader className="w-full py-sm">
          <CardTitle
            className="flex flex-row w-full items-center gap-sm p-0
            text-card-foreground dark:text-card-foreground-dark
            "
          >
            <View className="items-center justify-center">
              <Ionicons
                name="chatbox-ellipses-outline"
                size={24}
                color={isDark ? "white" : "black"}
              />
            </View>
            <Text
              className="flex flex-1 text-heading-3 font-semibold
            text-foreground-secondary dark:text-foreground-secondaryDark"
            >
              Unread Messages
            </Text>
            {unreadMessages?.length > 0 ? (
              <View className="flex items-center justify-center">
                <BadgeWithIcon
                  className="bg-yellow-600 dark:bg-yellow-600 border-0 text-accent-foreground ml-auto"
                  dot={false}
                  dotSize={10}
                  label={unreadMessages?.length}
                  textClassName="text-md font-medium text-foreground dark:text-foreground-dark"
                >
                  {unreadMessages?.length}
                </BadgeWithIcon>
              </View>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-sm pb-xs gap-xs">
          {unreadMessages?.length > 0 ? (
            unreadMessages
              .slice(0, UNREAD_MESSAGES_IN_SECTION_MAX_COUNT)
              .map((msg, index) => (
                <EachChatRoom
                  key={msg.room_id}
                  msg={msg}
                  isDark={isDark}
                  index={index}
                  animationProp={false}
                  unreadMessagesCountArray={Object.entries(unreadCounts).map(
                    ([room_id, unread_count]) => ({ room_id, unread_count })
                  )}
                />
              ))
          ) : (
            <View className="flex items-center justify-center">
              <Text className="text-center text-foreground-secondary dark:text-foreground-secondaryDark ">
                No unread messages...
              </Text>
            </View>
          )}
          {moreCnt > 0 ? (
            <Text className="text-center text-foreground-secondary dark:text-foreground-secondaryDark ">
              +{moreCnt} more unread messages...
            </Text>
          ) : null}
        </CardContent>
      </Card>
    </View>
  );
};

export default InitScreenUnreadSection;
