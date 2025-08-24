import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { Tables } from "@/db/supabase/supabase";

type UploadedFile = Tables<"uploaded_files">;

// Query Keys
export const fileByIdKeys = {
  all: ["fileById"] as const,
  file: (fileId: string) => [...fileByIdKeys.all, fileId] as const,
};

// 특정 파일 ID로 파일 정보를 가져오는 훅
export function useFileById(fileId: string) {
  const { supabase } = useSupabase();

  console.log("====useFileById fileId=====", fileId);

  return useQuery({
    queryKey: fileByIdKeys.file(fileId),
    queryFn: async (): Promise<UploadedFile | null> => {
      if (!supabase || !fileId) {
        throw new Error("Supabase client or fileId not available");
      }

      const { data, error } = await supabase
        .from("uploaded_files")
        .select("*")
        .eq("file_id", fileId)
        .single();

      if (error) {
        console.error("Error fetching file:", error);
        throw error;
      }

      console.log("Fetched file by ID:", data);
      return data;
    },
    enabled: !!supabase && !!fileId,
    staleTime: 10 * 60 * 1000, // 10분 (파일 정보는 자주 변경되지 않음)
    gcTime: 15 * 60 * 1000, // 15분
  });
}
