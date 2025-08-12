/*
2025-04-06 00:01:07

*/

// /contexts/NativewindThemeContext.tsx
import { THEME_STORAGE_KEY } from "@/constants/constants";
import { useColorScheme as useNativewindColorScheme } from "nativewind";
import React, { createContext, useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { MMKV } from "react-native-mmkv";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NativewindThemeModeEnums = "light" | "dark";

type NativewindThemeContextType = {
  nativewindColorScheme: NativewindThemeModeEnums;
  nativeWindSetTheme: (theme: NativewindThemeModeEnums) => void;
};

type NativewindThemeProviderProps = {
  children: React.ReactNode;
};

// Context
const NativewindThemeContext = createContext<NativewindThemeContextType>({
  nativewindColorScheme: "light",
  nativeWindSetTheme: () => {},
});

// Provider
export const NativewindThemeProvider = ({
  children,
}: NativewindThemeProviderProps) => {
  // colorScheme from nativewind
  const {
    colorScheme: nativewindColorScheme,
    setColorScheme: setNativewindColorScheme,
  } = useNativewindColorScheme();

  const [themeMode, setThemeMode] = useState<NativewindThemeModeEnums>("light");

  // MMKV 대신 AsyncStorage를 사용하도록 코드 변경

  // themeMode를 AsyncStorage에서 불러오는 함수
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const storagedThemeMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storagedThemeMode) {
          setThemeMode(storagedThemeMode as NativewindThemeModeEnums);
          setNativewindColorScheme(storagedThemeMode as "light" | "dark");
        }
      } catch (e) {
        console.warn("테마 모드 불러오기 실패:", e);
      }
    };
    loadThemeMode();
  }, []);

  // themeMode를 AsyncStorage에 저장하는 함수
  const nativeWindSetTheme = (newThemeMode: NativewindThemeModeEnums) => {
    setThemeMode(newThemeMode);
    setNativewindColorScheme(newThemeMode as "light" | "dark");
    AsyncStorage.setItem(
      THEME_STORAGE_KEY,
      newThemeMode as "light" | "dark"
    ).catch((e) => {
      console.warn("테마 모드 저장 실패:", e);
    });
  };

  // themeMode가 변경될 때마다 실행됩니다
  useEffect(() => {
    console.log("themeMode updated:", themeMode);
  }, [themeMode]);

  return (
    <NativewindThemeContext.Provider
      value={{
        nativewindColorScheme: themeMode, // 사용자가 선택한 테마 모드 전달
        nativeWindSetTheme,
      }}
    >
      <View
        className={`flex-1 ${nativewindColorScheme === "dark" ? "dark" : ""}`}
      >
        {children}
      </View>
    </NativewindThemeContext.Provider>
  );
};

// Hook
export const useThemeProvider = () => useContext(NativewindThemeContext);
