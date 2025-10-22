/*
2025-10-14 11:07:55
Not used anymore




2025-10-12 08:00:00
채팅룸 목록 + Unread Count 통합 훅

역할: "내 채팅룸 목록 + 내가 읽지 않은 메시지 수 제공"
✅ 채팅룸 목록 fetch (get_user_chat_rooms)
✅ Unread Count fetch (get_user_unread_counts)
✅ React Query 캐시 관리
✅ 총 unread count 계산

반환:
  - chatRooms: ChatRoom[]
  - unreadCounts: { [roomId]: count }
  - totalUnreadCount: number
*/
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { Database } from "@/db/supabase/supabase";
import { useMemo } from "react";

// 채팅룸 타입
type ChatRoom =
  Database["public"]["Functions"]["get_user_chat_rooms"]["Returns"][0];

// Unread Count Map
interface UnreadCountMap {
  [roomId: string]: number;
}

// Query keys
export const myChatRoomsKeys = {
  all: ["myChatRooms"] as const,
  user: (userId: string) => [...myChatRoomsKeys.all, userId] as const,
};

/**
 * 내 채팅룸 목록과 각 룸의 unread count를 가져오는 훅
 *
 * @returns {
 *   chatRooms: 내가 속한 채팅룸 목록
 *   unreadCounts: 각 룸별 내가 읽지 않은 메시지 수
 *   totalUnreadCount: 모든 룸의 unread 합계
 *   isLoading: 로딩 상태
 *   error: 에러
 *   refetch: 수동 refetch 함수
 * }
 */
export function useMyChatRoomsWithUnread() {
  const { supabase } = useSupabase();
  const { user } = useUser();

  const queryResult = useQuery({
    queryKey: myChatRoomsKeys.user(user?.id || ""),
    queryFn: async () => {
      if (!supabase || !user?.id) {
        throw new Error("Supabase client or user not available");
      }

      console.log("🚀 Fetching chat rooms with unread for user:", user.id);

      // 1. 채팅룸 목록 가져오기
      const { data: chatRooms, error: roomsError } = await supabase.rpc(
        "get_user_chat_rooms",
        { p_user_id: user.id }
      );

      if (roomsError) {
        console.error("❌ Error fetching chat rooms:", roomsError);
        throw roomsError;
      }

      console.log("📋 Chat rooms fetched:", {
        count: chatRooms?.length || 0,
        rooms: chatRooms?.slice(0, 3).map((r) => r.room_id),
      });

      // 2. Unread Count 가져오기
      const { data: unreadCounts, error: unreadError } = await supabase.rpc(
        "get_user_unread_counts",
        { p_user_id: user.id }
      );

      if (unreadError) {
        console.error("❌ Error fetching unread counts:", unreadError);
        throw unreadError;
      }

      console.log("📊 Unread counts fetched:", {
        count: unreadCounts?.length || 0,
        totalUnread:
          unreadCounts?.reduce((sum, item) => sum + item.unread_count, 0) || 0,
      });

      // 3. Map으로 변환
      const unreadCountsMap = (unreadCounts ?? []).reduce((acc, item) => {
        acc[item.room_id] = item.unread_count;
        return acc;
      }, {} as UnreadCountMap);

      return {
        chatRooms: chatRooms || [],
        unreadCounts: unreadCountsMap,
      };
    },
    enabled: !!supabase && !!user?.id,
    staleTime: 1 * 60 * 1000, // 1분 동안 fresh 상태
    gcTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
  });

  // 총 unread count 계산 (모든 룸의 합)
  const totalUnreadCount = useMemo(() => {
    return Object.values(queryResult.data?.unreadCounts || {}).reduce(
      (sum, count) => sum + count,
      0
    );
  }, [queryResult.data?.unreadCounts]);

  return {
    chatRooms: queryResult.data?.chatRooms ?? [],
    unreadCounts: queryResult.data?.unreadCounts ?? {},
    totalUnreadCount,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

// Helper 함수: 특정 룸의 unread count 가져오기
export function getUnreadCountForRoom(
  unreadCounts: UnreadCountMap,
  roomId: string
): number {
  return unreadCounts[roomId] || 0;
}

// Helper 함수: unread가 있는 룸만 필터링
export function filterRoomsWithUnread(
  chatRooms: ChatRoom[],
  unreadCounts: UnreadCountMap
): ChatRoom[] {
  return chatRooms.filter((room) => (unreadCounts[room.room_id] || 0) > 0);
}

// Helper 함수: unread count 기준으로 정렬
export function sortRoomsByUnread(
  chatRooms: ChatRoom[],
  unreadCounts: UnreadCountMap,
  order: "asc" | "desc" = "desc"
): ChatRoom[] {
  return [...chatRooms].sort((a, b) => {
    const countA = unreadCounts[a.room_id] || 0;
    const countB = unreadCounts[b.room_id] || 0;
    return order === "desc" ? countB - countA : countA - countB;
  });
}
