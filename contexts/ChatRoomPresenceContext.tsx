// /contexts/ChatRoomPresenceContext.tsx
/*
2025-10-04 06:08:03
enterRoom:
- insert into users_in_room table
- get last message id in the room
- upsert into last_read_messages table
- Clear interval if exists
- Start heartbeat interval

leaveRoom:
- delete from users_in_room table
- stop heartbeat interval


*/

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "./SupabaseProvider";

type ChatRoomPresenceContextType = {
  currentRoomId: string | null;
  leaveRoom: () => Promise<void>;
  enterRoom: () => Promise<void>;
};

const ChatRoomPresenceContext = createContext<ChatRoomPresenceContextType>({
  currentRoomId: null,
  leaveRoom: () => Promise.resolve(),
  enterRoom: () => Promise.resolve(),
});

export const useChatRoomPresence = () => useContext(ChatRoomPresenceContext);

export const ChatRoomPresenceProvider = ({
  roomId,
  children,
}: {
  roomId: string;
  children: React.ReactNode;
}) => {
  const { user } = useUser();
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const { supabase } = useSupabase();

  // heartbeat interval reference
  const heartbeatRef = useRef<number | null>(null);

  const leaveRoom = async () => {
    if (!user?.id || !roomId || !supabase) return;
    try {
      setCurrentRoomId(null);

      // interval release
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }

      // delete from users_in_room table
      await supabase
        .from("users_in_room")
        .delete()
        .eq("user_id", user.id)
        .eq("room_id", roomId);
    } catch (err) {
      console.error("Failed to exit room:", err);
    }
  };

  const enterRoom = async () => {
    if (!user?.id || !roomId || !supabase) return;
    try {
      setCurrentRoomId(roomId);

      // insert into users_in_room table
      await supabase.from("users_in_room").upsert({
        user_id: user.id,
        room_id: roomId,
        entered_at: new Date().toISOString(),
      });

      // get last message id in the room
      const { data: lastMsg, error: lastMsgError } = await supabase
        .from("messages")
        .select("message_id, sent_at")
        .eq("room_id", roomId)
        .order("sent_at", { ascending: false })
        .limit(1)
        .single();

      // insert into last_read_messages table
      const { error: lastReadMessagesUpsertError } = await supabase
        .from("last_read_messages")
        .upsert({
          user_id: user.id,
          room_id: roomId,
          last_read_message_id: lastMsg?.message_id ?? null,
          last_read_at: new Date().toISOString(),
        });

      // Clear interval if exists
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }

      // heartbeat interval start
      if (!heartbeatRef.current) {
        heartbeatRef.current = setInterval(async () => {
          try {
            await supabase
              .from("users_in_room")
              .update({ last_seen: new Date().toISOString() })
              .eq("user_id", user.id)
              .eq("room_id", roomId);
          } catch (err) {
            console.error("Heartbeat update failed:", err);
          }
        }, 30_000);
      }
    } catch (err) {
      console.error("Failed to enter room:", err);
    }
  };

  useEffect(() => {
    if (!user?.id || !roomId || !supabase) return;

    enterRoom();

    return () => {
      leaveRoom().catch((err) => console.error("Cleanup failed:", err));
    };
  }, [user?.id, roomId, supabase]);

  return (
    <ChatRoomPresenceContext.Provider
      value={{ currentRoomId, leaveRoom, enterRoom }}
    >
      {children}
    </ChatRoomPresenceContext.Provider>
  );
};
