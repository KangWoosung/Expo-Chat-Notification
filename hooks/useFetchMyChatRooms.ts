/*






*/

import { Database } from "@/db/supabase/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";

type UseFetchMyChatRoomsProps = {
  supabase: SupabaseClient<Database> | null;
  currentUserId: string | null;
};

export function useFetchMyChatRooms({
  supabase,
  currentUserId,
}: UseFetchMyChatRoomsProps) {
  return useQuery({
    queryKey: queryKeys.chatRooms.mine(currentUserId || ""),
    queryFn: async () => {
      if (!supabase || !currentUserId) {
        throw new Error("Supabase client or user not available");
      }
      const { data, error } = await supabase.rpc("get_user_chat_rooms", {
        p_user_id: currentUserId,
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!supabase && !!currentUserId,
    placeholderData: (prev) => prev, // 이전 데이터 유지
  });
}
