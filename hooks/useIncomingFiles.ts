import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { Tables } from "@/db/supabase/supabase";
import { queryClient } from "@/lib/queryClient";

type UploadedFile = Tables<"uploaded_files">;

// Query keys for incoming files
export const incomingFilesKeys = {
  all: ["incomingFiles"] as const,
  user: (userId: string) => [...incomingFilesKeys.all, userId] as const,
};

// 다른 사람이 나에게 보낸 파일 목록을 가져오는 훅
export function useIncomingFiles() {
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();

  return useQuery({
    queryKey: incomingFilesKeys.user(currentUser?.id || ""),
    queryFn: async (): Promise<UploadedFile[]> => {
      if (!supabase || !currentUser?.id) {
        throw new Error("Supabase client or user not available");
      }

      // 단계별로 나누어서 쿼리 실행
      // 1. 먼저 내가 멤버인 채팅방의 room_id들을 가져옴
      const { data: myRooms, error: roomsError } = await supabase
        .from("chat_room_members")
        .select("room_id")
        .eq("user_id", currentUser.id);

      if (roomsError) {
        console.error("❌ Error fetching my rooms:", roomsError);
        throw roomsError;
      }

      const myRoomIds = myRooms?.map((room) => room.room_id) || [];

      if (myRoomIds.length === 0) {
        console.log("⚠️ No chat rooms found for user - returning empty array");
        return [];
      }

      // 2. RLS 정책 확인을 위한 기본 테이블 접근 테스트

      // uploaded_files 테이블 직접 접근 테스트
      const { data: allFiles, error: allFilesError } = await supabase
        .from("uploaded_files")
        .select("file_id, file_name, user_id")
        .limit(5);

      console.log("📋 uploaded_files direct access:", {
        count: allFiles?.length || 0,
        error: allFilesError,
        sample: allFiles?.slice(0, 2),
      });

      // message_files 테이블 직접 접근 테스트
      const { data: allMessageFiles, error: messageFilesError } = await supabase
        .from("message_files")
        .select("message_id, file_id")
        .limit(5);

      console.log("📋 message_files direct access:", {
        count: allMessageFiles?.length || 0,
        error: messageFilesError,
        sample: allMessageFiles?.slice(0, 2),
      });

      // 3. 해당 채팅방들의 메시지에 첨부된 파일들을 가져옴 (내가 보낸 파일 제외)
      console.log("🔍 Step 2: Fetching incoming files for rooms:", myRoomIds);
      const { data, error } = await supabase
        .from("uploaded_files")
        .select(
          `
          *,
          message_files!inner(
            message_id,
            messages!inner(
              sender_id,
              room_id,
              sent_at
            )
          )
        `
        )
        .neq("message_files.messages.sender_id", currentUser.id) // 내가 보낸 파일 제외
        .in("message_files.messages.room_id", myRoomIds) // 내가 속한 채팅방의 메시지만
        .order("created_at", { ascending: false });

      console.log("📊 Incoming files query result:", { data, error });
      console.log("📈 Files count:", data?.length || 0);

      if (error) {
        console.error("❌ Error fetching incoming files:", error);
        console.error("❌ Error details:", JSON.stringify(error, null, 2));

        // RLS 정책 관련 에러인지 확인
        if (
          error.message?.includes("policy") ||
          error.message?.includes("permission")
        ) {
          console.error("🚨 This appears to be an RLS policy error!");
          console.error(
            "💡 Please run the fix_rls_policies.sql script in your database"
          );
        }

        throw error;
      }

      // 추가 검증: 해당 채팅방에 메시지가 있는지 확인
      const { data: messagesCheck } = await supabase
        .from("messages")
        .select("message_id, sender_id, room_id")
        .in("room_id", myRoomIds)
        .neq("sender_id", currentUser.id);

      console.log(
        "📮 Messages from others in my rooms:",
        messagesCheck?.length || 0
      );

      // 추가 검증: message_files 테이블에 데이터가 있는지 확인 (RLS 정책 적용 후)
      const { data: messageFilesCheck, error: messageFilesCheckError } =
        await supabase.from("message_files").select("message_id, file_id");

      console.log(
        "📎 Total message_files entries:",
        messageFilesCheck?.length || 0,
        messageFilesCheckError ? "Error: " + messageFilesCheckError.message : ""
      );

      console.log("✅ Final incoming files result:", data);
      return data || [];
    },
    enabled: !!supabase && !!currentUser?.id,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

// incoming 파일 캐시를 무효화하는 훅
export function useInvalidateIncomingFiles() {
  // const queryClient = useQueryClient();
  const { user: currentUser } = useUser();

  return () => {
    if (currentUser?.id) {
      queryClient.invalidateQueries({
        queryKey: incomingFilesKeys.user(currentUser.id),
      });
    }
  };
}
