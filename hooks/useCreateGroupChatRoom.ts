// hooks/useCreateGroupChatRoom.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { queryKeys } from "@/lib/queryKeys";
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

  return useMutation<
    CreateGroupChatResponse,
    CreateGroupChatError,
    CreateGroupChatData
  >({
    mutationFn: async ({ name, memberUserIds }) => {
      if (!supabase || !currentUser?.id) {
        throw new Error("Unauthorized user");
      }

      console.log("🚀 Creating group chat room:", {
        name,
        createdBy: currentUser.id,
        memberIds: memberUserIds,
      });

      // RPC function call
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
        throw new Error(error.message || "Failed to create group chat room");
      }

      if (!roomId) {
        throw new Error("Failed to get chat room ID");
      }

      console.log("✅ Group chat room created successfully:", roomId);

      return { roomId };
    },

    onSuccess: ({ roomId }, variables) => {
      if (!currentUser?.id) return;

      console.log("🔄 Invalidating caches after group chat creation");

      // Invalidate cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatRooms.mine(currentUser.id),
      });

      // Invalidate all chat rooms cache (for other users' cache update)
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
 * Helper hook to manage group chat creation state
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
          error instanceof Error ? error.message : "Unknown error occurred",
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
