import React, { createContext, useContext, useEffect, useState } from "react";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { Tables } from "@/db/supabase/supabase";

type User = Tables<"users">;

interface ChatRoomContextType {
  chatRoomName: string;
  chatRoomId: string | null;
  opponentUser: User | null;
  opponentUsers: User[];
  createdBy: string | null;
  loading: boolean;
  isGroupChat: boolean;
  isDirectChat: boolean;
  setChatRoomId: (id: string) => void;
}

const ChatRoomContext = createContext<ChatRoomContextType | undefined>(
  undefined
);

export function ChatRoomProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [createdBy, setCreatedBy] = useState<string | null>(null);
  const [chatRoomName, setChatRoomName] = useState<string>("");
  const [opponentUser, setOpponentUser] = useState<User | null>(null);
  const [opponentUsers, setOpponentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [isDirectChat, setIsDirectChat] = useState(false);

  useEffect(() => {
    if (!supabase || !chatRoomId || !currentUser?.id) {
      setLoading(false);
      return;
    }

    // Reset states when chat room changes
    setOpponentUser(null);
    setOpponentUsers([]);
    setIsDirectChat(false);
    setIsGroupChat(false);

    (async () => {
      setLoading(true);

      // get chat room data
      const { data: chatRoomData, error: chatRoomError } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("room_id", chatRoomId)
        .single();

      if (chatRoomError) {
        console.error("Error fetching chat room:", chatRoomError);
        setLoading(false);
        return;
      }

      setCreatedBy(chatRoomData.created_by);

      const { data: chatRoomMembersData, error: chatRoomMembersError } =
        await supabase
          .from("chat_room_members")
          .select("*")
          .eq("room_id", chatRoomId)
          .neq("user_id", currentUser.id);

      if (chatRoomMembersError) {
        console.error(
          "Error fetching chat room members:",
          chatRoomMembersError
        );
        setLoading(false);
        return;
      }

      // 1:1 chat room : get opponent user data
      if (chatRoomMembersData.length === 1) {
        const opponentMember = chatRoomMembersData[0];
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
        setOpponentUsers([]); // Clear group users for direct chat
        setChatRoomName("Chat with " + opponentUserData.name);
        setChatRoomId(chatRoomId);
        setIsDirectChat(true);
        setIsGroupChat(false);
        setLoading(false);
      } else if (chatRoomMembersData.length > 1) {
        // group chat room : use already fetched chat room data
        const groupChatRoomName = chatRoomData.name;
        setChatRoomName("Group Chat: " + groupChatRoomName);
        setChatRoomId(chatRoomId);

        // get all users data in the room
        const { data: usersInRoomData, error: usersInRoomError } =
          await supabase
            .from("users")
            .select("*")
            .in(
              "user_id",
              chatRoomMembersData.map((member) => member.user_id)
            );

        if (usersInRoomError) {
          console.error("Error fetching users in room:", usersInRoomError);
          setLoading(false);
          return;
        }

        setOpponentUser(null); // Clear direct chat user for group chat
        setOpponentUsers(usersInRoomData);
        setIsDirectChat(false);
        setIsGroupChat(true);
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
        createdBy,
        loading,
        isGroupChat,
        isDirectChat,
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
