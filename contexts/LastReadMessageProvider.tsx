/*
2025-10-04 05:29:02
LastReadMessageProvider 는, 채팅룸 UI 를 감싸서, 
사용자가 특정 채팅룸에 입장했을 때, 
last_read_messages 테이블의 row 를 업데이트 해주면 되겠습니다.

2025-10-04 06:26:33
이 프로바이더의 코드는, ChatRoomPresenceProvider 으로 이동했습니다. 이 프로바이더는 이제 더 이상 사용되지 않습니다.


*/

import { useUser } from "@clerk/clerk-expo";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSupabase } from "./SupabaseProvider";
import { Tables } from "@/db/supabase/supabase";

interface LastReadMessageContextType {
  lastReadMessage: Tables<"last_read_messages"> | null;
  setLastReadMessage: (
    lastReadMessage: Tables<"last_read_messages"> | null
  ) => void;
}

const LastReadMessageContext = createContext<
  LastReadMessageContextType | undefined
>(undefined);

export const useLastReadMessage = () => {
  const context = useContext(LastReadMessageContext);
  if (!context) {
    throw new Error(
      "useLastReadMessage must be used within a LastReadMessageProvider"
    );
  }
  return context;
};

type LastReadMessageProviderProps = {
  children: React.ReactNode;
};

export const LastReadMessageProvider = ({
  children,
}: LastReadMessageProviderProps) => {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [lastReadMessage, setLastReadMessage] =
    useState<Tables<"last_read_messages"> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id || !supabase) return;
    const fetchLastReadMessage = async () => {
      const { data, error } = await supabase
        .from("last_read_messages")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setLastReadMessage(data);
    };
    fetchLastReadMessage();
  }, [user?.id, supabase]);

  return (
    <LastReadMessageContext.Provider
      value={{ lastReadMessage, setLastReadMessage }}
    >
      {children}
    </LastReadMessageContext.Provider>
  );
};
