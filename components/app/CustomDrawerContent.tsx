import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import React, { useState } from "react";
import { Image, Platform, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router, usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { Image } from "expo-image";
import { useThemeProvider } from "@/contexts/NativewindThemeProvider";
import tailwindColors from "@/utils/tailwindColors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useColorScheme } from "nativewind";
import NativewindThemeTogglerButton from "./NativewindThemeTogglerButton";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/contexts/SupabaseProvider";
// import ThemeSwitchAnimationButton from "./ThemeSwitchAnimationButton";
const getRandomAvatarUri = () => {
  const randomNum = Math.floor(Math.random() * (99 - 10 + 1)) + 10;
  return `https://randomuser.me/api/portraits/men/${randomNum}.jpg`;
};

const DEFAULT_AVATAR_URI = getRandomAvatarUri();

// !! Important: This is a custom drawer item.
// Declare all drawer items here.
const customDrawerItem = [
  {
    label: "Home",
    iconName: "home-outline",
    route: "/",
  },
  {
    label: "Chats",
    iconName: "chatbox-outline",
    route: "/chats",
  },
  {
    label: "Files",
    iconName: "document-outline",
    route: "/files",
  },
];

// const AVATAR_URI = "https://randomuser.me/api/portraits/men/75.jpg";
// CustomDrawerContent
const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { supabase, resetSupabaseClient } = useSupabase();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { top, bottom } = useSafeAreaInsets();
  const pathname = usePathname();
  const { nativewindColorScheme, nativeWindSetTheme } = useThemeProvider();
  const [avatarUri, setAvatarUri] = useState(
    user?.imageUrl || DEFAULT_AVATAR_URI
  );

  // console.log(user);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundTheme =
    tailwindColors.background[isDark ? "dark" : "DEFAULT"];
  const foregroundTheme =
    tailwindColors.foreground[isDark ? "dark" : "DEFAULT"];
  const backgroundSecondaryTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];
  const foregroundSecondaryTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];

  // Hide routes that include 'drawer' in the name
  // const routes = props.state.routes.filter(
  //   (route) => !route.name.includes("drawer ") && !route.name.includes("tabs")
  // );
  // const filteredState = { ...props.state, routes };

  // Handle Sign Out
  const handleSignOut = async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      // 1️⃣ Tanstack Query 캐시 클리어 (먼저 실행)
      queryClient.clear();

      // 2️⃣ Clerk Sign Out (이것만으로 충분)
      await signOut();

      // 3️⃣ Supabase 클라이언트 리셋
      resetSupabaseClient();

      // Clerk signOut 후 session이 null이 되면
      // SupabaseProvider의 useEffect가 자동으로
      // supabase 클라이언트를 null로 설정함
    } catch (err) {
      console.error("Error during sign out:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 flex-col  ">
      <DrawerContentScrollView
        {...props}
        scrollEnabled={false}
        contentContainerStyle={{
          flex: 1,
          paddingTop: top + 30,
          backgroundColor: backgroundTheme,
          paddingBottom: 0,
          gap: 10,
        }}
      >
        {/* Drawer Header */}
        {/* Theme Toggler */}
        <View className="flex-row w-full items-center justify-between gap-4 pt-5">
          <View className="flex-row items-center justify-end gap-4">
            <Text></Text>
          </View>
          {/* <CircleMaskTriggerButton /> */}
          <NativewindThemeTogglerButton />
        </View>
        <View
          className="flex-col items-center justify-start gap-4 pt-5"
          style={{ backgroundColor: backgroundTheme }}
        >
          <View className="shadow-lg shadow-gray-500 rounded-full">
            <Image
              source={{ uri: avatarUri }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 9999,
              }}
            />
          </View>
          <Text className="text-2xl font-bold text-foreground dark:text-foreground-dark">
            {user?.username}
          </Text>
          <Text className="text-sm text-foreground-secondary dark:text-foreground-secondary-dark">
            {user?.emailAddresses?.[0]?.emailAddress}
          </Text>
        </View>

        {/* Drawer Item List */}
        <View className="">
          {/* Hiding all DrawerItemList because of folder structure */}
          {/* <DrawerItemList {...props} state={filteredState} /> */}
        </View>

        {/* CustomDrawerItem */}
        {customDrawerItem.map((item) => (
          <CustomDrawerItem
            key={item.route}
            {...item}
            focused={pathname === item.route}
          />
        ))}
      </DrawerContentScrollView>
      {/* End of CustomDrawerItem */}

      {/* Style for Drawer Footer */}
      <View
        style={{
          borderTopColor: backgroundSecondaryTheme,
          backgroundColor: backgroundSecondaryTheme,
          borderTopWidth: 1,
          paddingBottom: bottom + 40,
        }}
      >
        {/* Drawer Footers */}
        <DrawerItem
          label="Settings"
          icon={({ color, size }) => (
            <Ionicons
              name="settings-outline"
              size={size}
              color={foregroundTheme}
            />
          )}
          // @ts-ignore
          //  router.push(`/(stack)/app_options/index`);
          onPress={() => router.push(`/(stack)/app_options`)}
          labelStyle={{
            fontWeight: "bold",
            color: foregroundTheme,
            marginLeft: Platform.OS === "ios" ? -20 : 0,
          }}
        />
        <DrawerItem
          label="OnBoarding"
          icon={({ color, size }) => (
            <Ionicons
              name="information-circle-outline"
              size={size}
              color={foregroundTheme}
            />
          )}
          onPress={() => router.push(`/onboarding`)}
          labelStyle={{
            fontWeight: "bold",
            color: foregroundTheme,
            marginLeft: Platform.OS === "ios" ? -20 : 0,
          }}
        />
        <DrawerItem
          label="OnBoarding2"
          icon={({ color, size }) => (
            <Ionicons
              name="information-circle-outline"
              size={size}
              color={foregroundTheme}
            />
          )}
          onPress={() => router.push(`/onboarding2`)}
          labelStyle={{
            fontWeight: "bold",
            color: foregroundTheme,
            marginLeft: Platform.OS === "ios" ? -20 : 0,
          }}
        />
        <DrawerItem
          label="Logout"
          icon={({ color, size }) => (
            <Ionicons name="exit-outline" size={size} color={foregroundTheme} />
          )}
          onPress={() => handleSignOut()}
          labelStyle={{
            fontWeight: "bold",
            color: foregroundTheme,
            marginLeft: Platform.OS === "ios" ? -20 : 0,
          }}
        />
      </View>
    </View>
  );
};

export default CustomDrawerContent;

// CustomDrawerItem
type CustomDrawerItemProps = {
  label: string;
  iconName: string;
  route: string;
  focused: boolean;
};

// Each CustomDrawerItem
function CustomDrawerItem({
  label,
  iconName,
  route,
  focused,
}: CustomDrawerItemProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundTheme =
    tailwindColors.background[isDark ? "tertiary" : "tertiaryDark"];
  const foregroundTheme =
    tailwindColors.foreground[isDark ? "tertiary" : "secondaryDark"];
  const backgroundSecondaryTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];
  const foregroundSecondaryTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];

  return (
    <DrawerItem
      label={label}
      icon={({ color, size }) => (
        <Ionicons name={iconName as any} size={size} color={color} />
      )}
      onPress={() => router.push(route as any)}
      focused={focused}
      labelStyle={{
        fontWeight: "bold",
        marginLeft: Platform.OS === "ios" ? -20 : 0,
      }}
      activeBackgroundColor={backgroundTheme}
      activeTintColor={foregroundTheme}
      inactiveTintColor={foregroundSecondaryTheme}
      inactiveBackgroundColor={backgroundSecondaryTheme}
    />
  );
}
