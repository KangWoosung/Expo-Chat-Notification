/*
2025-10-03 01:12:11
This function is not used by App itself.
But it is used by Backend - Supabase as an Edge Function via scheduled daemon.

The Notification Json is in the pending table made by SQL Trigger Function.
SQL Trigger Function Code is:

-- 2025-10-02 11:28:49
-- Trigger Function
create or replace function queue_notification_if_offline()
returns trigger
security definer  -- 여기 추가
set search_path = public  -- 보안상 search_path 고정 권장
as $$
declare
  participants text[];
  online_users text[];
  target_users text[];
  target_user text;
  sender_name text;
  sender_avatar text;
  message_preview text;
  payload jsonb;
  target_push_token text;
begin
  -- Member list in the room (excluding the sender)
  select array_agg(user_id) into participants
  from chat_room_members
  where room_id = NEW.room_id
    and user_id <> NEW.sender_id;

  -- Currently online users
  select array_agg(user_id) into online_users
  from users_in_room
  where room_id = NEW.room_id
    and last_seen > now() - interval '30 seconds';

  -- Only offline users are filtered
  target_users := array(
    select unnest(participants)
    except
    select unnest(coalesce(online_users, '{}'))
  );

  -- 4. Get sender name
  select name into sender_name
  from users
  where user_id = NEW.sender_id
  limit 1;

  -- 5. Get sender avatar
  select avatar into sender_avatar
  from users
  where user_id = NEW.sender_id
  limit 1;

  -- 6. Message preview (limited to 50 characters)
  message_preview := left(NEW.content, 50);

  -- 7. Insert notification for each offline user
  foreach target_user in array target_users
  loop
    -- (a) Get push token
    select push_token into target_push_token
    from users
    where user_id = target_user
    limit 1;

    -- (b) skip if push_token is null
    if push_token is null then
      continue;
    end if;

    -- (c) expo notification payload configuration
    payload := jsonb_build_object(
      'to', target_push_token,
      'sound', 'default',
      'title', 'New Message from ' || sender_name,
      'body', message_preview,
      'data', jsonb_build_object(
        'room_id', NEW.room_id,
        'message_id', NEW.message_id,
        'sender_id', NEW.sender_id,
        'sender_avatar', sender_avatar,
        'target_user_id', target_user,
        'sender_name', sender_name,
        'messagePreview', message_preview,
        'deepLink', format('notification_try07://chat_room/id/%s', NEW.room_id)
      )
    );

    insert into notification_pending (user_id, expo_payload)
    values (target_user, payload);
  end loop;

  return new;
end;
$$ language plpgsql;

-- Create trigger
drop trigger if exists queue_notification_if_offline_trigger on messages;

create trigger queue_notification_if_offline_trigger
after insert on messages
for each row 
execute procedure queue_notification_if_offline();


*/
// /db/edgeFunctions/expo_notification_push.ts
// Supabase Edge Function for Expo Notification Push
// @ts-nocheck
/* eslint-disable */
import { createClient } from "npm:@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // get pending list
  const { data: pending, error } = await supabase
    .from("notification_pending")
    .select("id, expo_payload")
    .limit(500);

  if (error) {
    console.error("DB Error:", error);
    return new Response("DB Query Error", { status: 500 });
  }

  if (!pending || pending.length === 0) {
    return new Response("No notifications to send");
  }

  // get expo_payload
  const messages = pending.map((p) => p.expo_payload);

  // chunk function
  const chunk = <T>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );

  const chunks = chunk(messages, 100);

  // Expo Push API call
  for (const batch of chunks) {
    try {
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
      });

      if (!res.ok) {
        console.error("Expo push failed:", await res.text());
      }
    } catch (err) {
      console.error("Expo push error:", err);
    }
  }

  // delete sent records
  const idsToDelete = pending.map((p) => p.id);
  const { error: deleteError } = await supabase
    .from("notification_pending")
    .delete()
    .in("id", idsToDelete);

  if (deleteError) {
    console.error("Delete error:", deleteError);
  }

  return new Response("Notifications sent");
});
