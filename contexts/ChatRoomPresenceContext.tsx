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

Role: "Manage chat room lifecycle"

enterRoom():
  ✅ register in users_in_room table
  ✅ update last_read_messages (read processing)
  ✅ Optimistic Update (-1)
  ✅ start heartbeat

leaveRoom():
  ✅ remove from users_in_room
  ✅ remove the cache (fresh start)
  ✅ stop heartbeat


*/

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "./SupabaseProvider";
import { useQueryClient } from "@tanstack/react-query";
import { paginatedMessagesKeys } from "@/hooks/usePaginatedChatRoomMessages";
import { myChatRoomsKeys } from "@/hooks/useMyChatRoomsWithUnread";

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
  const queryClient = useQueryClient();

  // heartbeat interval reference
  const heartbeatRef = useRef<number | null>(null);

  const leaveRoom = useCallback(async () => {
    if (!user?.id || !roomId || !supabase) return;
    try {
      setCurrentRoomId(null);

      // interval release
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }

      // ✅ 1. Optimistic Update: set chatRoomsStore unread count to 0
      queryClient.setQueryData(
        myChatRoomsKeys.user(user.id),
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            unreadCounts: {
              ...oldData.unreadCounts,
              [roomId]: 0, // set the unread count of the room to 0
            },
          };
        }
      );

      // ✅ 2. remove the room's internal cache: fresh data fetch when entering the room again
      queryClient.removeQueries({
        queryKey: paginatedMessagesKeys.room(roomId),
      });

      // ✅ 3. invalidate the room list cache: validate with DB values
      queryClient.invalidateQueries({
        queryKey: myChatRoomsKeys.user(user.id),
      });

      // delete from users_in_room table
      await supabase
        .from("users_in_room")
        .delete()
        .eq("user_id", user.id)
        .eq("room_id", roomId);
    } catch (err) {
      console.error("Failed to exit room:", err);
    }
  }, [user?.id, roomId, supabase, queryClient]);

  const enterRoom = useCallback(async () => {
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
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("message_id, sent_at")
        .eq("room_id", roomId)
        .order("sent_at", { ascending: false })
        .limit(1)
        .single();

      // insert into last_read_messages table
      await supabase.from("last_read_messages").upsert({
        user_id: user.id,
        room_id: roomId,
        last_read_message_id: lastMsg?.message_id ?? null,
        last_read_at: new Date().toISOString(),
      });

      // ✅ get the exact unread count after updating last_read_messages
      // instead of Optimistic Update, use invalidate to show the exact value from the DB
      queryClient.invalidateQueries({
        queryKey: paginatedMessagesKeys.room(roomId),
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
  }, [user?.id, roomId, supabase, queryClient]);

  useEffect(() => {
    if (!user?.id || !roomId || !supabase) return;

    enterRoom();

    return () => {
      leaveRoom().catch((err) => console.error("Cleanup failed:", err));
    };
  }, [user?.id, roomId, supabase, enterRoom, leaveRoom]);

  return (
    <ChatRoomPresenceContext.Provider
      value={{ currentRoomId, leaveRoom, enterRoom }}
    >
      {children}
    </ChatRoomPresenceContext.Provider>
  );
};
