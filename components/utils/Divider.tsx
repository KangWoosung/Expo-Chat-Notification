import React from "react";
import { Text, View } from "react-native";

type DividerProps = {
  text: string;
};

const Divider = ({ text }: DividerProps) => {
  return (
    <View className="flex-row items-center my-6 px-6">
      <View className="flex-1 h-px bg-gray-200" />
      <Text className="mx-3 text-gray-500 text-sm">{text}</Text>
      <View className="flex-1 h-px bg-gray-200" />
    </View>
  );
};

export default Divider;
