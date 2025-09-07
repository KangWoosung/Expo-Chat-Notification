import { View, Text, Switch } from "react-native";
import React from "react";
import { useIsFocused } from "@react-navigation/native";
import { useAnimationStore } from "@/zustand/useAnimationStore";
import { Ionicons } from "@expo/vector-icons";
import tailwindColors from "@/utils/tailwindColors";
import { useColorScheme } from "nativewind";
import { useThemeProvider } from "@/contexts/NativewindThemeProvider";
import { useOnBoardingStore } from "@/zustand/useOnBoardingStore";
import { useLocaleStore } from "@/zustand/useLocaleStore";
import { usePushNotificationStore } from "@/zustand/usePushNotificationStore";
import SmoothSwitch from "@/components/ui/SmoothSwitch";

const AppOptionsIndex = () => {
  const isFocused = useIsFocused();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const animationsEnabled = useAnimationStore((s) => s.animationsEnabled);
  const foregroundTheme =
    tailwindColors.foreground[isDark ? "dark" : "DEFAULT"];
  const setAnimationsEnabled = useAnimationStore((s) => s.setAnimationsEnabled);
  const { nativeWindSetTheme } = useThemeProvider();
  const showOnBoarding = useOnBoardingStore((s) => s.showOnBoarding);
  const setShowOnBoarding = useOnBoardingStore((s) => s.setShowOnBoarding);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const pushNotificationEnabled = usePushNotificationStore(
    (s) => s.pushNotificationEnabled
  );
  const setPushNotificationEnabled = usePushNotificationStore(
    (s) => s.setPushNotificationEnabled
  );
  return (
    <View
      className="flex-1 justify-start items-start pt-lg
     bg-background dark:bg-background-dark
    "
    >
      <View className="flex flex-col justify-start items-start w-full p-md pt-lg px-lg">
        <View className="flex flex-row justify-start items-start w-full gap-sm">
          <Ionicons
            name="accessibility-outline"
            size={20}
            color={foregroundTheme}
          />
          <Text className="text-heading-2 font-pbold text-foreground dark:text-foreground-dark">
            Accessiblity
          </Text>
        </View>
        <View className="flex flex-row justify-between items-start w-full p-md px-lg">
          <Text className="text-heading-3 font-pbold text-foreground dark:text-foreground-dark">
            Animations
          </Text>
          <Switch
            value={animationsEnabled}
            onValueChange={(value) => setAnimationsEnabled(value)}
          />
        </View>
        <View className="flex flex-row justify-between items-start w-full p-md px-lg">
          <Text className="text-heading-3 font-pbold text-foreground dark:text-foreground-dark">
            Dark Mode
          </Text>
          <Switch
            value={isDark}
            onValueChange={() => {
              nativeWindSetTheme(isDark ? "light" : "dark");
            }}
          />
        </View>
      </View>

      <View className="flex flex-col justify-start items-start w-full p-md pt-lg px-lg">
        <View className="flex flex-row justify-start items-start w-full gap-sm">
          <Ionicons
            name="notifications-outline"
            size={20}
            color={foregroundTheme}
          />
          <Text className="text-heading-2 font-pbold text-foreground dark:text-foreground-dark">
            Push Notification
          </Text>
        </View>
        <View className="flex flex-row justify-between items-start w-full p-md px-lg">
          <Text className="text-heading-3 font-pbold text-foreground dark:text-foreground-dark">
            Push Notification Enabled
          </Text>
          <SmoothSwitch
            value={pushNotificationEnabled}
            onValueChange={setPushNotificationEnabled}
          />
        </View>
      </View>

      <View className="flex flex-col justify-start items-start w-full p-md pt-lg px-lg">
        <View className="flex flex-row justify-start items-start w-full gap-sm">
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={foregroundTheme}
          />
          <Text className="text-heading-2 font-pbold text-foreground dark:text-foreground-dark">
            OnBoarding
          </Text>
        </View>
        <View className="flex flex-row justify-between items-start w-full p-md px-lg">
          <Text className="text-heading-3 font-pbold text-foreground dark:text-foreground-dark">
            Show OnBoarding
          </Text>
          <Switch value={showOnBoarding} onValueChange={setShowOnBoarding} />
        </View>
      </View>

      <View className="flex flex-col justify-start items-start w-full p-md pt-lg px-lg">
        <View className="flex flex-row justify-start items-start w-full gap-sm">
          <Ionicons name="language-outline" size={20} color={foregroundTheme} />
          <Text className="text-heading-2 font-pbold text-foreground dark:text-foreground-dark">
            Locale, Language
          </Text>
        </View>
        <View className="flex flex-row justify-between items-start w-full p-md px-lg">
          <Text className="text-heading-3 font-pbold text-foreground dark:text-foreground-dark">
            Locale, Language
          </Text>
          {/* <Picker
            selectedValue={locale}
            onValueChange={setLocale}
          >
            <Picker.Item label="English" value="en-US" />
            <Picker.Item label="Korean" value="ko-KR" />
          </Picker> */}
        </View>
      </View>
    </View>
  );
};

export default AppOptionsIndex;
