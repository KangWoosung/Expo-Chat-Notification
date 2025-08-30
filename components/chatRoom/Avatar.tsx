import { DEFAULT_AVATAR } from "@/constants/constants";
import { Image, Text, View } from "react-native";

export default function Avatar({
  name,
  avatar,
}: {
  name: string;
  avatar: string;
}) {
  return (
    <View className="flex-col items-center gap-xs">
      <Image
        source={{ uri: avatar || DEFAULT_AVATAR }}
        className="w-10 h-10 rounded-full"
      />
      {/* <Text className="text-foreground dark:text-foreground-dark text-lg">
        {name}
      </Text> */}
    </View>
  );
}
