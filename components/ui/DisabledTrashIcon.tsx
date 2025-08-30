import React from "react";
import { View, TouchableOpacity, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DisabledTrashIconProps {
  isDisabled: boolean;
  onPress?: () => void;
  size?: number;
  color?: string;
  disabledColor?: string;
  style?: ViewStyle;
  variant?: "opacity" | "color" | "ban" | "lock";
}

export default function DisabledTrashIcon({
  isDisabled,
  onPress,
  size = 24,
  color = "#000",
  disabledColor = "#9CA3AF",
  style,
  variant = "color",
}: DisabledTrashIconProps) {
  const renderIcon = () => {
    switch (variant) {
      case "opacity":
        return (
          <View style={{ opacity: isDisabled ? 0.5 : 1 }}>
            <Ionicons name="trash-outline" size={size} color={color} />
          </View>
        );

      case "ban":
        return (
          <Ionicons
            name={isDisabled ? "ban-outline" : "trash-outline"}
            size={size}
            color={isDisabled ? "#EF4444" : color}
          />
        );

      case "lock":
        return (
          <View style={{ position: "relative" }}>
            <Ionicons
              name="trash-outline"
              size={size}
              color={isDisabled ? disabledColor : color}
            />
            {isDisabled && (
              <Ionicons
                name="lock-closed"
                size={size * 0.5}
                color="#EF4444"
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  backgroundColor: "white",
                  borderRadius: size * 0.25,
                }}
              />
            )}
          </View>
        );

      case "color":
      default:
        return (
          <Ionicons
            name="trash-outline"
            size={size}
            color={isDisabled ? disabledColor : color}
          />
        );
    }
  };

  return (
    <TouchableOpacity
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={[
        {
          padding: 8,
          borderRadius: size / 2,
          backgroundColor: isDisabled ? "transparent" : "transparent",
        },
        style,
      ]}
    >
      {renderIcon()}
    </TouchableOpacity>
  );
}
