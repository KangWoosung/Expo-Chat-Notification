import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { useFetchAllUsers } from "@/hooks/useFetchAllUsers";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { DEFAULT_AVATAR } from "@/constants/constants";
import { Image } from "expo-image";
import CommunityCheckbox from "@/components/ui/CommunityCheckbox";
import { Ionicons } from "@expo/vector-icons";
import tailwindColors from "@/utils/tailwindColors";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

const CreateGroupChatRoom = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user: currentUser } = useUser();
  const { supabase } = useSupabase();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupChatRoomName, setGroupChatRoomName] = useState<string>("");

  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];
  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];

  const { data: users } = useFetchAllUsers({
    currentUserId: currentUser?.id || "",
    supabase: supabase,
    pageStart: 0,
    pageEnd: 20,
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(
      (prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId) // 제거
          : [...prev, userId] // 추가
    );
  };

  const handleCreateGroupChatSubmit = () => {
    if (groupChatRoomName.trim() === "" || selectedUsers.length === 0) {
      setGroupChatRoomName("Default Group Chat");
    }
    console.log("Create group chat submit");
    console.log("groupChatRoomName", groupChatRoomName);
    console.log("selectedUsers", selectedUsers);
  };

  useEffect(() => {
    console.log("CreateGroupChatRoom useEffect");
    console.log("selectedUsers", selectedUsers);
    console.log("groupChatRoomName", groupChatRoomName);
  }, []);

  return (
    <View className="flex-1 bg-background dark:bg-background-dark p-md">
      <View className="flex-col items-start gap-sm p-sm pt-md">
        <View className="flex-row items-center gap-sm">
          <Ionicons
            name="chatbubbles-outline"
            size={24}
            color={foregroundTheme}
          />
          <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
            Create new group chat
          </Text>
        </View>
        <TextInput
          placeholder="Group chat name"
          value={groupChatRoomName}
          onChangeText={setGroupChatRoomName}
          className="w-full p-md rounded-md bg-background-tertiary dark:bg-background-tertiaryDark"
        />
      </View>
      <View className="flex-row items-start gap-sm p-sm pt-md">
        <Ionicons name="people-outline" size={24} color={foregroundTheme} />
        <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
          Invite users
        </Text>
      </View>
      {/* 유저 선택 목록 */}
      <BottomSheetFlatList
        className="w-full flex-1"
        data={users}
        renderItem={({ item }) => (
          <View
            className={`flex-row items-center gap-x-sm p-2 rounded-lg
            p-sm pb-md bg-background dark:bg-background-dark`}
            key={item.user_id}
          >
            <Image
              source={{ uri: item.avatar || DEFAULT_AVATAR }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
              }}
            />
            <View className="flex-1 flex-col items-start gap-2xs ">
              <Text className="text-foreground dark:text-foreground-dark">
                {item.name}
              </Text>
              <Text className="text-foreground dark:text-foreground-dark">
                {item.email}
              </Text>
              <Text className="text-foreground dark:text-foreground-dark">
                {item.push_token}
              </Text>
            </View>
            <CommunityCheckbox
              selectedDataArray={selectedUsers}
              currentDataKey={item.user_id}
              handleSelectData={handleSelectUser}
              isDark={isDark}
            />
          </View>
        )}
        keyExtractor={(item) => item.user_id?.toString() || ""}
      />
      <View className="flex flex-row items-center justify-center gap-x-sm p-md py-lg">
        <TouchableOpacity
          onPress={handleCreateGroupChatSubmit}
          className="p-2 rounded-lg bg-primary dark:bg-primary-dark"
        >
          <Text className="text-foreground dark:text-foreground-dark">
            Create group chat
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateGroupChatRoom;
