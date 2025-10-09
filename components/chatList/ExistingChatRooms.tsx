import { View, Text, FlatList, ActivityIndicator } from "react-native";
import React from "react";
import { useFetchMyChatRooms } from "@/hooks/useFetchMyChatRooms";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/contexts/SupabaseProvider";
import tailwindColors from "@/utils/tailwindColors";
import EachChatRoom from "./EachChatRoom";
import { useColorScheme } from "nativewind";
import { useUnreadMessagesCount } from "@/contexts/UnreadMessagesCountProvider";

const ExistingChatRooms = () => {
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { unreadMessagesCountArray } = useUnreadMessagesCount();

  const { data: chatRooms, isLoading } = useFetchMyChatRooms({
    supabase,
    currentUserId: currentUser?.id || null,
  });

  return (
    <View className="gap-4 w-full p-0 pt-md">
      <View className="w-full">
        <Text
          className="w-full p-sm pb-xs pt-md text-start text-lg text-foreground dark:text-foreground-dark
      border-0 border-slate-500 rounded-md font-semibold
      "
        >
          Existing Chat Rooms
        </Text>
      </View>
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={tailwindColors.primary.DEFAULT}
          />
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          renderItem={({ item, index }) => (
            <EachChatRoom
              msg={item}
              isDark={isDark}
              index={index}
              unreadMessagesCountArray={unreadMessagesCountArray}
            />
          )}
          keyExtractor={(item) => item.room_id.toString()}
          className="w-full"
        />
      )}
    </View>
  );
};

export default ExistingChatRooms;
