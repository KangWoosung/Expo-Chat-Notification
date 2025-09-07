import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { Tables } from "@/db/supabase/supabase";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { router } from "expo-router";
import { DEFAULT_AVATAR, DEFAULT_PAGE_LIMIT } from "@/constants/constants";
import { Ionicons } from "@expo/vector-icons";
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
  const [pageStart, setPageStart] = useState(0);
  const [pageEnd, setPageEnd] = useState(DEFAULT_PAGE_LIMIT);
  const { supabase } = useSupabase();

  const {
    data: users,
    isLoading,
    error,
  } = useFetchAllUsers({
    currentUserId: currentUser?.id,
    supabase,
    pageStart,
    pageEnd,
  });
  if (error) {
    setError(error.message);
  }
  // console.log("pageStart", pageStart);
  // console.log("pageEnd", pageEnd);
  // console.log("users", users);

  return (
    <View className="gap-4 w-full p-0 pt-md">
      <Text
        className="w-full p-sm pb-0 pt-md text-start text-lg text-foreground dark:text-foreground-dark
      border-0 border-slate-500 rounded-md font-semibold
      "
      >
        All Users
      </Text>
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={tailwindColors.primary.DEFAULT}
          />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={({ item }) => <UserItem user={item} />}
          keyExtractor={(item) => item.user_id?.toString() || ""}
          onEndReached={() => {
            setPageStart(pageEnd);
            setPageEnd(pageEnd + DEFAULT_PAGE_LIMIT);
          }}
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
function Footer() {
  return (
    <View className="flex-row items-center justify-center w-full h-10">
      <ActivityIndicator
        size="large"
        color={tailwindColors.foreground.primary}
      />
    </View>
  );
}
