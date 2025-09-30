/*
2025-10-01 07:47:37
Tanstack useMutation Query Key 관련, 글로벌 정책이 필요하다.



*/
// hooks/useCreateGroupChatRoom.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { queryKeys } from "@/constants/queryKeys";
import { router } from "expo-router";
import { queryClient } from "@/lib/queryClient";

interface CreateGroupChatData {
  name: string;
  memberUserIds: string[];
}

interface CreateGroupChatResponse {
  roomId: string;
}

interface CreateGroupChatError {
  message: string;
  code?: string;
}

export function useCreateGroupChatRoom() {
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();
  // const queryClient = useQueryClient();

  return useMutation<
    CreateGroupChatResponse,
    CreateGroupChatError,
    CreateGroupChatData
  >({
    mutationFn: async ({ name, memberUserIds }) => {
      if (!supabase || !currentUser?.id) {
        throw new Error("인증 정보를 확인할 수 없습니다");
      }

      console.log("🚀 Creating group chat room:", {
        name,
        createdBy: currentUser.id,
        memberIds: memberUserIds,
      });

      // RPC 함수 호출
      const { data: roomId, error } = await supabase.rpc(
        "create_group_chat_room",
        {
          p_name: name,
          p_created_by: currentUser.id,
          p_member_ids: memberUserIds,
        }
      );

      if (error) {
        console.error("❌ Group chat creation failed:", error);
        throw new Error(error.message || "그룹 채팅방 생성에 실패했습니다");
      }

      if (!roomId) {
        throw new Error("채팅방 ID를 받을 수 없습니다");
      }

      console.log("✅ Group chat room created successfully:", roomId);

      return { roomId };
    },

    onSuccess: ({ roomId }, variables) => {
      if (!currentUser?.id) return;

      console.log("🔄 Invalidating caches after group chat creation");

      // 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatRooms.mine(currentUser.id),
      });

      // 전체 채팅방 캐시도 무효화 (다른 사용자들의 캐시 갱신을 위해)
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatRooms.all,
      });

      console.log(
        "🎉 Group chat created successfully! Moving to chat room:",
        roomId
      );
    },

    onError: (error, variables) => {
      console.error("❌ Group chat creation error:", {
        error: error.message,
        variables,
      });
    },
  });
}

/**
 * 그룹 채팅방 생성 상태를 관리하는 헬퍼 훅
 */
export function useCreateGroupChatRoomWithState() {
  const createGroupChatMutation = useCreateGroupChatRoom();

  const createGroupChat = async (data: CreateGroupChatData) => {
    try {
      const result = await createGroupChatMutation.mutateAsync(data);
      return {
        success: true,
        roomId: result.roomId,
      };
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
    createGroupChat,
    isLoading: createGroupChatMutation.isPending,
    error: createGroupChatMutation.error,
    isSuccess: createGroupChatMutation.isSuccess,
    reset: createGroupChatMutation.reset,
  };
}
