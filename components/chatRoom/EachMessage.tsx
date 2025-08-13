import { DEFAULT_AVATAR } from "@/constants/constants";
import { Image, Text, View } from "react-native";

type EachMessageProps = {
  sender: string;
  message: any;
  currentUser: any;
  opponentUser: any;
};

export default function EachMessage({
  sender,
  message,
  currentUser,
  opponentUser,
}: EachMessageProps) {
  const isCurrentUser = currentUser.id === sender;

  return (
    <View
      className={`flex flex-row w-full mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      {!isCurrentUser && (
        <View className="flex flex-col items-center mr-2">
          <Image
            source={{
              uri: opponentUser?.avatar || DEFAULT_AVATAR,
            }}
            className="w-10 h-10 rounded-full mb-1"
          />
          <Text className="text-md text-foreground-tertiary dark:text-foreground-tertiaryDark">
            {opponentUser?.name}
          </Text>
        </View>
      )}

      <View
        className={`flex flex-col max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"}`}
      >
        <View
          className={`px-md py-sm rounded-2xl ${
            isCurrentUser
              ? "bg-primary text-white rounded-br-sm"
              : "bg-card dark:bg-card-dark text-foreground dark:text-foreground-dark rounded-bl-sm border border-border dark:border-border-dark"
          }`}
        >
          <Text className="text-lg leading-relaxed">{message.content}</Text>
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
