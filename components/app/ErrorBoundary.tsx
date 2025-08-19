import { View, Text } from "react-native";
import React from "react";

const ErrorBoundary = ({
  error,
  children,
}: {
  error: Error;
  children: React.ReactNode;
}) => {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-red-500">ErrorBoundary</Text>
      <Text className="text-red-500">{error.message}</Text>
      {children}
    </View>
  );
};

export default ErrorBoundary;
