import { CHAT_ROOM_AVATAR_SIZE, DEFAULT_AVATAR } from "@/constants/constants";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Tables } from "@/db/supabase/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ImprovedMessage,
  getFileId,
} from "@/hooks/useImprovedChatRoomMessages";
import { useSupabase } from "@/contexts/SupabaseProvider";
import {
  findFileIdFromMessage,
  updateMessageFileId,
} from "@/utils/findFileIdFromUrl";
import Animated from "react-native-reanimated";

type User = Tables<"users">;

type EachMessageProps = {
  sender: string;
  message: ImprovedMessage; // 🚀 개선된 메시지 타입 (file_id 직접 포함)
  currentUser: any;
  opponentUser: User | null;
  opponentUsers: User[];
};

// expo-image용 Animated Image 생성
const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function EachMessage({
  sender,
  message,
  currentUser,
  opponentUser,
  opponentUsers,
}: EachMessageProps) {
  const [messageSender, setMessageSender] = useState<User | null>(null);
  const isCurrentUser = currentUser.id === sender;
  const { supabase } = useSupabase();

  // 🚀 파일 클릭 핸들러 (훨씬 간단해짐!)
  const handleFilePress = () => {
    console.log("🔍 File press - Message details:", {
      messageId: message.message_id,
      messageType: message.message_type,
      fileId: message.file_id,
      hasContent: !!message.content,
      contentPreview: message.content?.substring(0, 50),
      uploadedFiles: message.uploaded_files,
    });

    const fileId = getFileId(message); // message.file_id 직접 접근
    if (fileId) {
      console.log("✅ File ID found, navigating to viewer:", fileId);
      router.push({
        pathname: "/(stack)/uploaded_files/id/[id]",
        params: { id: fileId },
      });
    } else {
      console.warn("⚠️ No file ID found for message:", message.message_id);
      console.warn(
        "🔍 Trying fallback: check if this is an old message without file_id"
      );

      // 🔧 임시 해결책: 기존 메시지들을 위한 fallback
      if (
        (message.message_type === "image" || message.message_type === "file") &&
        supabase
      ) {
        console.log(
          "🚨 This appears to be a file message without file_id (legacy)"
        );
        console.log("🔄 Attempting to find file_id from legacy data...");

        findFileIdFromMessage(supabase, message.message_id, message.content)
          .then((foundFileId) => {
            if (foundFileId) {
              console.log("✅ Found legacy file_id:", foundFileId);
              // 선택적으로 messages 테이블에 file_id 업데이트
              updateMessageFileId(supabase, message.message_id, foundFileId);
              // 파일 뷰어로 이동
              router.push({
                pathname: "/(stack)/uploaded_files/id/[id]",
                params: { id: foundFileId },
              });
            } else {
              console.error("❌ Could not find file_id for legacy message");
            }
          })
          .catch((error) => {
            console.error("❌ Error in fallback file_id search:", error);
          });
      }
    }
  };

  useEffect(() => {
    let senderUser = null;
    // 1:1 chat room
    if (opponentUser) {
      senderUser = opponentUser;
    } else if (opponentUsers.length >= 1) {
      senderUser = opponentUsers.find((user) => user.user_id === sender);
    }
    if (senderUser) {
      setMessageSender(senderUser);
    }
  }, [sender, opponentUser, opponentUsers]);

  if (!message) return null;
  if (!message.sent_at) return null;

  // @ts-ignore
  // onPress={() =>
  //   router.push({
  //     pathname: "/(stack)/uploaded_files/id/[id]",
  //     params: { id: item.file_id },
  //   })
  // }

  return (
    <View
      className={`flex flex-row w-full mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      {!isCurrentUser && (
        <View className="flex flex-col items-center justify-end mr-2">
          <View className="flex flex-col items-center mr-2">
            <Image
              source={{
                uri: messageSender?.avatar || DEFAULT_AVATAR,
              }}
              style={{
                width: CHAT_ROOM_AVATAR_SIZE,
                height: CHAT_ROOM_AVATAR_SIZE,
                borderRadius: CHAT_ROOM_AVATAR_SIZE / 2,
              }}
            />
          </View>
          <Text className="text-md text-foreground-tertiary dark:text-foreground-tertiaryDark">
            {messageSender?.name?.slice(0, 10)}
            {messageSender?.name?.length &&
              messageSender?.name?.length > 10 &&
              "..."}
          </Text>
        </View>
      )}

      <View
        className={`flex flex-col max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"}`}
      >
        <View
          className={`px-md py-sm rounded-2xl ${
            isCurrentUser
              ? "bg-primary text-white rounded-br-sm bg-opacity-50"
              : "bg-card dark:bg-card-dark text-foreground dark:text-foreground-dark rounded-bl-sm border border-border dark:border-border-dark"
          }`}
        >
          {message.message_type === "text" ? (
            <Text className="text-lg leading-relaxed">{message.content}</Text>
          ) : message.message_type === "image" ? (
            <Pressable onPress={handleFilePress}>
              <AnimatedImage
                source={{ uri: message.content }}
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 8,
                  backgroundColor: "transparent",
                }}
                contentFit="cover"
                cachePolicy="memory-disk"
                priority="normal"
                placeholder={{
                  blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
                }}
                transition={150}
                sharedTransitionTag={`image-${message.message_id}`}
              />
            </Pressable>
          ) : (
            <Pressable onPress={handleFilePress}>
              <View className="flex-row items-center gap-x-sm p-sm">
                <Ionicons
                  name="document-text-outline"
                  size={36}
                  color="white"
                />
                <Text className="text-white text-sm">파일 보기</Text>
              </View>
            </Pressable>
          )}
        </View>

        <Text className="text-xs text-foreground-tertiary dark:text-foreground-tertiaryDark mt-1 px-1">
          {new Date(message.sent_at).toLocaleString(undefined, {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      {/* {isCurrentUser && (
        <View className="flex flex-col items-center justify-end ml-2">
          <Image
            source={{
              uri: currentUser?.imageUrl || DEFAULT_AVATAR,
            }}
            style={{
              width: CHAT_ROOM_AVATAR_SIZE,
              height: CHAT_ROOM_AVATAR_SIZE,
              borderRadius: CHAT_ROOM_AVATAR_SIZE / 2,
            }}
          />
          <Text className="text-md text-foreground-tertiary dark:text-foreground-tertiaryDark">
            {currentUser?.username?.slice(0, 6)}
            {currentUser?.username?.length &&
              currentUser?.username?.length > 6 &&
              "..."}
          </Text>
        </View>
      )} */}
    </View>
  );
}
