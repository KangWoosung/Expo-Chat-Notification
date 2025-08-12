import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AttachmentUploader from "./AttachmentUploader";
import { useChatRoom } from "@/contexts/ChatRoomContext";

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

  return (
    <View className="p-lg pb-xl bg-card dark:bg-card-dark border-t border-border dark:border-border-dark">
      <View className="flex flex-row items-center space-x-3">
        <TouchableOpacity className="text-foreground-secondary dark:text-foreground-secondaryDark">
          {/* <Ionicons name="add" size={24} color="white" /> */}
          <AttachmentUploader roomId={chatRoomId} />
        </TouchableOpacity>

        <View className="flex-1 relative">
          <TextInput
            ref={inputRef}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSendMessage}
            placeholder="메시지를 입력하세요..."
            className="w-full px-md py-md pr-12 rounded-full 
              bg-input dark:bg-input-dark border border-input-border dark:border-input-borderDark 
              focus:border-input-focus dark:focus:border-input-focusDark 
              text-foreground dark:text-foreground-dark 
              placeholder:text-foreground-tertiary dark:placeholder:text-foreground-tertiaryDark"
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary-hover dark:hover:bg-primary-hoverDark rounded-full items-center justify-center"
            disabled={!message.trim()}
          >
            <Ionicons name="send" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
