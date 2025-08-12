import { DEFAULT_AVATAR } from "@/constants/constants";
import { Image, Text, View } from "react-native";
import { Tables } from "@/supabase/supabase";

type User = Tables<"users">;

export default function Avatar({ user }: { user: User }) {
  return (
    <View className="flex-row items-center gap-lg">
      <Image
        source={{ uri: user.avatar || DEFAULT_AVATAR }}
        className="w-10 h-10 rounded-full"
      />
      <Text className="text-foreground dark:text-foreground-dark text-lg">
        {user.name}
      </Text>
    </View>
  );
}
