/*
supabase. fetch with tanstack query


*/

import { Database } from "@/db/supabase/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

type UseFetchAllUsersProps = {
  currentUserId: string;
  supabase: SupabaseClient<Database> | null;
  pageStart: number;
  pageEnd: number;
};

export function useFetchAllUsers({
  currentUserId,
  supabase,
  pageStart,
  pageEnd,
}: UseFetchAllUsersProps) {
  console.log("===queryKey", queryKeys.users.allUsers(pageStart, pageEnd));
  return useQuery({
    queryKey: queryKeys.users.allUsers(pageStart, pageEnd),
    queryFn: async () => {
      if (!supabase || !currentUserId) {
        throw new Error("Supabase client or user not available");
      }
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .not("user_id", "eq", currentUserId)
        .limit(pageEnd - pageStart)
        .range(pageStart, pageEnd)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!supabase && !!currentUserId,
    // placeholderData 제거하여 캐시 간섭 방지
  });
}
