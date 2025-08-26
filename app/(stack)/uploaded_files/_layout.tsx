import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { useFileView } from "@/contexts/FileViewProvider";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import tailwindColors from "@/utils/tailwindColors";

const FilesLayout = () => {
  const { id: fileId } = useLocalSearchParams();
  const { setFileId, fileUrl, fileName, mimeType } = useFileView();

  useEffect(() => {
    if (fileId) {
      setFileId(fileId as string);
    }
  }, [fileId]);

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
