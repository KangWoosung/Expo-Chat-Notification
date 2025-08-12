// /contexts/ChatRoomPresenceContext.tsx

import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-expo";
import { createContext, useContext, useEffect, useState } from "react";

type ChatRoomPresenceContextType = {
  currentRoomId: string | null;
};

const ChatRoomPresenceContext = createContext<ChatRoomPresenceContextType>({
  currentRoomId: null,
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

  useEffect(() => {
    if (!user?.id || !roomId) return;

    const enter = async () => {
      setCurrentRoomId(roomId);
      await supabase.from("users_in_room").upsert({
        user_id: user.id,
        room_id: roomId,
        entered_at: new Date().toISOString(),
      });
    };

    const exit = async () => {
      setCurrentRoomId(null);
      await supabase
        .from("users_in_room")
        .delete()
        .eq("user_id", user.id)
        .eq("room_id", roomId);

      // Remove possible garbages
    };

    enter();

    return () => {
      exit();
    };
  }, [user?.id, roomId]);

  return (
    <ChatRoomPresenceContext.Provider value={{ currentRoomId }}>
      {children}
    </ChatRoomPresenceContext.Provider>
  );
};
