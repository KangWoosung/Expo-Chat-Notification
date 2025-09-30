/*
2025-08-20 01:40:07



*/

import { Database } from "@/db/supabase/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";

type UseChatRoomDataProps = {
  chatRoomId: string | null;
  currentUserId: string | null;
  supabase: SupabaseClient<Database>;
};

export function useChatRoomData({
  supabase,
  chatRoomId,
  currentUserId,
}: UseChatRoomDataProps) {
  return useQuery({
    queryKey: queryKeys.chatRooms.detail(chatRoomId || "", currentUserId || ""),
    queryFn: async () => {
      if (!chatRoomId || !currentUserId || !supabase) return null;

      // 멤버 조회
      const { data: members, error: membersError } = await supabase
        .from("chat_room_members")
        .select("*")
        .eq("room_id", chatRoomId)
        .neq("user_id", currentUserId);

      if (membersError) throw membersError;
      if (!members) return null;

      // 1:1 대화
      if (members.length === 1) {
        const { data: opponent, error: opponentError } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", members[0].user_id)
          .single();
        if (opponentError) throw opponentError;

        return {
          type: "direct" as const,
          chatRoomName: `Chat with ${opponent.name}`,
          opponentUser: opponent,
          opponentUsers: [],
        };
      }

      // 그룹 채팅
      const { data: chatRoomName, error: roomError } = await supabase
        .from("chat_rooms")
        .select("name")
        .eq("room_id", chatRoomId)
        .single();
      if (roomError) throw roomError;

      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*")
        .in(
          "user_id",
          members.map((m) => m.user_id)
        );
      if (usersError) throw usersError;

      return {
        type: "group" as const, // group chat
        chatRoomName: `Group Chat: ${chatRoomName.name}`,
        opponentUser: null,
        opponentUsers: users,
      };
    },
    enabled: !!chatRoomId && !!currentUserId, // 조건 만족할 때만 실행
  });
}
