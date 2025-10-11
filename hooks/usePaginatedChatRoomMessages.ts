/*
2025-10-12 07:20:13
통합된 페이지네이션 + 파일 정보 + Unread Count 훅
- React Query의 useInfiniteQuery 사용
- 파일 정보 자동 조합
- Unread Count 포함
*/
// hooks/usePaginatedChatRoomMessages.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { Tables } from "@/db/supabase/supabase";
import { useMemo } from "react";

// 개선된 메시지 타입 (file_id 직접 포함)
export type ImprovedMessage = Tables<"messages"> & {
  uploaded_files?: Tables<"uploaded_files"> | null;
};

interface UnreadCountMap {
  [messageId: string]: number;
}

const MESSAGES_PER_PAGE = 50;

// Query keys
export const paginatedMessagesKeys = {
  all: ["paginatedMessages"] as const,
  room: (roomId: string) => [...paginatedMessagesKeys.all, roomId] as const,
};

export function usePaginatedChatRoomMessages(
  roomId: string,
  includeFileInfo = true
) {
  const { supabase } = useSupabase();

  const queryResult = useInfiniteQuery({
    queryKey: paginatedMessagesKeys.room(roomId),
    queryFn: async ({ pageParam = 0 }) => {
      if (!supabase || !roomId) {
        throw new Error("Supabase client or roomId not available");
      }

      console.log("🚀 Fetching page:", pageParam, "for room:", roomId);

      // 1. 메시지 가져오기 (오래된 것부터 - ascending)
      const from = pageParam * MESSAGES_PER_PAGE;
      const to = from + MESSAGES_PER_PAGE - 1;

      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("sent_at", { ascending: true })
        .range(from, to);

      if (messagesError) throw messagesError;
      if (!messages || messages.length === 0) {
        return {
          messages: [],
          unreadCounts: {},
          nextPage: null,
        };
      }

      console.log("📋 Messages fetched:", {
        count: messages.length,
        page: pageParam,
        withFileId: messages.filter((msg) => msg.file_id !== null).length,
      });

      // 2. 파일 정보 가져오기 (includeFileInfo가 true일 때만)
      let messagesWithFiles: ImprovedMessage[] = messages;

      if (includeFileInfo) {
        const fileIds = messages
          .map((msg) => msg.file_id)
          .filter((id) => id !== null) as string[];

        if (fileIds.length > 0) {
          const { data: files, error: filesError } = await supabase
            .from("uploaded_files")
            .select("*")
            .in("file_id", fileIds);

          if (filesError) throw filesError;

          messagesWithFiles = messages.map((message) => {
            if (message.file_id) {
              const fileInfo = files?.find(
                (file) => file.file_id === message.file_id
              );
              return {
                ...message,
                uploaded_files: fileInfo || null,
              };
            }
            return message;
          });
        }
      }

      // 3. Unread Count 가져오기
      const { data: counts } = await supabase.rpc(
        "get_room_messages_unread_counts",
        { p_room_id: roomId, p_limit: MESSAGES_PER_PAGE, p_offset: from }
      );

      const unreadCountsMap = (counts ?? []).reduce((acc, item) => {
        acc[item.message_id] = item.unread_count;
        return acc;
      }, {} as UnreadCountMap);

      return {
        messages: messagesWithFiles,
        unreadCounts: unreadCountsMap,
        nextPage: messages.length === MESSAGES_PER_PAGE ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!supabase && !!roomId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // 모든 페이지의 메시지와 unreadCounts 평탄화
  const allMessages = useMemo(() => {
    return queryResult.data?.pages.flatMap((page) => page.messages) ?? [];
  }, [queryResult.data]);

  const allUnreadCounts = useMemo(() => {
    return (
      queryResult.data?.pages.reduce((acc, page) => {
        return { ...acc, ...page.unreadCounts };
      }, {} as UnreadCountMap) ?? {}
    );
  }, [queryResult.data]);

  return {
    messages: allMessages,
    unreadCounts: allUnreadCounts,
    isLoading: queryResult.isLoading,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    hasNextPage: queryResult.hasNextPage,
    fetchNextPage: queryResult.fetchNextPage,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

// Helper 함수들 (useImprovedChatRoomMessages와 동일)
export function getFileId(message: ImprovedMessage): string | null {
  return message.file_id || null;
}

export function getFileInfo(
  message: ImprovedMessage
): Tables<"uploaded_files"> | null {
  return message.uploaded_files || null;
}

export function hasFile(message: ImprovedMessage): boolean {
  return !!message.file_id;
}

export function filterTextMessages(
  messages: ImprovedMessage[]
): ImprovedMessage[] {
  return messages.filter((msg) => !msg.file_id);
}

export function filterFileMessages(
  messages: ImprovedMessage[]
): ImprovedMessage[] {
  return messages.filter((msg) => !!msg.file_id);
}
