import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AttachmentUploader from "./AttachmentUploader";
import { useChatRoom } from "@/contexts/ChatRoomContext";
import { HEADER_ICON_SIZE, HEADER_ICON_SIZE_SM } from "@/constants/constants";
import { useColorScheme } from "nativewind";
import tailwindColors from "@/utils/tailwindColors";

type InputAreaProps = {
  message: string;
  setMessage: (text: string) => void;
  handleSendMessage: () => void;
  inputRef: React.RefObject<TextInput | null>;
};

export default function InputArea({
  message,
  setMessage,
  handleSendMessage,
  inputRef,
}: InputAreaProps) {
  const { chatRoomId } = useChatRoom();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const foregroundTheme =
    tailwindColors.foreground[isDark ? "secondaryDark" : "secondary"];
  const backgroundTheme =
    tailwindColors.background[isDark ? "secondaryDark" : "secondary"];

  return (
    <View className="p-md pb-xl bg-card dark:bg-card-dark border-t border-border dark:border-border-dark">
      <View className="flex flex-row items-center space-x-3 gap-sm">
        <View className="text-foreground-secondary dark:text-foreground-secondaryDark">
          {/* <Ionicons name="add" size={24} color="white" /> */}
          <AttachmentUploader roomId={chatRoomId} />
        </View>

        <View className="flex-1 relative">
          <TextInput
            ref={inputRef}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSendMessage}
            placeholder="Type a message..."
            className="w-full px-md py-md pr-12 rounded-full 
              bg-input dark:bg-input-dark border border-input-border dark:border-input-borderDark 
              focus:border-input-focus dark:focus:border-input-focusDark 
              text-foreground dark:text-foreground-dark 
              placeholder:text-foreground-tertiary dark:placeholder:text-foreground-tertiaryDark"
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 
            items-center justify-center
            p-2 rounded-full bg-background dark:bg-background-dark 
            border border-border dark:border-border-dark
            "
            disabled={!message.trim()}
          >
            <Ionicons
              name="send-outline"
              size={HEADER_ICON_SIZE}
              color={foregroundTheme}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
