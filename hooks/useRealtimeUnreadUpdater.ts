/*
2025-10-14 11:08:41

Not used anymore
Realtime Updater Code is integrated into ChatRoomsProvider


2025-10-04 02:15:32

This hook is not used in codebase yet.




// /hooks/useRealtimeUnreadUpdater.ts
import { useEffect, useRef } from "react";
import { useSupabase } from "@/contexts/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { useUnreadMessagesCount } from "@/contexts/UnreadMessagesCountProvider";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/db/supabase/supabase";

type UnreadMessagesCountRowType = {
  room_id: string;
  unread_count: number;
};

export function useRealtimeUnreadUpdater() {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const {
    unreadMessagesCountArray,
    setUnreadMessagesCountArray,
    setUnreadMessagesCountTotal,
    fetchUnreadMessagesCount,
  } = useUnreadMessagesCount();

  // fetch 함수가 재생성되어도 안전하게 호출하려면 ref에 넣어두자
  const fetchRef = useRef(fetchUnreadMessagesCount);
  useEffect(() => {
    fetchRef.current = fetchUnreadMessagesCount;
  }, [fetchUnreadMessagesCount]);

  useEffect(() => {
    if (!user?.id || !supabase) return;

    // supabase.channel is a Realtime syntax.
    // When a specified event occurs on the channel, the function will be invoked.
    // For more details, we will learn it in the next chapter.
    //
    // 1. INSERT event on messages table -- new messages event
    const channelInsert = supabase
      .channel("realtime-unread-local")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const message = payload.new;
          if (!message || message.sender_id === user?.id) return;
          //   if (unreadMessagesCountArray.length === 0) return;

          // Find the room
          const roomId = message.room_id;
          // functional update 사용 => 최신 상태(prev)를 안전하게 사용 가능
          setUnreadMessagesCountArray((prev = []) => {
            const exists = prev.find((r) => r.room_id === roomId);
            const newArray = exists
              ? prev.map((r) =>
                  r.room_id === roomId
                    ? { ...r, unread_count: r.unread_count + 1 }
                    : r
                )
              : [...prev, { room_id: roomId, unread_count: 1 }];

            return newArray;
          });

          // 총합은 단일 메시지 증가니까 functional로 +1
          setUnreadMessagesCountTotal((prev = 0) => prev + 1);
        }
      )
      .subscribe((status) => {
        console.log("####### INSERT event on messages table status", status);
      });
    // End of 1. INSERT event on messages table Channel subscription

    // 2. UPDATE event on message_reads table -- read messages event
    const channelUpdate = supabase
      .channel("realtime-read-messages-local")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "last_read_messages" },
        (payload) => {
          // console.log("Event type:", payload.eventType);
          if (["INSERT", "UPDATE"].includes(payload.eventType)) {
            const { user_id } = payload.new as { user_id: string };
            if (user_id === user?.id) {
              console.log(
                "####### Update event on last_read_messages table catched!!!!"
              );
              fetchRef.current();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(
          "####### UPDATE event listner on last_read_messages table status",
          status
        );
      });
    // End of 2. UPDATE event on messages table Channel subscription

    // Clean up the channel subscription
    return () => {
      supabase.removeChannel(channelInsert);
      supabase.removeChannel(channelUpdate);
    };
  }, [supabase, user?.id]);
}
*/
