import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createClient();
  const { data: user } = await supabase
    .from("users")
    .select("onboarding_complete")
    .eq("clerk_user_id", userId)
    .single();

  if (user && !user.onboarding_complete) {
    redirect("/onboarding");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
