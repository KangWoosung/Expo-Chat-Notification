import {
  View,
  Text,
  Button,
  FlatList,
  Image,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import tailwindColors from "@/utils/tailwindColors";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { DEFAULT_AVATAR } from "@/constants/constants";
import { Tables } from "@/db/supabase/supabase";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

type User = Tables<"users">;

const PAGE_SIZE = 20;

const ChatsIndex = () => {
  const { user: currentUser } = useUser();
  const { supabase } = useSupabase();
  const [users, setUsers] = useState<User[]>([]);
  const [pageStart, setPageStart] = useState(0);
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!supabase) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .limit(PAGE_SIZE)
          .range(pageStart, pageEnd)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching users:", error);
          setError(error.message);
        } else {
          // Crop current user from the list
          const filteredData = data?.filter(
            (user) => user.user_id !== currentUser?.id
          );
          setUsers(filteredData || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [supabase, pageStart, pageEnd]);

  return (
    <View
      className="flex-1 w-full items-center justify-start border 
    bg-background dark:bg-background-dark"
    >
      {error && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground dark:text-foreground-dark">
            Error: {error}
          </Text>
        </View>
      )}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={tailwindColors.primary.DEFAULT}
          />
        </View>
      ) : (
        <View className="gap-4 w-full p-md">
          <Text className="w-full p-md text-center text-lg text-foreground dark:text-foreground-dark">
            Tap a user to start chatting.
          </Text>
          <FlatList
            data={users}
            renderItem={({ item }) => <UserItem user={item} />}
            keyExtractor={(item) => item.user_id?.toString() || ""}
            className="w-full"
          />
        </View>
      )}
    </View>
  );
};

export default ChatsIndex;

function UserItem({ user }: { user: User }) {
  return (
    <Pressable
      onPress={() => router.push(`/(stack)/chat_room?user_id=${user.user_id}`)}
      className="flex-row items-center w-full gap-lg p-md border border-blue-500"
    >
      <View className="flex-row items-center gap-lg">
        <Image
          source={{ uri: user.avatar || DEFAULT_AVATAR }}
          className="w-10 h-10 rounded-full"
        />
        <Text className="text-foreground dark:text-foreground-dark text-lg">
          {user.name}
        </Text>
      </View>
      <View className="flex-row items-center gap-lg">
        <Text className="text-foreground dark:text-foreground-dark text-lg">
          {user.email}
        </Text>
      </View>
      <View className="flex-row items-center gap-lg">
        <Ionicons
          name="ellipsis-vertical"
          size={20}
          color="#64748b"
          accessibilityLabel="More options"
          accessibilityRole="button"
        />
      </View>
    </Pressable>
  );
}
