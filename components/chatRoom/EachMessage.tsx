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
            className="w-8 h-8 rounded-full mb-1"
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
          className={`px-4 py-2 rounded-2xl ${
            isCurrentUser
              ? "bg-primary text-white rounded-br-sm"
              : "bg-card dark:bg-card-dark text-foreground dark:text-foreground-dark rounded-bl-sm border border-border dark:border-border-dark"
          }`}
        >
          <Text className="text-lg leading-relaxed">{message.content}</Text>
        </View>
        <Text className="text-xs text-foreground-tertiary dark:text-foreground-tertiaryDark mt-1 px-1">
          {message.sent_at}
        </Text>
      </View>

      {isCurrentUser && (
        <View className="flex flex-col items-center ml-2">
          <Image
            source={{
              uri: currentUser?.imageUrl || DEFAULT_AVATAR,
            }}
            className="w-8 h-8 rounded-full mb-1"
          />
          <Text className="text-md text-foreground-tertiary dark:text-foreground-tertiaryDark">
            {currentUser?.username}
          </Text>
        </View>
      )}
    </View>
  );
}
