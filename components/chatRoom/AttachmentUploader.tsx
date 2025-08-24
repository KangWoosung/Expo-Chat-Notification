import React, { useState } from "react";
import { View, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import tailwindColors from "@/utils/tailwindColors";
import { HEADER_ICON_SIZE } from "@/constants/constants";
import {
  FILE_UPLOAD_COUNT_LIMIT,
  FILE_UPLOAD_LIMIT,
} from "@/constants/usageLimits";
import { useUser } from "@clerk/clerk-expo";
import { decodeJwt } from "jose";
import { MessageEnumType, mimeTypeToEnum } from "@/utils/mimeTypeToEnum";
import { useInvalidateUploadedFiles } from "@/hooks/useUploadedFiles";

const BUCKET_NAME = process.env.EXPO_PUBLIC_SUPABASE_BUCKET_NAME!;

interface Props {
  roomId: string | null;
  onUploaded?: (publicUrl: string, type: "image" | "file") => void;
}

export default function AttachmentUploader({ roomId, onUploaded }: Props) {
  const [loading, setLoading] = useState(false);
  const { supabase } = useSupabase();
  const { user } = useUser();
  const invalidateUploadedFiles = useInvalidateUploadedFiles();

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];

  const pickAndSend = async (type: "image" | "file") => {
    try {
      if (!supabase || !user) return;

      setLoading(true);
      let fileUri: string | null = null;
      let fileName = "";
      let fileSize = 0;
      let mimeType = "";
      let messageType: MessageEnumType = "text";

      // File selection
      if (type === "image") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images", "videos"],
          allowsEditing: false,
          quality: 1,
        });
        if (result.canceled) return;
        fileUri = result.assets[0].uri;
        fileName = fileUri?.split("/").pop() || `image-${Date.now()}.jpg`;
        mimeType = result.assets[0].mimeType || "image/jpeg";
        fileSize = result.assets[0].fileSize || 0;
        messageType = mimeTypeToEnum(mimeType);
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: "*/*",
        });
        if (result.canceled) return;
        fileUri = result.assets[0].uri;
        fileName = result.assets[0].name;
        mimeType = result.assets[0].mimeType || "application/octet-stream";
        fileSize = result.assets[0].size || 0;
        messageType = mimeTypeToEnum(mimeType);
      }

      // Check usage limit
      const { data: usage } = await supabase
        .from("user_storage_usage")
        .select("*")
        .single();
      if (
        (usage?.total_file_size || 0) + fileSize > FILE_UPLOAD_LIMIT ||
        (usage?.total_file_count || 0) + 1 > FILE_UPLOAD_COUNT_LIMIT
      ) {
        throw new Error("Exceeded file upload limit");
      }

      if (!fileUri) return;

      // Read file
      // const base64 = await FileSystem.readAsStringAsync(fileUri, {
      //   encoding: FileSystem.EncodingType.Base64,
      // });
      // const ext = fileName.split(".").pop() || "";
      // const path = `${roomId}/${Date.now()}.${ext}`;
      // const {
      //   data: { session },
      // } = await supabase.auth.getSession();

      // // logging jwt
      // if (session) {
      //   const token = session.access_token;
      //   const decoded = decodeJwt(token);

      //   console.log("auth.jwt()->>'sub':", decoded.sub);
      //   console.log("auth.uid():", session.user.id); // 얘는 같은 값
      // }

      // const response = await fetch(fileUri);
      // const blob = await response.blob();
      // const path = `${roomId}/${Date.now()}.${blob.type.split("/")[1]}`;
      // Upload to Supabase Storage
      // const { error: uploadError } = await supabase.storage
      //   .from(BUCKET_NAME)
      //   .upload(path, formData);
      // Upload to Supabase Storage
      // const { error: uploadError } = await supabase.storage
      //   .from(BUCKET_NAME)
      //   .upload(path, blob, {
      //     contentType: mimeType,
      //   });

      const formData = new FormData(); // FormData 는 RN 의 전역객체입니다.
      formData.append("file", {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      } as any);

      // Upload to Supabase Storage
      const ext = fileName.split(".").pop() || "";
      const path = `${roomId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, formData);

      if (uploadError) {
        console.error("supabase.storage upload error:", uploadError);
        // Alert.alert("업로드 실패", "파일 업로드 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.");
        throw new Error(`supabase.storage upload error: ${uploadError}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);
      const publicUrl = publicUrlData.publicUrl;
      console.log("publicUrl:", publicUrl);

      // Save message to database
      const { error: messages_insertError, data: messages_data } =
        await supabase
          .from("messages")
          .insert({
            room_id: roomId,
            sender_id: user.id,
            content: publicUrl,
            message_type: messageType,
          })
          .select(); // Return all columns
      if (messages_insertError) throw messages_insertError;

      // uploaded_files table
      const { error: uploaded_files_insertError, data: uploaded_files_data } =
        await supabase
          .from("uploaded_files")
          .insert({
            user_id: user.id,
            file_name: fileName,
            file_size: fileSize,
            mime_type: mimeType,
            storage_path: path,
            public_url: publicUrl,
          })
          .select(); // Return all columns
      if (uploaded_files_insertError) throw uploaded_files_insertError;

      // message_files table
      // 이미지와 연결된 메시지, 즉 바로 위에서 "messages" 테이블에 insert 한 messate_id
      const { error: message_files_insertError } = await supabase
        .from("message_files")
        .insert({
          message_id: messages_data?.[0]?.message_id,
          file_id: uploaded_files_data?.[0]?.file_id,
        });

      // React Query 캐시 무효화 - 새로운 파일이 업로드되었으므로 파일 목록을 새로고침
      invalidateUploadedFiles();

      if (onUploaded) onUploaded(publicUrl, type);
    } catch (err: any) {
      Alert.alert("Upload failed", err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex flex-row gap-x-xs items-center">
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <TouchableOpacity
            onPress={() => pickAndSend("image")}
            className="p-2 rounded-full bg-background dark:bg-background-dark border border-border dark:border-border-dark"
          >
            <Ionicons
              name="camera-outline"
              size={HEADER_ICON_SIZE}
              color={foregroundTheme}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => pickAndSend("file")}
            className="p-2 rounded-full bg-background dark:bg-background-dark border border-border dark:border-border-dark"
          >
            <Ionicons
              name="document-outline"
              size={HEADER_ICON_SIZE}
              color={foregroundTheme}
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
