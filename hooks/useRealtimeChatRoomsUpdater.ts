/*
2025-10-12 16:18:24

Usage:
const ExistingChatRooms = () => {
  const { chatRooms, unreadCounts } = useMyChatRoomsWithUnread();
  useRealtimeChatRoomsUpdater(); // ✅ 추가
  
  // ...
};


*/
// hooks/useRealtimeChatRoomsUpdater.ts
import { useEffect } from "react";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { myChatRoomsKeys } from "@/hooks/useMyChatRoomsWithUnread";

export function useRealtimeChatRoomsUpdater() {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase || !user?.id) return;

    // @ts-ignore
    const channel = supabase
      .channel(`chatrooms-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload: any) => {
          queryClient.setQueryData(
            myChatRoomsKeys.user(user.id),
            (oldData: any) => {
              /* update */
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.id, queryClient]);
}
