import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { Tables } from "@/db/supabase/supabase";
import { queryClient } from "@/lib/queryClient";

type UploadedFile = Tables<"uploaded_files">;

// Query Keys
export const uploadedFilesKeys = {
  all: ["uploadedFiles"] as const,
  user: (userId: string) => [...uploadedFilesKeys.all, userId] as const,
};

// 업로드된 파일 목록을 가져오는 훅
export function useUploadedFiles() {
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();

  return useQuery({
    queryKey: uploadedFilesKeys.user(currentUser?.id || ""),
    queryFn: async (): Promise<UploadedFile[]> => {
      if (!supabase || !currentUser?.id) {
        throw new Error("Supabase client or user not available");
      }

      const { data, error } = await supabase
        .from("uploaded_files")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching files:", error);
        throw error;
      }

      console.log("Fetched uploaded files:", data);
      return data || [];
    },
    enabled: !!supabase && !!currentUser?.id,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

// 파일 업로드 후 캐시를 무효화하는 훅
export function useInvalidateUploadedFiles() {
  // const queryClient = useQueryClient();
  const { user: currentUser } = useUser();

  return () => {
    if (currentUser?.id) {
      queryClient.invalidateQueries({
        queryKey: uploadedFilesKeys.user(currentUser.id),
      });
    }
  };
}

// 파일 삭제 mutation (예시)
export function useDeleteUploadedFile() {
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      if (!supabase || !currentUser?.id) {
        throw new Error("Supabase client or user not available");
      }

      const { error } = await supabase
        .from("uploaded_files")
        .delete()
        .eq("file_id", fileId)
        .eq("user_id", currentUser.id);

      if (error) {
        throw error;
      }

      return fileId;
    },
    onSuccess: () => {
      // 파일 삭제 성공 시 캐시 무효화
      if (currentUser?.id) {
        queryClient.invalidateQueries({
          queryKey: uploadedFilesKeys.user(currentUser.id),
        });
      }
    },
  });
}
