// Dashboard layout: auth gate, onboarding redirect, shell, and shard context.

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UserStatsProvider } from "@/contexts/user-stats-context";
import { createClient } from "@/lib/supabase/server";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface DashboardUserRow {
  onboarding_complete: boolean;
  shards: number;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createClient();
  const { data: userRow } = await supabase
    .from("users")
    .select("onboarding_complete, shards")
    .eq("clerk_user_id", userId)
    .single();

  const user = userRow as DashboardUserRow | null;

  if (user && !user.onboarding_complete) {
    redirect("/onboarding");
  }

  return (
    <UserStatsProvider initialShards={user?.shards ?? 0}>
      <DashboardShell>{children}</DashboardShell>
    </UserStatsProvider>
  );
}
