import React, { createContext, useContext, useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { Tables } from "@/supabase/supabase";

type User = Tables<"users">;

interface ChatRoomContextType {
  chatRoomName: string;
  chatRoomId: string | null;
  opponentUser: User | null;
  opponentUsers: User[];
  loading: boolean;
  setChatRoomId: (id: string) => void;
}

const ChatRoomContext = createContext<ChatRoomContextType | undefined>(
  undefined
);

export function ChatRoomProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [chatRoomName, setChatRoomName] = useState<string>("");
  const [opponentUser, setOpponentUser] = useState<User | null>(null);
  const [opponentUsers, setOpponentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !chatRoomId || !currentUser?.id) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      const { data: roomData, error: roomError } = await supabase
        .from("chat_room_members")
        .select("*")
        .eq("room_id", chatRoomId)
        .neq("user_id", currentUser.id);

      if (roomError) {
        console.error("Error fetching room:", roomError);
        setLoading(false);
        return;
      }

      // 1:1 chat room : get opponent user data
      if (roomData.length === 1) {
        const opponentMember = roomData[0];
        const { data: opponentUserData, error: opponentError } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", opponentMember.user_id)
          .single();

        if (opponentError) {
          console.error("Error fetching opponent user:", opponentError);
          setLoading(false);
          return;
        }

        setOpponentUser(opponentUserData);
        setChatRoomName("Chat with " + opponentUserData.name);
        setChatRoomId(chatRoomId);
        setLoading(false);
      } else if (roomData.length > 1) {
        // group chat room : get chat room name
        const { data: chatRoomData, error: chatRoomError } = await supabase
          .from("chat_rooms")
          .select("name")
          .eq("room_id", chatRoomId)
          .single();

        if (chatRoomError) {
          console.error("Error fetching chat room:", chatRoomError);
          setLoading(false);
          return;
        }

        // get all users data in the room
        const { data: usersInRoomData, error: usersInRoomError } =
          await supabase
            .from("users")
            .select("*")
            .in(
              "user_id",
              roomData.map((member) => member.user_id)
            );

        if (usersInRoomError) {
          console.error("Error fetching users in room:", usersInRoomError);
          setLoading(false);
          return;
        }

        setChatRoomName("Group Chat: " + chatRoomData.name);
        setChatRoomId(chatRoomId);
        setOpponentUsers(usersInRoomData);
        setLoading(false);
      }
    })();
  }, [chatRoomId, supabase, currentUser?.id]);

  return (
    <ChatRoomContext.Provider
      value={{
        chatRoomName,
        chatRoomId,
        opponentUser,
        opponentUsers,
        loading,
        setChatRoomId,
      }}
    >
      {children}
    </ChatRoomContext.Provider>
  );
}

export function useChatRoom() {
  const context = useContext(ChatRoomContext);
  if (context === undefined) {
    throw new Error("useChatRoom must be used within a ChatRoomProvider");
  }
  return context;
}
