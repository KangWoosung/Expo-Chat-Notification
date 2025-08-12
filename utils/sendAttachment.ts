import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { supabase } from "../lib/supabase";

type AttachmentType = "image" | "file";

interface SendAttachmentOptions {
  roomId: string;
  type: AttachmentType; // 'image' or 'file'
}

export async function sendAttachment({ roomId, type }: SendAttachmentOptions) {
  try {
    let fileUri: string | null = null;
    let fileName = "";
    let mimeType = "";

    // 1. 파일 선택
    if (type === "image") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (result.canceled) return;
      fileUri = result.assets[0].uri;
      fileName = fileUri.split("/").pop() || `image-${Date.now()}.jpg`;
      mimeType = result.assets[0].mimeType || "image/jpeg";
    } else {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // 모든 파일
      });
      if (result.canceled) return;
      fileUri = result.assets[0].uri;
      fileName = result.assets[0].name;
      mimeType = result.assets[0].mimeType || "application/octet-stream";
    }

    if (!fileUri) return;

    // 2. 파일 읽기
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const ext = fileName.split(".").pop() || "";
    const path = `${roomId}/${Date.now()}.${ext}`;

    // 3. 업로드
    const { error: uploadError } = await supabase.storage
      .from("chat-uploads")
      .upload(path, Buffer.from(base64, "base64"), {
        contentType: mimeType,
      });

    if (uploadError) throw uploadError;

    // 4. Public URL 가져오기
    const { data: publicUrlData } = supabase.storage
      .from("chat-uploads")
      .getPublicUrl(path);

    const publicUrl = publicUrlData.publicUrl;

    // 5. 메시지 DB 저장
    const { error: insertError } = await supabase.from("messages").insert({
      room_id: roomId,
      content: publicUrl,
      type,
    });

    if (insertError) throw insertError;

    console.log("✅ Attachment sent:", publicUrl);
  } catch (err) {
    console.error("❌ sendAttachment error:", err);
  }
}
