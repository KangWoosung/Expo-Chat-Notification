import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/db/supabase/supabase";

// 레거시 메시지들을 위한 file_id 찾기 함수
export async function findFileIdFromMessage(
  supabase: SupabaseClient<Database>,
  messageId: string,
  messageContent: string
): Promise<string | null> {
  try {
    // 방법 1: message_files 테이블에서 직접 찾기 (기존 데이터)
    const { data: messageFile, error: messageFileError } = await supabase
      .from("message_files")
      .select("file_id")
      .eq("message_id", messageId)
      .single();

    if (!messageFileError && messageFile) {
      console.log("✅ Found file_id from message_files:", messageFile.file_id);
      return messageFile.file_id;
    }

    // 방법 2: public_url로 파일 찾기 (URL 매칭)
    if (messageContent && messageContent.includes("http")) {
      const { data: fileFromUrl, error: urlError } = await supabase
        .from("uploaded_files")
        .select("file_id")
        .eq("public_url", messageContent)
        .single();

      if (!urlError && fileFromUrl) {
        console.log("✅ Found file_id from URL match:", fileFromUrl.file_id);
        return fileFromUrl.file_id;
      }
    }

    console.warn("❌ Could not find file_id for message:", messageId);
    return null;
  } catch (error) {
    console.error("❌ Error finding file_id:", error);
    return null;
  }
}

// 메시지의 file_id를 업데이트하는 함수 (마이그레이션용)
export async function updateMessageFileId(
  supabase: SupabaseClient<Database>,
  messageId: string,
  fileId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("messages")
      .update({ file_id: fileId })
      .eq("message_id", messageId);

    if (error) {
      console.error("❌ Error updating message file_id:", error);
      return false;
    }

    console.log("✅ Updated message file_id:", { messageId, fileId });
    return true;
  } catch (error) {
    console.error("❌ Error in updateMessageFileId:", error);
    return false;
  }
}

