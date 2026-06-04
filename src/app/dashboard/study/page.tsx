import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { StudySession } from "@/components/study/study-session";
import { createClient } from "@/lib/supabase/server";
import type { SubjectSlug } from "@/types";

async function StudySessionLoader() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createClient();
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  let enrolledSlugs: SubjectSlug[] = [];

  if (user) {
    const { data: rows } = await supabase
      .from("user_subjects")
      .select("subject_slug")
      .eq("user_id", user.id);

    enrolledSlugs = (rows ?? [])
      .map((r) => r.subject_slug)
      .filter((slug): slug is SubjectSlug => typeof slug === "string");
  }

  return <StudySession enrolledSlugs={enrolledSlugs} />;
}

export default function StudyPage() {
  return (
    <Suspense fallback={<StudyPageSkeleton />}>
      <StudySessionLoader />
    </Suspense>
  );
}

function StudyPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl animate-pulse space-y-8 py-8">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="h-4 w-64 rounded bg-muted" />
      <div className="h-12 rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-32 rounded-2xl bg-muted" />
        <div className="h-32 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
