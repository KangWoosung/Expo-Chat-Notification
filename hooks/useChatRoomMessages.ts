import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { Tables } from "@/db/supabase/supabase";

// 확장된 메시지 타입 (파일 정보 포함)
export type MessageWithFiles = Tables<"messages"> & {
  message_files?: Array<{
    file_id: string;
    uploaded_files: Tables<"uploaded_files">;
  }>;
};

// Query keys for chat room messages
export const chatRoomMessagesKeys = {
  all: ["chatRoomMessages"] as const,
  room: (roomId: string) => [...chatRoomMessagesKeys.all, roomId] as const,
};

// 채팅방 메시지를 파일 정보와 함께 가져오는 훅
export function useChatRoomMessages(roomId: string) {
  const { supabase } = useSupabase();

  return useQuery({
    queryKey: chatRoomMessagesKeys.room(roomId),
    queryFn: async (): Promise<MessageWithFiles[]> => {
      if (!supabase || !roomId) {
        throw new Error("Supabase client or roomId not available");
      }

      console.log("🔍 Fetching messages with file info for room:", roomId);

      // 메시지와 파일 정보를 함께 가져오는 최적화된 쿼리
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          message_files(
            file_id,
            uploaded_files(
              file_id,
              file_name,
              file_size,
              mime_type,
              public_url,
              user_id,
              created_at
            )
          )
        `
        )
        .eq("room_id", roomId)
        .order("sent_at", { ascending: true });

      if (error) {
        console.error("❌ Error fetching messages with files:", error);
        throw error;
      }

      console.log("✅ Messages with files fetched:", {
        count: data?.length || 0,
        messagesWithFiles:
          data?.filter(
            (msg) => msg.message_files && msg.message_files.length > 0
          ).length || 0,
      });

      return data || [];
    },
    enabled: !!supabase && !!roomId,
    staleTime: 2 * 60 * 1000, // 2분 (실시간성이 중요)
    gcTime: 5 * 60 * 1000, // 5분
  });
}

// 채팅방 메시지 캐시를 무효화하는 훅
export function useInvalidateChatRoomMessages() {
  const queryClient = useQueryClient();

  return (roomId: string) => {
    queryClient.invalidateQueries({
      queryKey: chatRoomMessagesKeys.room(roomId),
    });
  };
}

// 새 메시지 추가 시 캐시 업데이트
export function useAddMessageToCache() {
  const queryClient = useQueryClient();

  return (roomId: string, newMessage: MessageWithFiles) => {
    queryClient.setQueryData(
      chatRoomMessagesKeys.room(roomId),
      (oldData: MessageWithFiles[] | undefined) => {
        if (!oldData) return [newMessage];
        return [...oldData, newMessage];
      }
    );
  };
}

// 메시지에서 파일 정보 추출 헬퍼 함수
export function getMessageFiles(message: MessageWithFiles) {
  return message.message_files?.map((mf) => mf.uploaded_files) || [];
}

// 메시지에 첨부된 첫 번째 파일의 file_id 가져오기
export function getFirstFileId(message: MessageWithFiles): string | null {
  const files = getMessageFiles(message);
  return files.length > 0 ? files[0].file_id : null;
}

