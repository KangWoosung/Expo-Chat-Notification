import { HEADER_ICON_SIZE } from "@/constants/constants";
import tailwindColors from "@/utils/tailwindColors";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

export default function ChatRoomNotificationTrigger({
  chatRoomId,
}: {
  chatRoomId: string;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showMenu, setShowMenu] = useState(false);

  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];
  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];

  return (
    <TouchableOpacity
      onPress={() => {
        console.log("bell pressed");
      }}
      className="p-2 rounded-full bg-background dark:bg-background-dark"
    >
      <Ionicons
        name="notifications-outline"
        size={HEADER_ICON_SIZE}
        color={foregroundTheme}
      />
    </TouchableOpacity>
  );
}
