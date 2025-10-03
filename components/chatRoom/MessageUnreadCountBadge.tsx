/*
2025-10-03 07:07:55




*/

import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useSupabase } from "@/contexts/SupabaseProvider";

const MessageUnreadCountBadge = ({ messageId }: { messageId: string }) => {
  const { supabase } = useSupabase();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!supabase || !messageId) return;

    const getUnreadCount = async () => {
      try {
        const { data: cnt, error } = await supabase.rpc(
          "get_unread_count" as any,
          {
            message_uuid: messageId,
          }
        );
        if (error) {
          console.error(error);
          return;
        }
        if (cnt && typeof cnt === "number") {
          setUnreadCount(cnt);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
        setUnreadCount(0);
      }
    };
    getUnreadCount();
  }, [supabase, messageId]);

  // No badge if there are no unread messages
  if (unreadCount === 0) return null;

  return (
    <View className="absolute -top-1 -right-1 bg-red-500 dark:bg-red-600 rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
      <Text className="text-white text-xs font-bold">
        {unreadCount > 99 ? "99+" : unreadCount}
      </Text>
    </View>
  );
};

export default MessageUnreadCountBadge;
