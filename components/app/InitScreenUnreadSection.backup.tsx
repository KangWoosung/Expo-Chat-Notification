import { View, Text, useWindowDimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import BadgeWithIcon from "../ui/BadgeWithIcon";
import { dummyUserChatRooms } from "@/constants/dummyUnreadMessages";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "../chatRoom/Avatar";
import { ko } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import EachChatRoom from "../chatList/EachChatRoom";
import { Database } from "@/db/supabase/supabase";
import { cn } from "@/lib/utils";
import { useUnreadMessagesCount } from "@/contexts/UnreadMessagesCountProvider";

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
  const { unreadMessagesCountArray } = useUnreadMessagesCount();

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      const unMessages = dummyUserChatRooms;
      setUnreadMessages(unMessages);
    };
    fetchUnreadMessages();
  }, []);

  useEffect(() => {
    const moreCntNum =
      unreadMessages.length > UNREAD_MESSAGES_IN_SECTION_MAX_COUNT
        ? unreadMessages.length - UNREAD_MESSAGES_IN_SECTION_MAX_COUNT
        : 0;
    setMoreCnt(moreCntNum);
  }, [unreadMessages]);

  return (
    <View
      className={cn(`flex flex-row items-center justify-start gap-4 w-full
    p-sm pt-lg border-0 border-red-500
    ${className}`)}
    >
      {/* Unread Messages Section */}
      <Card className="bg-card dark:bg-card-dark border-border w-full p-0">
        <CardHeader className="w-full py-sm">
          <CardTitle
            className="flex flex-row w-full items-center gap-sm p-0
            text-card-foreground dark:text-card-foreground-dark
            border border-0 border-blue-500
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
            {unreadMessages.length > 0 ? (
              <View className="flex items-center justify-center">
                <BadgeWithIcon
                  className="bg-yellow-600 dark:bg-yellow-600 border-0 text-accent-foreground ml-auto"
                  dot={false}
                  dotSize={10}
                  label={unreadMessages.length}
                  textClassName="text-md font-medium text-foreground dark:text-foreground-dark"
                >
                  {unreadMessages.length}
                </BadgeWithIcon>
              </View>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-sm pb-xs gap-xs">
          {unreadMessages.length > 0 ? (
            unreadMessages
              .slice(0, UNREAD_MESSAGES_IN_SECTION_MAX_COUNT)
              .map((msg, index) => (
                <EachChatRoom
                  key={msg.room_id}
                  msg={msg}
                  isDark={isDark}
                  index={index}
                  animationProp={false}
                  unreadMessagesCountArray={unreadMessagesCountArray}
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
