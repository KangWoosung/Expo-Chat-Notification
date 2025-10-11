/*
2025-10-12 06:42:34



*/
// contexts/MessageUnreadCountProvider.tsx
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSupabase } from "./SupabaseProvider";

interface UnreadCountMap {
  [messageId: string]: number;
}

const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;

const MessageUnreadCountContext = createContext<UnreadCountMap>({});

export function MessageUnreadCountProvider({
  roomId,
  children,
}: {
  roomId: string;
  children: ReactNode;
}) {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCountMap>({});
  const [offset, setOffset] = useState(DEFAULT_OFFSET);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { supabase } = useSupabase();

  useEffect(() => {
    if (!supabase || !roomId) return;

    const fetchAllUnreadCounts = async () => {
      // 🚀 한 번의 호출로 모든 메시지의 읽음 상태 가져오기
      const { data, error } = await supabase.rpc(
        "get_room_messages_unread_counts",
        { p_room_id: roomId, p_limit: limit, p_offset: offset }
      );

      if (data) {
        // Array를 Map으로 변환
        const countMap = data.reduce((acc, { message_id, unread_count }) => {
          acc[message_id] = unread_count;
          return acc;
        }, {} as UnreadCountMap);

        setUnreadCounts(countMap);
      }
    };

    fetchAllUnreadCounts();
  }, [supabase, roomId]);

  return (
    <MessageUnreadCountContext.Provider value={unreadCounts}>
      {children}
    </MessageUnreadCountContext.Provider>
  );
}

export const useMessageUnreadCount = (messageId: string) => {
  const counts = useContext(MessageUnreadCountContext);
  return counts[messageId] || 0;
};
