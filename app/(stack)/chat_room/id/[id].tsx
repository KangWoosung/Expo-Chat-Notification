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
import { Tables } from "@/db/supabase/supabase";
import { useChatRoom } from "@/contexts/ChatRoomProvider";
import { dummyUsers, dummyMessages } from "@/constants/dummyData";
import EachMessage from "@/components/chatRoom/EachMessage";
import InputArea from "@/components/chatRoom/InputArea";
import ChatRoomLoading from "@/components/chatRoom/ChatRoomLoading";

type Message = Tables<"messages">;

const ChatRoom = () => {
  const { id: chatRoomId } = useLocalSearchParams<{ id: string }>();
  const { supabase } = useSupabase();
  const { user: currentUser } = useUser();
  const { opponentUser, opponentUsers, setChatRoomId } = useChatRoom();

  // Message States & Refs
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Set the chatRoomId from params to context
  useEffect(() => {
    if (chatRoomId) {
      setChatRoomId(chatRoomId as string);
    }
  }, [chatRoomId, setChatRoomId]);

  // Fetch messages from Supabase
  useEffect(() => {
    if (!supabase || !chatRoomId) return;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      const { data, error, status } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", chatRoomId)
        .order("sent_at", { ascending: true });
      if (error) {
        console.error("Error fetching messages:", error);
      } else if (status === 200) {
        setMessages(data || []);
        setMessagesLoading(false);
      } else {
        console.error("Error fetching messages:", status, error);
        setMessagesLoading(false);
      }
    };
    fetchMessages();
  }, [chatRoomId, supabase]);

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
