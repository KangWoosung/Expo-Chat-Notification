/*
2025-10-03 01:12:11
This function is not used by App itself.
But it is used by Backend - Supabase as an Edge Function via scheduled daemon.

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
