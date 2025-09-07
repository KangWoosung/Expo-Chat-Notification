/**
 * 메시지 전송을 위한 useMutation 훅
 * React Query의 useMutation을 활용하여 최적화된 메시지 전송 및 캐시 관리
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { queryKeys } from "@/constants/queryKeys";

interface SendMessageData {
  content: string;
  roomId: string;
  messageType?: "text" | "file" | "image" | "video";
  fileId?: string;
}

interface SendMessageError {
  message: string;
  code?: string;
}

export function useSendMessage() {
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();
  const queryClient = useQueryClient();

  return useMutation<void, SendMessageError, SendMessageData>({
    mutationFn: async ({ content, roomId, messageType = "text", fileId }) => {
      if (!supabase || !currentUser?.id) {
        throw new Error("인증 정보를 확인할 수 없습니다");
      }

      if (!content.trim()) {
        throw new Error("메시지 내용을 입력해주세요");
      }

      const { error } = await supabase.from("messages").insert({
        content: content.trim(),
        sender_id: currentUser.id,
        room_id: roomId,
        message_type: messageType,
        ...(fileId && { file_id: fileId }),
      });

      if (error) {
        throw new Error(error.message || "메시지 전송 중 오류가 발생했습니다");
      }
    },

    onSuccess: (_, { roomId }) => {
      if (!currentUser?.id) return;

      // 1. 해당 방의 메시지 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.room(roomId),
      });

      // 2. 개선된 메시지 쿼리 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.improved(roomId, true),
      });

      // 3. 내 채팅방 목록 캐시 무효화 (최신 메시지 업데이트를 위해)
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatRooms.mine(currentUser.id),
      });

      // 4. 읽지 않은 메시지 개수 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.unread.all,
      });
    },

    onError: (error) => {
      console.error("메시지 전송 실패:", error);
    },
  });
}

/**
 * 메시지 전송 상태를 관리하는 헬퍼 훅
 * 로딩 상태, 에러 처리, 성공 콜백 등을 간편하게 사용할 수 있도록 지원
 */
export function useSendMessageWithState() {
  const sendMessageMutation = useSendMessage();

  const sendMessage = async (data: SendMessageData) => {
    try {
      await sendMessageMutation.mutateAsync(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다",
      };
    }
  };

  return {
    sendMessage,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
    isSuccess: sendMessageMutation.isSuccess,
    reset: sendMessageMutation.reset,
  };
}
