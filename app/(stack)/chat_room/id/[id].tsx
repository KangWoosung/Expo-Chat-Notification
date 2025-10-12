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

import { View, ScrollView, TextInput, Button } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useChatRoom } from "@/contexts/ChatRoomProvider";
import { dummyUsers, dummyMessages } from "@/constants/dummyData";
import EachMessage from "@/components/chatRoom/EachMessage";
import InputArea from "@/components/chatRoom/InputArea";
import ChatRoomLoading from "@/components/chatRoom/ChatRoomLoading";
import { usePaginatedChatRoomMessages } from "@/hooks/usePaginatedChatRoomMessages";
import { useSendMessageWithState } from "@/hooks/useSendMessage";
import { queryClient } from "@/lib/queryClient";

const ChatRoom = () => {
  const { id: chatRoomId } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useUser();
  const { opponentUser, opponentUsers, setChatRoomId } = useChatRoom();

  // Message States & Refs
  const [message, setMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput | null>(null);

  // 🚀 페이지네이션 + 파일 정보 + Unread Count 통합 훅
  const {
    messages,
    unreadCounts,
    isLoading: messagesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: messagesError,
  } = usePaginatedChatRoomMessages(chatRoomId || "", true);

  // useMutation to send message
  const {
    sendMessage,
    isLoading: isSending,
    error: sendError,
  } = useSendMessageWithState();

  // Set the chatRoomId from params to context
  useEffect(() => {
    if (!chatRoomId) return;
    if (chatRoomId) {
      setChatRoomId(chatRoomId as string);
    }
    // 채팅룸에 들어올 때마다 unreadCount 새로고침
    // queryClient.invalidateQueries(['unreadCount', user?.id]);
  }, [chatRoomId, setChatRoomId]);

  // Message error handling
  useEffect(() => {
    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
    }
  }, [messagesError]);

  // useMutation to send message
  const handleSendMessage = async () => {
    if (!message.trim() || !chatRoomId || isSending) return;

    const result = await sendMessage({
      content: message,
      roomId: chatRoomId,
      messageType: "text",
    });

    if (result.success) {
      setMessage("");
      inputRef.current?.clear();
    }
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
        {/* 더 불러오기 버튼 (상단) */}
        {hasNextPage && (
          <View className="py-4 items-center">
            <Button
              title={isFetchingNextPage ? "Loading..." : "Load More"}
              onPress={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            />
          </View>
        )}

        {messages?.length > 0
          ? messages.map((msg) => (
              <EachMessage
                key={msg.message_id}
                sender={msg.sender_id || ""}
                message={msg}
                currentUser={currentUser}
                opponentUser={opponentUser}
                opponentUsers={opponentUsers}
                unreadCount={unreadCounts[msg.message_id] || 0}
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
                unreadCount={0}
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
        isLoading={isSending}
        error={sendError?.message}
      />
    </View>
  );
};

export default ChatRoom;
