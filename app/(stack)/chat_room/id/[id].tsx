/*
2025-08-12 02:11:35
The pathname parameter information this component receives is..
`/chat_room/id/${roomId}`

Rules...
1. Get information from the Table "chat_rooms" and "chat_room_members"
2. If it's a 1:1 chat room, this room is a "Direct Chat"
3. If it's a multi user chat room, this room is a "Group Chat"

Navigation Titles Rules...
1. If it's a 1:1 chat room, the title is the name of the opponent user
2. If it's a multi user chat room, the title is the name of the chat room


*/

import { View, ScrollView, TextInput } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
// import { Tables } from "@/db/supabase/supabase"; // 불필요
import { useChatRoom } from "@/contexts/ChatRoomProvider";
import { dummyUsers, dummyMessages } from "@/constants/dummyData";
import EachMessage from "@/components/chatRoom/EachMessage";
import InputArea from "@/components/chatRoom/InputArea";
import ChatRoomLoading from "@/components/chatRoom/ChatRoomLoading";
import {
  useImprovedChatRoomMessages,
  improvedMessagesKeys,
} from "@/hooks/useImprovedChatRoomMessages";
import { useQueryClient } from "@tanstack/react-query";

const ChatRoom = () => {
  const { id: chatRoomId } = useLocalSearchParams<{ id: string }>();
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();
  const { opponentUser, opponentUsers, setChatRoomId } = useChatRoom();

  // Message States & Refs
  const [message, setMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput | null>(null);

  // 🚀 개선된 메시지 쿼리 (file_id 직접 접근)
  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useImprovedChatRoomMessages(chatRoomId || "", true);

  const queryClient = useQueryClient();
  const invalidateMessages = (roomId: string) => {
    queryClient.invalidateQueries({
      queryKey: improvedMessagesKeys.room(roomId),
    });
  };

  // Set the chatRoomId from params to context
  useEffect(() => {
    if (chatRoomId) {
      setChatRoomId(chatRoomId as string);
    }
  }, [chatRoomId, setChatRoomId]);

  // 메시지 에러 처리
  useEffect(() => {
    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
    }
  }, [messagesError]);

  // Send message to Supabase
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser?.id || !supabase) return;
    (async () => {
      try {
        const { error } = await supabase.from("messages").insert({
          content: message,
          sender_id: currentUser.id,
          room_id: chatRoomId,
        });
        if (error) {
          console.error("Error sending message:", error);
        } else {
          setMessage("");
          inputRef.current?.clear();

          // 메시지 캐시 무효화로 새로운 메시지 포함해서 다시 로드
          if (chatRoomId) {
            invalidateMessages(chatRoomId);
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    })();
  };

  if (messagesLoading) {
    return <ChatRoomLoading />;
  }

  return (
    <View className="flex-1 bg-background-blank dark:bg-background-dark">
      {/* Header */}

      {/* Messages - flex-1 */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4 bg-background dark:bg-background-dark"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
        onContentSizeChange={() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }}
        onLayout={() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }}
      >
        {messages.length > 0
          ? messages.map((msg) => (
              <EachMessage
                key={msg.message_id}
                sender={msg.sender_id || ""}
                message={msg}
                currentUser={currentUser}
                opponentUser={opponentUser}
                opponentUsers={opponentUsers}
              />
            ))
          : dummyMessages.map((msg) => (
              <EachMessage
                key={msg.message_id}
                sender={msg.sender_id || ""}
                message={msg}
                currentUser={currentUser}
                opponentUser={null}
                opponentUsers={dummyUsers}
              />
            ))}
      </ScrollView>

      {/* Input Area - fixed at the bottom */}
      <InputArea
        message={message}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
        inputRef={inputRef}
        chatRoomId={chatRoomId}
      />
    </View>
  );
};

export default ChatRoom;
