// POST /api/webhooks/clerk — handles Clerk user.created and user.deleted events.

import { headers } from "next/headers";
import { Webhook } from "svix";

import { jsonError, jsonSuccess } from "@/lib/api/response";
import { CLERK_WEBHOOK_SECRET } from "@/lib/config";
import { createAdminClient } from "@/lib/supabase/admin";

type ClerkUserCreatedData = {
  id: string;
  email_addresses: { email_address: string }[];
  first_name: string | null;
  last_name: string | null;
};

type ClerkWebhookEvent =
  | { type: "user.created"; data: ClerkUserCreatedData }
  | { type: "user.deleted"; data: { id: string } };

interface InsertedUserRow {
  id: string;
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

/**
 * Verifies Svix signature and syncs Clerk users to Supabase.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const headerList = headers();
    const svixId = headerList.get("svix-id");
    const svixTimestamp = headerList.get("svix-timestamp");
    const svixSignature = headerList.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return jsonError("Missing svix headers", 400);
    }

    const body = await req.text();

    let event: ClerkWebhookEvent;
    try {
      const wh = new Webhook(CLERK_WEBHOOK_SECRET);
      // Svix verify returns unknown; narrow to our expected event union.
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error("Clerk webhook signature verification failed:", err);
      return jsonError("Invalid signature", 400);
    }

    const supabase = createAdminClient();

    if (event.type === "user.created") {
      return await handleUserCreated(supabase, event.data);
    }

    if (event.type === "user.deleted") {
      return await handleUserDeleted(supabase, event.data.id);
    }

    return jsonSuccess(null);
  } catch (err) {
    console.error("Clerk webhook handler error:", err);
    return jsonError("Internal error", 500);
  }
}

async function handleUserCreated(
  supabase: ReturnType<typeof createAdminClient>,
  data: ClerkUserCreatedData
): Promise<Response> {
  const clerkUserId = data.id;
  const email = data.email_addresses[0]?.email_address;

  if (!email) {
    console.error("user.created missing email", { clerk_user_id: clerkUserId });
    return jsonError("Missing email", 500);
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .insert({
      clerk_user_id: clerkUserId,
      email,
      first_name: data.first_name,
      last_name: data.last_name,
    })
    .select("id")
    .single();

  if (userError) {
    if (isUniqueViolation(userError)) {
      return jsonSuccess(null);
    }
    console.error("users insert failed", {
      clerk_user_id: clerkUserId,
      error: userError,
    });
    return jsonError("Failed to create user", 500);
  }

  const typedUser = user as InsertedUserRow;
  const userId = typedUser.id;

  const { error: itemsError } = await supabase.from("garden_items").insert({
    user_id: userId,
    fertilizer_count: 0,
    revival_potion_count: 0,
  });

  if (itemsError) {
    console.error("garden_items insert failed", {
      clerk_user_id: clerkUserId,
      error: itemsError,
    });
    return jsonError("Failed to initialize garden", 500);
  }

  const plots = Array.from({ length: 6 }, (_, plotIndex) => ({
    user_id: userId,
    plot_index: plotIndex,
  }));

  const { error: plotsError } = await supabase.from("garden_plots").insert(plots);

  if (plotsError) {
    console.error("garden_plots insert failed", {
      clerk_user_id: clerkUserId,
      error: plotsError,
    });
    return jsonError("Failed to initialize garden", 500);
  }

  return jsonSuccess(null);
}

async function handleUserDeleted(
  supabase: ReturnType<typeof createAdminClient>,
  clerkUserId: string
): Promise<Response> {
  const { error: deleteError } = await supabase
    .from("users")
    .delete()
    .eq("clerk_user_id", clerkUserId);

  if (deleteError) {
    console.error("users delete failed", {
      clerk_user_id: clerkUserId,
      error: deleteError,
    });
    return jsonError("Failed to delete user", 500);
  }

  return jsonSuccess(null);
}
