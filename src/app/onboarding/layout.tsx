import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CresciaWordmark } from "@/components/crescia-wordmark";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingLayout({
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

  if (user?.onboarding_complete) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-6 py-10">
        <header className="mb-10 text-center">
          <CresciaWordmark className="text-2xl" />
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
