import { View, Text, useWindowDimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import BadgeWithIcon from "../ui/BadgeWithIcon";
import { dummyUnreadMessages } from "@/constants/dummyUnreadMessages";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "../chatRoom/Avatar";
import { ko } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";

const UNREAD_MESSAGES_IN_SECTION_MAX_COUNT = 3;

const InitScreenUnreadSection = ({ isDark }: { isDark: boolean }) => {
  const [unreadMessages, setUnreadMessages] = useState<any[]>([]);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      const unMessages = dummyUnreadMessages;
      setUnreadMessages(unMessages);
    };
    fetchUnreadMessages();
  }, []);

  const moreCnt =
    unreadMessages.length > UNREAD_MESSAGES_IN_SECTION_MAX_COUNT
      ? unreadMessages.length - UNREAD_MESSAGES_IN_SECTION_MAX_COUNT
      : 0;

  return (
    <View
      className="flex flex-row items-center justify-start gap-4 w-full
    p-sm pt-lg border-0 border-red-500
    "
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
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-sm pb-xs">
          {unreadMessages
            .slice(0, UNREAD_MESSAGES_IN_SECTION_MAX_COUNT)
            .map((msg) => (
              <View
                key={msg.message_id}
                className="flex flex-row items-center space-x-3 p-sm py-sm gap-md rounded-lg 
              w-full "
              >
                <Avatar name={msg.sender_name} avatar={msg.avatar} />
                <View
                  className="flex-1 flex flex-row w-full "
                  id={`msg-content-${msg.message_id}`}
                >
                  <View className="flex flex-1 items-start justify-between w-full ">
                    <Text className="text-md font-medium text-foreground dark:text-foreground-dark ">
                      {msg.sender_name}
                    </Text>
                    <Text className="text-sm text-foreground-tertiary dark:text-foreground-tertiaryDark truncate ">
                      {msg.content}
                    </Text>
                  </View>
                  <View className="flex flex-row items-center gap-x-sm">
                    <Ionicons
                      name="time-outline"
                      size={24}
                      color={isDark ? "silver" : "gray"}
                    />
                    <Text className="text-sm text-foreground-secondary dark:text-foreground-secondaryDark ">
                      {formatDistanceToNow(new Date(msg.sent_at), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          {moreCnt > 0 && (
            <Text className="text-center text-foreground-secondary dark:text-foreground-secondaryDark ">
              +{moreCnt} more unread messages...
            </Text>
          )}
        </CardContent>
      </Card>
    </View>
  );
};

export default InitScreenUnreadSection;
