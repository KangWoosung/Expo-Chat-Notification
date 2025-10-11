/*
2025-10-12 07:30:00
Props로 unreadCount를 직접 받아서 표시
- DB 쿼리 제거 (이미 부모에서 가져온 데이터 사용)
- 성능 최적화
*/

import { View, Text } from "react-native";
import React from "react";

const MessageUnreadCountBadge = ({ unreadCount }: { unreadCount: number }) => {
  // No badge if there are no unread messages
  // if (!unreadCount || unreadCount === 0) return null;

  return (
    <View className="absolute -top-1 -right-1 bg-red-500 dark:bg-red-600 rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
      <Text className="text-white text-xs font-bold">
        {unreadCount > 99 ? "99+" : unreadCount}
      </Text>
    </View>
  );
};

export default MessageUnreadCountBadge;
