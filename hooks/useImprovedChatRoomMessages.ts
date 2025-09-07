import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { Tables } from "@/db/supabase/supabase";
import { queryKeys } from "@/constants/queryKeys";

// 개선된 메시지 타입 (file_id 직접 포함)
export type ImprovedMessage = Tables<"messages"> & {
  uploaded_files?: Tables<"uploaded_files">; // 필요시 JOIN
};

// Query keys (기존 호환성 유지)
export const improvedMessagesKeys = {
  all: ["improvedMessages"] as const,
  room: (roomId: string) => queryKeys.messages.improved(roomId, true),
};

// 🚀 개선된 메시지 훅 (훨씬 간단한 쿼리)
export function useImprovedChatRoomMessages(
  roomId: string,
  includeFileInfo = true
) {
  const { supabase } = useSupabase();

  return useQuery({
    queryKey: improvedMessagesKeys.room(roomId),
    queryFn: async (): Promise<ImprovedMessage[]> => {
      if (!supabase || !roomId) {
        throw new Error("Supabase client or roomId not available");
      }

      console.log(
        "🚀 Fetching messages with improved schema for room:",
        roomId
      );

      // 🚀 단계별 쿼리로 relationship 충돌 회피
      // 1. 메시지 먼저 가져오기
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("sent_at", { ascending: true });

      if (messagesError) throw messagesError;
      if (!messages || messages.length === 0) return [];

      console.log("📋 Messages fetched:", {
        count: messages.length,
        withFileId: messages.filter((msg) => msg.file_id !== null).length,
        sampleMessages: messages.slice(0, 3).map((msg) => ({
          id: msg.message_id,
          type: msg.message_type,
          file_id: msg.file_id,
          hasContent: !!msg.content,
        })),
      });

      if (!includeFileInfo) {
        // 파일 정보가 불필요한 경우
        return messages;
      }

      // 2. 파일 정보가 필요한 경우, 파일 ID가 있는 메시지들의 파일 정보 가져오기
      const fileIds = messages
        .map((msg) => msg.file_id)
        .filter((id) => id !== null) as string[];

      if (fileIds.length === 0) {
        // 파일이 첨부된 메시지가 없는 경우
        return messages;
      }

      const { data: files, error: filesError } = await supabase
        .from("uploaded_files")
        .select("*")
        .in("file_id", fileIds);

      if (filesError) throw filesError;

      // 3. 메시지와 파일 정보 조합
      const messagesWithFiles = messages.map((message) => {
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

      return messagesWithFiles;
    },
    enabled: !!supabase && !!roomId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// 파일 ID 가져오기 (매우 간단)
export function getFileId(message: ImprovedMessage): string | null {
  return message.file_id || null;
}

// 파일 정보 가져오기
export function getFileInfo(
  message: ImprovedMessage
): Tables<"uploaded_files"> | null {
  return message.uploaded_files || null;
}

// 메시지가 파일을 포함하는지 확인
export function hasFile(message: ImprovedMessage): boolean {
  return !!message.file_id;
}

// 메시지 타입별 필터링
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
