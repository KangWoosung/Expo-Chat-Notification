import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/db/supabase/supabase";
import { FILE_DELETED_CONTENT_TEXT } from "@/constants/constants";
import { Image as ExpoImage } from "expo-image";

const BUCKET_NAME = process.env.EXPO_PUBLIC_SUPABASE_BUCKET_NAME!;

interface DeleteFileCompletelyOptions {
  supabase: SupabaseClient<Database>;
  fileId: string;
  userId: string;
}

interface DeleteFileResult {
  success: boolean;
  error?: string;
}

/**
 * Utility function to completely delete a file
 * 1. Fetch file info from Database (storage_path, file_name)
 * 2. Fetch related message IDs from message_files table (for message content update)
 * 3. Delete file from Supabase Storage
 * 4. Update content of related messages to "FILE_DELETED_CONTENT (file_name)"
 * 5. Delete uploaded_files row from Database (CASCADE delete in message_files, trigger for user_storage_usage)
 * 6. Clear expo-image cache for better UI consistency
 */
export async function deleteFileCompletely({
  supabase,
  fileId,
  userId,
}: DeleteFileCompletelyOptions): Promise<DeleteFileResult> {
  try {
    // 1. Fetch file info to get storage_path
    const { data: fileData, error: fetchError } = await supabase
      .from("uploaded_files")
      .select("storage_path, file_name")
      .eq("file_id", fileId)
      .eq("user_id", userId) // Security check
      .single();

    if (fetchError) {
      console.error("deleteFileCompletely File info fetch error:", fetchError);
      return {
        success: false,
        error: `File info not found: ${fetchError.message}`,
      };
    }

    if (!fileData) {
      return {
        success: false,
        error: "File not found",
      };
    }

    const { storage_path, file_name } = fileData;

    // 2. Fetch related message IDs (for message content update)
    const { data: messageFiles, error: messageFilesError } = await supabase
      .from("message_files")
      .select("message_id")
      .eq("file_id", fileId);

    if (messageFilesError) {
      console.error(
        "deleteFileCompletely Message files fetch error:",
        messageFilesError
      );
      // Continue to delete file even if message files fetch fails
    }

    const messageIds = messageFiles?.map((mf) => mf.message_id) || [];

    // 3. Delete file from Supabase Storage

    const { error: storageDeleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storage_path]);

    if (storageDeleteError) {
      console.error(
        "deleteFileCompletely Storage file delete error:",
        storageDeleteError
      );
      // Continue to delete database even if storage delete fails
      // This is a business logic decision
      console.warn(
        "Storage file delete failed, but continue to delete database"
      );
    }

    // 4. Update content of related messages
    if (messageIds.length > 0) {
      const { error: messageUpdateError } = await supabase
        .from("messages")
        .update({
          content: `${FILE_DELETED_CONTENT_TEXT} (${file_name})`,
          // message_type is kept as is (file/image/video type)
        })
        .in("message_id", messageIds);

      if (messageUpdateError) {
        console.error(
          "deleteFileCompletely Message update error:",
          messageUpdateError
        );
        // Continue to delete file even if message update fails
        console.warn("Message update failed, but continue to delete file");
      } else {
        console.log(`📝 ${messageIds.length} messages updated`);
      }
    }

    // 5. Delete file record from Database
    // Cascade delete by FK constraint in message_files table
    const { error: dbDeleteError } = await supabase
      .from("uploaded_files")
      .delete()
      .eq("file_id", fileId)
      .eq("user_id", userId); // Security check

    if (dbDeleteError) {
      console.error(
        "deleteFileCompletely Database file delete error:",
        dbDeleteError
      );
      return {
        success: false,
        error: `File delete failed: ${dbDeleteError.message}`,
      };
    }

    // 6. Clear expo-image cache for the deleted file
    try {
      // Clear specific URL from cache (if the file had a public_url)
      if (fileData.storage_path) {
        // Clear both memory and disk cache for better cleanup
        await ExpoImage.clearMemoryCache();
        await ExpoImage.clearDiskCache();
        console.log("🧹 Expo-image cache cleared");
      }
    } catch (cacheError) {
      console.warn(
        "Cache clear failed, but file deletion was successful:",
        cacheError
      );
    }

    console.log(`✅ File deleted: ${file_name} (${fileId})`);
    if (messageIds.length > 0) {
      console.log(`🔗 ${messageIds.length} messages updated`);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("deleteFileCompletely Unexpected error:", error);
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * React Hook form style helper function
 * Can be used more conveniently in components
 */
export function createDeleteFileHandler(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  return async (fileId: string): Promise<DeleteFileResult> => {
    return deleteFileCompletely({
      supabase,
      fileId,
      userId,
    });
  };
}
