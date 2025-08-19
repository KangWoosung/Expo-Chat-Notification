/*
2025-08-20 03:50:50

This approach went to more problematic then older one.
Things can be worked fine, but it makes the code structure too complicated.
Common useEffect and fetch data from supabase in end components seems the best choice so far.

This provider is not used anymore.

*/

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { Database, Tables } from "@/db/supabase/supabase";
import { useChatRoomData } from "@/hooks/useChatRoomData";
import { SupabaseClient } from "@supabase/supabase-js";
import ChatRoomLoading from "@/components/chatRoom/ChatRoomLoading";
import { Text } from "react-native";
import ErrorBoundary from "@/components/app/ErrorBoundary";

type User = Tables<"users">;

interface ChatRoomContextType {
  chatRoomName: string;
  chatRoomId: string | null;
  opponentUser: User | null;
  opponentUsers: User[];
  loading: boolean;
  setChatRoomId: (id: string) => void;
}

const ChatRoomContextV2 = createContext<ChatRoomContextType | undefined>(
  undefined
);

export function ChatRoomProviderV2({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  //   const [chatRoomName, setChatRoomName] = useState<string>("");
  //   const [opponentUser, setOpponentUser] = useState<User | null>(null);
  //   const [opponentUsers, setOpponentUsers] = useState<User[]>([]);
  //   const [loading, setLoading] = useState(true);

  const { data, isLoading, error } = useChatRoomData({
    supabase: supabase as SupabaseClient<Database>,
    chatRoomId,
    currentUserId: currentUser?.id || null,
  });

  if (error) {
    console.error("Error fetching chat room data:", error);
    return <ErrorBoundary error={error}>{children}</ErrorBoundary>;
  }
  console.log("ChatRoomProviderV2 on work=======================");

  return (
    <ChatRoomContextV2.Provider
      value={{
        chatRoomName: data?.chatRoomName || "",
        chatRoomId,
        opponentUser: data?.opponentUser || null,
        opponentUsers: data?.opponentUsers || [],
        loading: isLoading,
        setChatRoomId,
      }}
    >
      {children}
    </ChatRoomContextV2.Provider>
  );
}

export function useChatRoomV2() {
  const context = useContext(ChatRoomContextV2);
  if (context === undefined) {
    throw new Error("useChatRoomV2 must be used within a ChatRoomProviderV2");
  }
  return context;
}
