/*
2025-08-11 13:50:11
Rules to create a new chat room:
1. Default 1:1 chat room name is "Direct Chat"
2. Default multi user chat room name is "Group Chat"
3. If there is no "Direct Chat" between current user and target user, create a new "Direct Chat"
4. If new "Direct Chat" is created, add current user and target user with new room_id 
  to chat_room_members table and then move to the chat room
5. If a "Direct Chat" exists between current user and target user, move to the chat room

2025-08-11 22:44:15
Using supabase.rpc("find_or_create_direct_room") to create a new chat room
By using this function, create a new chat_room and insert current user and target user 
to chat_room_members table will be automatically done.

*/
// app/(stack)/chat_room/index.tsx
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { Tables } from "@/supabase/supabase";

type User = Tables<"users">;

export default function ChatRoomIndex() {
  const { user_id: targetUserId } = useLocalSearchParams<{ user_id: string }>();
  const router = useRouter();
  const [chatRoomIndexLoading, setChatRoomIndexLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!targetUserId || !supabase) return;

    (async () => {
      try {
        // Authentication check
        if (!isSignedIn || !currentUser?.id) {
          throw new Error("Authentication required");
        }

        // find_or_create_direct_room
        const { data: roomId, error: roomIdError } = await supabase
          .rpc("find_or_create_direct_room", {
            a: currentUser.id,
            b: targetUserId,
          })
          .single();
        // console.log("ChatRoomIndex -- roomId", roomId);

        setChatRoomIndexLoading(false);
        // Move to chat room
        router.replace(`/chat_room/id/${roomId}`);
      } catch (err) {
        console.error("Error preparing chat room:", err);
      } finally {
        setChatRoomIndexLoading(false);
      }
    })();
  }, [targetUserId, isSignedIn, currentUser?.id]);

  if (chatRoomIndexLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-blank dark:bg-background-dark">
        <ActivityIndicator size="large" />
        <Text className="text-foreground dark:text-foreground-dark">
          Loading chat room...
        </Text>
      </View>
    );
  }

  return null;
}
