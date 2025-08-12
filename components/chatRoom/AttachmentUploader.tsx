import React, { useState } from "react";
import { View, Button, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useSupabase } from "@/contexts/SupabaseProvider";

interface Props {
  roomId: string | null;
  onUploaded?: (publicUrl: string, type: "image" | "file") => void;
}

export default function AttachmentUploader({ roomId, onUploaded }: Props) {
  const [loading, setLoading] = useState(false);
  const { supabase } = useSupabase();

  const pickAndSend = async (type: "image" | "file") => {
    try {
      if (!supabase) return;

      setLoading(true);
      let fileUri: string | null = null;
      let fileName = "";
      let mimeType = "";

      // 파일 선택
      if (type === "image") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 1,
        });
        if (result.canceled) return;
        fileUri = result.assets[0].uri;
        fileName = fileUri?.split("/").pop() || `image-${Date.now()}.jpg`;
        mimeType = result.assets[0].mimeType || "image/jpeg";
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: "*/*",
        });
        if (result.canceled) return;
        fileUri = result.assets[0].uri;
        fileName = result.assets[0].name;
        mimeType = result.assets[0].mimeType || "application/octet-stream";
      }

      if (!fileUri) return;

      // 파일 읽기
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const ext = fileName.split(".").pop() || "";
      const path = `${roomId}/${Date.now()}.${ext}`;

      // Supabase Storage 업로드
      const { error: uploadError } = await supabase.storage
        .from("chat-uploads")
        .upload(path, Buffer.from(base64, "base64"), {
          contentType: mimeType,
        });
      if (uploadError) throw uploadError;

      // Public URL
      const { data: publicUrlData } = supabase.storage
        .from("chat-uploads")
        .getPublicUrl(path);
      const publicUrl = publicUrlData.publicUrl;

      // 메시지 DB 저장
      const { error: insertError } = await supabase.from("messages").insert({
        room_id: roomId,
        content: publicUrl,
        type,
      });
      if (insertError) throw insertError;

      if (onUploaded) onUploaded(publicUrl, type);
    } catch (err: any) {
      Alert.alert("전송 실패", err.message || "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Button title="📷 사진" onPress={() => pickAndSend("image")} />
          <Button title="📄 파일" onPress={() => pickAndSend("file")} />
        </>
      )}
    </View>
  );
}
