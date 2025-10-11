/*
2025-10-04 01:07:34

Provider for unread messages count per chat room.

*/
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSupabase } from "./SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";

interface UnreadMessagesCountContextType {
  unreadMessagesCountArray: UnreadMessagesCountRowType[];
  setUnreadMessagesCountArray: React.Dispatch<
    React.SetStateAction<UnreadMessagesCountRowType[]>
  >;
  unreadMessagesCountTotal: number;
  setUnreadMessagesCountTotal: React.Dispatch<React.SetStateAction<number>>;
  isLoading: boolean;
  error: Error | null;
  fetchUnreadMessagesCount: () => void;
}

const UnreadMessagesCountContext = createContext<
  UnreadMessagesCountContextType | undefined
>(undefined);
export const useUnreadMessagesCount = () => {
  const context = useContext(UnreadMessagesCountContext);
  if (context === undefined) {
    throw new Error(
      "useUnreadMessagesCount must be used within a UnreadMessagesCountProvider"
    );
  }
  return context;
};

type UnreadMessagesCountProviderProps = {
  children: ReactNode;
};
type UnreadMessagesCountRowType = {
  room_id: string;
  unread_count: number;
};

const UnreadMessagesCountProvider = ({
  children,
}: UnreadMessagesCountProviderProps) => {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [unreadMessagesCountArray, setUnreadMessagesCountArray] = useState<
    UnreadMessagesCountRowType[]
  >([]);
  const [unreadMessagesCountTotal, setUnreadMessagesCountTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUnreadMessagesCount = async () => {
    if (!supabase || !user?.id) return;
    setIsLoading(true);
    const { data, error } = await supabase.rpc("get_user_unread_counts", {
      p_user_id: user.id,
    });
    if (error) {
      console.error("Error fetching unread messages count:", error);
      setError(error);
    } else {
      console.log("#######Unread data", data);
      setUnreadMessagesCountArray(data);
      setUnreadMessagesCountTotal(
        (data ?? []).reduce((acc, curr) => acc + curr.unread_count, 0)
      );
      console.log("unreadMessagesCountArray", unreadMessagesCountArray);
      console.log("unreadMessagesCountTotal", unreadMessagesCountTotal);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id || !supabase) return;
    fetchUnreadMessagesCount();

    return () => {
      setUnreadMessagesCountArray([]);
      setUnreadMessagesCountTotal(0);
    };
  }, [user?.id, supabase]);

  return (
    <UnreadMessagesCountContext.Provider
      value={{
        unreadMessagesCountArray,
        setUnreadMessagesCountArray,
        unreadMessagesCountTotal,
        setUnreadMessagesCountTotal,
        isLoading,
        error,
        fetchUnreadMessagesCount,
      }}
    >
      {children}
    </UnreadMessagesCountContext.Provider>
  );
};

export default UnreadMessagesCountProvider;
