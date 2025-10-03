import React from "react";
import { Stack } from "expo-router";
import { useChatRoom } from "@/contexts/ChatRoomProvider";
import { ChatRoomPresenceProvider } from "@/contexts/ChatRoomPresenceContext";

const ChatRoomLayout = () => {
  const { chatRoomId } = useChatRoom();
  return (
    <ChatRoomPresenceProvider roomId={chatRoomId || ""}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="id" />
      </Stack>
    </ChatRoomPresenceProvider>
  );
};

export default ChatRoomLayout;
