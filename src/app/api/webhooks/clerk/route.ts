import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

type ClerkUserCreatedData = {
  id: string;
  email_addresses: { email_address: string }[];
  first_name: string | null;
  last_name: string | null;
};

type ClerkWebhookEvent =
  | { type: "user.created"; data: ClerkUserCreatedData }
  | { type: "user.deleted"; data: { id: string } };

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const headerList = headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Clerk webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    if (event.type === "user.created") {
      const clerkUserId = event.data.id;
      const email = event.data.email_addresses[0]?.email_address;

      if (!email) {
        console.error("user.created missing email", { clerk_user_id: clerkUserId });
        return NextResponse.json({ error: "Missing email" }, { status: 500 });
      }

      const { data: user, error: userError } = await supabase
        .from("users")
        .insert({
          clerk_user_id: clerkUserId,
          email,
          first_name: event.data.first_name,
          last_name: event.data.last_name,
        })
        .select("id")
        .single();

      if (userError) {
        if (isUniqueViolation(userError)) {
          return NextResponse.json({ ok: true }, { status: 200 });
        }
        console.error("users insert failed", {
          clerk_user_id: clerkUserId,
          error: userError,
        });
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
      }

      const userId = user.id;

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
        return NextResponse.json({ error: "Failed to initialize garden" }, { status: 500 });
      }

      const plots = Array.from({ length: 6 }, (_, plotIndex) => ({
        user_id: userId,
        plot_index: plotIndex,
      }));

      const { error: plotsError } = await supabase
        .from("garden_plots")
        .insert(plots);

      if (plotsError) {
        console.error("garden_plots insert failed", {
          clerk_user_id: clerkUserId,
          error: plotsError,
        });
        return NextResponse.json({ error: "Failed to initialize garden" }, { status: 500 });
      }

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (event.type === "user.deleted") {
      const clerkUserId = event.data.id;

      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .eq("clerk_user_id", clerkUserId);

      if (deleteError) {
        console.error("users delete failed", {
          clerk_user_id: clerkUserId,
          error: deleteError,
        });
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
      }

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    const clerkUserId =
      event.type === "user.created" || event.type === "user.deleted"
        ? event.data.id
        : undefined;
    console.error("Clerk webhook handler error", {
      clerk_user_id: clerkUserId,
      error: err,
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
