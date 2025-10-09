/*
2025-10-04 01:02:46



*/

import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useSupabase } from "@/contexts/SupabaseProvider";
import Ionicons from "@expo/vector-icons/build/Ionicons";

const ChatRoomTypeBadge = ({ type }: { type: string }) => {
  return (
    <View
      className="absolute top-7 -right-2 bg-stone-500 dark:bg-stone-600 
    rounded-full w-6 h-6 flex items-center justify-center"
    >
      {type === "direct" ? (
        <Ionicons name="repeat-outline" size={14} color="white" />
      ) : (
        <Ionicons name="people-outline" size={14} color="white" />
      )}
    </View>
  );
};

export default ChatRoomTypeBadge;
