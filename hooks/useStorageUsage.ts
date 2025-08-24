import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { Tables } from "@/db/supabase/supabase";
import { FILE_UPLOAD_LIMIT } from "@/constants/usageLimits";

type StorageUsage = Tables<"user_storage_usage">;

export interface ChartDataType {
  label: string;
  value: number;
  color: string;
}

// Query Keys
export const storageUsageKeys = {
  all: ["storageUsage"] as const,
  user: (userId: string) => [...storageUsageKeys.all, userId] as const,
};

// 스토리지 사용량을 가져오는 훅
export function useStorageUsage() {
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();

  return useQuery({
    queryKey: storageUsageKeys.user(currentUser?.id || ""),
    queryFn: async (): Promise<{
      storageUsage: number;
      chartData: ChartDataType[];
    }> => {
      if (!supabase || !currentUser?.id) {
        throw new Error("Supabase client or user not available");
      }

      const { data: storageUsage, error } = await supabase
        .from("user_storage_usage")
        .select("*")
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Error fetching storage usage:", error);
        throw error;
      }

      const totalFileSize = storageUsage?.[0]?.total_file_size || 0;

      const chartData: ChartDataType[] = [
        {
          label: "Used",
          value: totalFileSize,
          color: "rgba(131, 167, 234, 1)",
        },
        {
          label: "Available",
          value: FILE_UPLOAD_LIMIT - totalFileSize,
          color: "rgb(40, 64, 167)",
        },
      ];

      return {
        storageUsage: totalFileSize,
        chartData,
      };
    },
    enabled: !!supabase && !!currentUser?.id,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}
