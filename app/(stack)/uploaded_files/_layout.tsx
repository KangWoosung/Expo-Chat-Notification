import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { useFileView } from "@/contexts/FileViewProvider";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import tailwindColors from "@/utils/tailwindColors";

const FilesLayout = () => {
  const { id } = useLocalSearchParams();
  console.log("====FilesLayout id=====", id);

  const { fileId, setFileId, fileUrl, fileName } = useFileView();

  useEffect(() => {
    if (id) {
      setFileId(id as string);
    }
  }, [id]);

  return (
    <Stack>
      <Stack.Screen
        name="id/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default FilesLayout;
