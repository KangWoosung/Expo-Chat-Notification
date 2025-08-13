import tailwindColors from "@/utils/tailwindColors";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HEADER_ICON_SIZE } from "@/constants/constants";

export default function ChatRoomSubmenuTrigger({
  chatRoomId,
}: {
  chatRoomId: string;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];
  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];

  const handleInviteUser = () => {
    console.log("Invite user pressed for chat room:", chatRoomId);
    setShowMenu(false);
    // 여기에 사용자 초대 로직을 추가할 수 있습니다
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setShowMenu((prev) => !prev)}
        className="p-2 rounded-full bg-background dark:bg-background-dark"
      >
        <Ionicons
          name="ellipsis-vertical"
          size={HEADER_ICON_SIZE}
          color={foregroundTheme}
        />
      </TouchableOpacity>

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseMenu}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          // className="flex-1 bg-background-tertiary dark:bg-background-tertiaryDark"
          onPress={handleCloseMenu}
        >
          <View
            className="absolute top-16 right-4 bg-background dark:bg-background-dark 
          border border-border dark:border-border-dark rounded-lg p-2 shadow-lg 
          elevation-5 min-w-48"
            style={{
              backgroundColor: backgroundTheme,
            }}
          >
            <TouchableOpacity
              onPress={handleInviteUser}
              className="flex flex-row items-center gap-x-sm p-2 rounded-lg"
            >
              <Ionicons
                name="person-add-outline"
                size={HEADER_ICON_SIZE}
                color={foregroundTheme}
              />
              <Text className="text-foreground dark:text-foreground-dark font-semibold text-lg">
                Invite user
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleInviteUser}
              className="flex flex-row items-center gap-x-sm p-2 rounded-lg"
            >
              <Ionicons
                name="ban-outline"
                size={HEADER_ICON_SIZE}
                color={foregroundTheme}
              />
              <Text className="text-foreground dark:text-foreground-dark font-semibold text-lg">
                Ban user
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleInviteUser}
              className="flex flex-row items-center gap-x-sm p-2 rounded-lg"
            >
              <Ionicons
                name="document-text-outline"
                size={HEADER_ICON_SIZE}
                color={foregroundTheme}
              />
              <Text className="text-foreground dark:text-foreground-dark font-semibold text-lg">
                Rename chat room
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleInviteUser}
              className="flex flex-row items-center gap-x-sm p-2 rounded-lg"
            >
              <Ionicons
                name="trash-outline"
                size={HEADER_ICON_SIZE}
                color={foregroundTheme}
              />
              <Text className="text-foreground dark:text-foreground-dark font-semibold text-lg">
                Delete chat room
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
