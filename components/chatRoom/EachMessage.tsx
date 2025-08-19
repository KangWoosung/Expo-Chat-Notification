import { DEFAULT_AVATAR } from "@/constants/constants";
import { Image, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { Tables } from "@/db/supabase/supabase";

type User = Tables<"users">;
type Message = Tables<"messages">;

type EachMessageProps = {
  sender: string;
  message: Message;
  currentUser: any;
  opponentUser: User | null;
  opponentUsers: User[];
};

export default function EachMessage({
  sender,
  message,
  currentUser,
  opponentUser,
  opponentUsers,
}: EachMessageProps) {
  const [messageSender, setMessageSender] = useState<User | null>(null);
  const isCurrentUser = currentUser.id === sender;

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

  return (
    <View
      className={`flex flex-row w-full mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      {!isCurrentUser && (
        <View className="flex flex-col items-center mr-2">
          <Image
            source={{
              uri: messageSender?.avatar || DEFAULT_AVATAR,
            }}
            className="w-10 h-10 rounded-full mb-1"
          />
          <Text className="text-md text-foreground-tertiary dark:text-foreground-tertiaryDark">
            {messageSender?.name}
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
          ) : (
            <Image
              source={{ uri: message.content }}
              className="w-[150px] h-[150px] rounded-md object-contain"
            />
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

      {isCurrentUser && (
        <View className="flex flex-col items-center ml-2">
          <Image
            source={{
              uri: currentUser?.imageUrl || DEFAULT_AVATAR,
            }}
            className="w-12 h-12 rounded-full mb-1"
          />
          <Text className="text-md text-foreground-tertiary dark:text-foreground-tertiaryDark">
            {currentUser?.username}
          </Text>
        </View>
      )}
    </View>
  );
}
