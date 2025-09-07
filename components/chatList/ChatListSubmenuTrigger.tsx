import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import React, { useState } from "react";
import { HEADER_ICON_SIZE } from "@/constants/constants";
import { Ionicons } from "@expo/vector-icons";
import tailwindColors from "@/utils/tailwindColors";
import { useColorScheme } from "nativewind";
import { router } from "expo-router";
import { globalSheetRef } from "@/app/_layout";
import { useBottomSheetStore } from "@/zustand/useBottomSheetStore";
import CreateGroupChatRoom from "@/app/(stack)/bottomsheet/CreateGroupChatRoom";

const ChatListSubmenuTrigger = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { setBottomSheetContent } = useBottomSheetStore();

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleCreateGroupChatRoom = () => {
    console.log("Create group chat room pressed");
    setShowMenu(false);
    setBottomSheetContent(<CreateGroupChatRoom />);
    globalSheetRef.current?.present();
  };

  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];
  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];
  return (
    <View>
      <TouchableOpacity
        onPress={() => setShowMenu((prev) => !prev)}
        className="p-2 rounded-full bg-background dark:bg-background-dark"
      >
        <Ionicons
          name="add-outline"
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
              onPress={handleCreateGroupChatRoom}
              className="flex flex-row items-center gap-x-sm p-2 rounded-lg"
            >
              <Ionicons
                name="people-outline"
                size={HEADER_ICON_SIZE}
                color={foregroundTheme}
              />
              <Text className="text-foreground dark:text-foreground-dark font-semibold text-lg">
                Create group chat
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ChatListSubmenuTrigger;
