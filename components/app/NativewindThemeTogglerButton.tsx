import { THEME_TOGGLER_BUTTON_SIZE } from "@/constants/constants";
import { useThemeProvider } from "@/contexts/NativewindThemeProvider";
import tailwindColors from "@/utils/tailwindColors";
import { Feather } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React from "react";
import { TouchableOpacity } from "react-native";

const NativewindThemeTogglerButton = () => {
  const { colorScheme } = useColorScheme();
  const { nativewindColorScheme, nativeWindSetTheme } = useThemeProvider();

  const isDark = colorScheme === "dark";
  const foregroundTheme =
    tailwindColors.foreground[isDark ? "dark" : "DEFAULT"];
  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];

  const toggleAction = () => {
    nativeWindSetTheme(nativewindColorScheme === "dark" ? "light" : "dark");
  };

  return (
    <TouchableOpacity onPress={toggleAction}>
      <Feather
        name={colorScheme === "dark" ? "moon" : "sun"}
        color={foregroundTheme}
        size={THEME_TOGGLER_BUTTON_SIZE}
      />
    </TouchableOpacity>
  );
};

export default NativewindThemeTogglerButton;
