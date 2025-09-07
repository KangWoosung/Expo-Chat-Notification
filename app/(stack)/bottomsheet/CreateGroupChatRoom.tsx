import {
  View,
  Text,
  Pressable,
  FlatList,
  TouchableOpacity,
  Platform,
  TextInput,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useColorScheme } from "nativewind";
import tailwindColors from "@/utils/tailwindColors";
import { useFetchAllUsers } from "@/hooks/useFetchAllUsers";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { DEFAULT_AVATAR } from "@/constants/constants";
import { Image } from "expo-image";
import Checkbox from "@react-native-community/checkbox";
import CommunityCheckbox from "@/components/ui/CommunityCheckbox";

const CreateGroupChatRoom = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user: currentUser } = useUser();
  const { supabase } = useSupabase();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupChatRoomName, setGroupChatRoomName] = useState<string>("");

  const { data: users } = useFetchAllUsers({
    currentUserId: currentUser?.id || "",
    supabase: supabase,
    pageStart: 0,
    pageEnd: 10,
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(
      (prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId) // 제거
          : [...prev, userId] // 추가
    );
  };

  useEffect(() => {
    console.log("CreateGroupChatRoom useEffect");
  }, []);

  return (
    <View className="flex-1 bg-background dark:bg-background-dark p-md">
      <View className="flex-col items-start gap-sm p-sm pt-md">
        <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
          Create new group chat
        </Text>
        <TextInput
          placeholder="Group chat room name"
          value={groupChatRoomName}
          onChangeText={setGroupChatRoomName}
          className="w-full p-md rounded-md bg-background-tertiary dark:bg-background-tertiaryDark"
        />
      </View>
      <View className="flex-col items-start gap-sm p-sm pt-md">
        <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark">
          Invite users
        </Text>
      </View>
      {/* 유저 선택 목록 */}
      <FlatList
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
          onPress={() => {}}
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
