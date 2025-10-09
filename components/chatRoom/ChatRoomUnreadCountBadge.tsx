/*
2025-10-04 01:02:46



*/

import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useSupabase } from "@/contexts/SupabaseProvider";

const ChatRoomUnreadCountBadge = ({ unreadCount }: { unreadCount: number }) => {
  // No badge if there are no unread messages
  if (unreadCount === 0) return null;

  return (
    <View
      className="absolute -top-0 -right-2 bg-red-500 dark:bg-red-600 
    rounded-full w-6 h-6 flex items-center justify-center px-1"
    >
      <Text className="text-white text-sm font-bold">
        {unreadCount > 99 ? "99+" : unreadCount}
      </Text>
    </View>
  );
};

export default ChatRoomUnreadCountBadge;
