import React, { useState } from "react";
import { View, Text, Switch, ScrollView } from "react-native";
import DisabledTrashIcon from "@/components/ui/DisabledTrashIcon";
import { useColorScheme } from "nativewind";
import tailwindColors from "@/utils/tailwindColors";

export default function TrashIconExamples() {
  const [isDisabled, setIsDisabled] = useState(true);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const foregroundTheme =
    tailwindColors.foreground[isDark ? "primaryDark" : "primary"];

  const handleTrashPress = () => {
    console.log("🗑️ Trash button pressed!");
  };

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark p-6">
      <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark mb-6">
        Trash Icon Disabled States
      </Text>

      {/* Toggle Switch */}
      <View className="flex-row items-center justify-between mb-8 p-4 bg-card dark:bg-card-dark rounded-lg">
        <Text className="text-lg text-foreground dark:text-foreground-dark">
          Disabled State
        </Text>
        <Switch
          value={isDisabled}
          onValueChange={setIsDisabled}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isDisabled ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      {/* Examples Grid */}
      <View className="space-y-6">
        {/* Color Variant */}
        <View className="bg-card dark:bg-card-dark p-4 rounded-lg">
          <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark mb-3">
            1. Color Change (기본)
          </Text>
          <View className="flex-row items-center space-x-4">
            <DisabledTrashIcon
              isDisabled={isDisabled}
              onPress={handleTrashPress}
              color={foregroundTheme}
              variant="color"
              style={{
                backgroundColor: isDark ? "#374151" : "#F3F4F6",
                borderRadius: 8,
              }}
            />
            <Text className="text-sm text-foreground-secondary dark:text-foreground-secondaryDark">
              {isDisabled ? "회색으로 변경됨" : "정상 색상"}
            </Text>
          </View>
        </View>

        {/* Opacity Variant */}
        <View className="bg-card dark:bg-card-dark p-4 rounded-lg">
          <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark mb-3">
            2. Opacity (투명도)
          </Text>
          <View className="flex-row items-center space-x-4">
            <DisabledTrashIcon
              isDisabled={isDisabled}
              onPress={handleTrashPress}
              color={foregroundTheme}
              variant="opacity"
              style={{
                backgroundColor: isDark ? "#374151" : "#F3F4F6",
                borderRadius: 8,
              }}
            />
            <Text className="text-sm text-foreground-secondary dark:text-foreground-secondaryDark">
              {isDisabled ? "50% 투명도" : "100% 불투명"}
            </Text>
          </View>
        </View>

        {/* Ban Variant */}
        <View className="bg-card dark:bg-card-dark p-4 rounded-lg">
          <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark mb-3">
            3. Ban Icon (금지 표시)
          </Text>
          <View className="flex-row items-center space-x-4">
            <DisabledTrashIcon
              isDisabled={isDisabled}
              onPress={handleTrashPress}
              color={foregroundTheme}
              variant="ban"
              style={{
                backgroundColor: isDark ? "#374151" : "#F3F4F6",
                borderRadius: 8,
              }}
            />
            <Text className="text-sm text-foreground-secondary dark:text-foreground-secondaryDark">
              {isDisabled ? "Ban 아이콘으로 변경" : "Trash 아이콘"}
            </Text>
          </View>
        </View>

        {/* Lock Variant */}
        <View className="bg-card dark:bg-card-dark p-4 rounded-lg">
          <Text className="text-lg font-semibold text-foreground dark:text-foreground-dark mb-3">
            4. Lock Overlay (잠금 표시)
          </Text>
          <View className="flex-row items-center space-x-4">
            <DisabledTrashIcon
              isDisabled={isDisabled}
              onPress={handleTrashPress}
              color={foregroundTheme}
              variant="lock"
              style={{
                backgroundColor: isDark ? "#374151" : "#F3F4F6",
                borderRadius: 8,
              }}
            />
            <Text className="text-sm text-foreground-secondary dark:text-foreground-secondaryDark">
              {isDisabled ? "잠금 아이콘 오버레이" : "정상 상태"}
            </Text>
          </View>
        </View>

        {/* Current Implementation */}
        <View className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
          <Text className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
            💡 권장 사용법
          </Text>
          <Text className="text-sm text-yellow-700 dark:text-yellow-300">
            • **Color**: 가장 일반적이고 직관적{"\n"}• **Opacity**: 미묘하고
            세련된 느낌{"\n"}• **Ban**: 명확한 금지 의미 전달{"\n"}• **Lock**:
            권한 부족을 명시적으로 표현
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
