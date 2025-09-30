import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useState, useCallback } from "react";
import { Tables } from "@/db/supabase/supabase";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { router } from "expo-router";
import { DEFAULT_AVATAR, DEFAULT_PAGE_LIMIT } from "@/constants/constants";
import { Image } from "expo-image";

import type { UserResource } from "@clerk/types";
import tailwindColors from "@/utils/tailwindColors";
import { useFetchAllUsers } from "@/hooks/useFetchAllUsers";

type AllUserChatsProps = {
  currentUser: UserResource;
  setError: (error: string) => void;
  isDark: boolean;
};

const AllUserChats = ({ currentUser, setError, isDark }: AllUserChatsProps) => {
  const [allUsers, setAllUsers] = useState<Tables<"users">[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { supabase } = useSupabase();

  const pageStart = currentPage * DEFAULT_PAGE_LIMIT;
  const pageEnd = pageStart + DEFAULT_PAGE_LIMIT;

  const {
    data: newUsers,
    isLoading,
    error,
  } = useFetchAllUsers({
    currentUserId: currentUser?.id,
    supabase,
    pageStart,
    pageEnd,
  });

  // 새로운 데이터가 로드되면 기존 데이터에 추가
  React.useEffect(() => {
    if (newUsers && newUsers.length > 0) {
      if (currentPage === 0) {
        // 첫 페이지인 경우 기존 데이터를 대체
        setAllUsers(newUsers);
      } else {
        // 추가 페이지인 경우 기존 데이터에 추가 (중복 제거)
        setAllUsers((prev) => {
          const existingIds = new Set(prev.map((user) => user.user_id));
          const uniqueNewUsers = newUsers.filter(
            (user) => !existingIds.has(user.user_id)
          );
          return [...prev, ...uniqueNewUsers];
        });
      }
      setIsLoadingMore(false);

      // 더 이상 데이터가 없으면 hasMoreData를 false로 설정
      if (newUsers.length < DEFAULT_PAGE_LIMIT) {
        setHasMoreData(false);
      }
    } else if (newUsers && newUsers.length === 0 && currentPage > 0) {
      // 빈 배열이 반환되면 더 이상 데이터가 없음
      setHasMoreData(false);
      setIsLoadingMore(false);
    }
  }, [newUsers, currentPage]);

  if (error) {
    setError(error.message);
  }

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMoreData && !isLoading) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoadingMore, hasMoreData, isLoading]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View className="flex-row items-center justify-center w-full py-4">
        <ActivityIndicator
          size="small"
          color={tailwindColors.primary.DEFAULT}
        />
      </View>
    );
  }, [isLoadingMore]);

  console.log("currentPage", currentPage);
  console.log("allUsers length", allUsers.length);
  console.log("hasMoreData", hasMoreData);
  console.log("isLoadingMore", isLoadingMore);

  return (
    <View className="gap-4 w-full p-0 pt-md">
      <Text
        className="w-full p-sm pb-0 pt-md text-start text-lg text-foreground dark:text-foreground-dark
      border-0 border-slate-500 rounded-md font-semibold
      "
      >
        All UserChats
      </Text>
      {isLoading && currentPage === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={tailwindColors.primary.DEFAULT}
          />
        </View>
      ) : (
        <FlatList
          data={allUsers}
          renderItem={({ item }) => <UserItem user={item} />}
          keyExtractor={(item) => item.user_id?.toString() || ""}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          className="w-full"
        />
      )}
    </View>
  );
};

export default AllUserChats;

function UserItem({ user }: { user: Tables<"users"> }) {
  return (
    <Pressable
      onPress={() => router.push(`/(stack)/chat_room?user_id=${user.user_id}`)}
      className="flex-row items-center w-full gap-lg p-sm pb-md border-0 border-blue-500"
    >
      <View className="flex-row flex-1 items-center gap-md">
        <Image
          source={{ uri: user.avatar || DEFAULT_AVATAR }}
          className="w-10 h-10 rounded-full"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
          }}
        />
        <View className="flex-col items-start gap-2xs">
          <Text className="text-foreground dark:text-foreground-dark text-lg font-light">
            {user.name}
          </Text>
          <Text className="text-foreground dark:text-foreground-dark text-md font-light">
            {user.email}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-lg">
        {/* <Ionicons
          name="ellipsis-vertical"
          size={20}
          color="#64748b"
          accessibilityLabel="More options"
          accessibilityRole="button"
        /> */}
      </View>
    </Pressable>
  );
}
