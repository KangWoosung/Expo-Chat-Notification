import { DEFAULT_AVATAR } from "@/constants/constants";
import { cn } from "@/lib/utils";
import { Image, View } from "react-native";
import ChatRoomUnreadCountBadge from "./ChatRoomUnreadCountBadge";
import ChatRoomTypeBadge from "./ChatRoomTypeBadge";

export default function Avatar({
  name,
  avatar,
  className,
  unreadMessagesCount = 0,
  type = "direct",
}: {
  name?: string;
  avatar?: string;
  className?: string;
  unreadMessagesCount?: number;
  type?: string;
}) {
  return (
    <View className="flex-col items-center gap-xs relative">
      <Image
        source={{ uri: avatar || DEFAULT_AVATAR }}
        className={cn(`w-10 h-10 rounded-full`, `${className}`)}
      />
      {/* <Text className="text-foreground dark:text-foreground-dark text-lg">
        {name}
      </Text> */}
      <ChatRoomUnreadCountBadge unreadCount={unreadMessagesCount ?? 0} />
      <ChatRoomTypeBadge type={type} />
    </View>
  );
}
