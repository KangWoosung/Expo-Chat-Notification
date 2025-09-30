import { View, Text, StyleProp, ViewStyle } from "react-native";
import React from "react";
import { DEFAULT_AVATAR } from "@/constants/constants";
import { Image } from "expo-image";
import BadgeWithIcon from "../ui/BadgeWithIcon";
import { hexToRgba } from "@/utils/hexToRgba";
import useIsOnline from "@/hooks/useIsOnline";
import { cn } from "@/lib/utils";

type InitScreenUserCardProps = {
  currentUser: any;
  isDark: boolean;
  expoPushToken: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

const InitScreenUserCard = ({
  currentUser,
  isDark,
  expoPushToken,
  className,
  style,
}: InitScreenUserCardProps) => {
  const isOnline = useIsOnline();
  // const isOnline = false;

  console.log("currentUser", currentUser?.username);
  console.log("isOnline", isOnline);

  if (isOnline === null) {
    return <Text>Loading...</Text>;
  }

  return (
    <View
      className={cn(`flex flex-row items-center justify-start gap-lg w-full
      p-lg pt-2xl
    ${className}`)}
      style={style}
    >
      <View className="flex items-center justify-center">
        <Image
          source={currentUser?.imageUrl || DEFAULT_AVATAR}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
          }}
        />
      </View>
      <View className="flex flex-col items-start justify-center gap-sm">
        <Text className="text-foreground dark:text-foreground-dark text-xl font-bold">
          {currentUser?.username || "No Name"}
        </Text>
        <View className="flex items-center justify-center gap-sm">
          <BadgeWithIcon
            iconName={isOnline ? "checkmark" : "x-mark"}
            className={
              isOnline
                ? `bg-accent-600/20 border-accent-800 
             dark:bg-accent-200/20 dark:border-accent-300 `
                : `bg-red-500`
            }
            textClassName=" text-accent-800 dark:text-accent-200"
            style={{ backgroundColor: hexToRgba("#c88a04", 0.5) }}
            iconColor={isDark ? "gold" : "crimson"}
            iconSize={16}
            iconPosition="left"
            dot={false}
            dotSize={10}
            maxCount={99}
            pressable={false}
            onPress={() => {}}
            accessibilityLabel="online"
            label={isOnline ? "online" : "offline"}
          />
        </View>
        <View className="flex flex-row items-center justify-center gap-sm">
          <Text className="text-foreground dark:text-foreground-dark text-md">
            Push Token:
          </Text>
          <Text className="text-foreground dark:text-foreground-dark text-sm">
            {expoPushToken}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default InitScreenUserCard;
