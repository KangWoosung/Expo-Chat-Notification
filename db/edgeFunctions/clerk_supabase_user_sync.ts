/*
2025-10-03 01:12:11
This function is not used by App itself.
But it is used by Backend - Supabase as an Edge Function.


*/
// /supabase/edge_functions/clerk_supabase_user_sync.ts
// Supabase Edge Function for Sync Clerk with Supabase
// @ts-nocheck
/* eslint-disable */
import { createClient } from "npm:@supabase/supabase-js";
import { verifyWebhook } from "npm:@clerk/backend/webhooks";
Deno.serve(async (req) => {
  // 1. Verify Clerk webhook
  const webhookSecret = Deno.env.get("CLERK_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is missing");
    return new Response("Webhook secret not configured", {
      status: 500,
    });
  }
  const event = await verifyWebhook(req, {
    signingSecret: webhookSecret,
  });
  // 2. Create Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("!supabaseUrl || !supabaseServiceKey");
    return new Response("Supabase credentials not configured", {
      status: 500,
    });
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  switch (event.type) {
    case "user.created": {
      const clerkUser = event.data;
      const { data: user, error } = await supabase
        .from("users")
        .insert([
          {
            user_id: clerkUser.id,
            name: `${clerkUser.username ?? "unknown"}`.trim(),
            email: clerkUser.email_addresses?.[0]?.email_address ?? "",
            avatar: clerkUser.image_url,
            push_token: null, // or default value
          },
        ])
        .select()
        .order("user_id", {
          ascending: true,
        })
        .limit(1)
        .single();
      if (error) {
        console.error("Error creating user:", error);
        return new Response(
          JSON.stringify({
            error: error.message,
          }),
          {
            status: 500,
          }
        );
      }
      return new Response(
        JSON.stringify({
          user,
        }),
        {
          status: 200,
        }
      );
    }
    case "user.updated": {
      const clerkUser = event.data;
      const { data: user, error } = await supabase
        .from("users")
        .update({
          name: `${clerkUser.first_name ?? ""} ${clerkUser.last_name ?? ""}`.trim(),
          email: clerkUser.email_addresses?.[0]?.email_address ?? "",
          avatar: clerkUser.image_url,
        })
        .eq("user_id", clerkUser.id)
        .select()
        .order("user_id", {
          ascending: true,
        })
        .select()
        .maybeSingle(); // 없으면 null 반환, 에러는 안 던짐
      if (error) {
        console.error("Error updating user:", error);
        return new Response(
          JSON.stringify({
            error: error.message,
          }),
          {
            status: 500,
          }
        );
      }
      return new Response(
        JSON.stringify({
          user,
        }),
        {
          status: 200,
        }
      );
    }
    default: {
      // Other event types can be added as needed
      console.log("Unhandled event type:", JSON.stringify(event, null, 2));
      return new Response(
        JSON.stringify({
          success: true,
        }),
        {
          status: 200,
        }
      );
    }
  }
});
