import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Coins, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import {
  getSubjectMeta,
  SUBJECT_SLUGS,
  type ReadinessScores,
  type SubjectSlug,
} from "@/types";

const DAILY_GOAL_QUESTIONS = 20;
const DAILY_GOAL_PROGRESS = 0;

const CHALLENGES = [
  {
    id: "stats-correct",
    description: "Answer 5 AP Stats questions correctly",
    shards: 10,
  },
  {
    id: "timed-session",
    description: "Complete a timed session",
    shards: 15,
  },
  {
    id: "frq",
    description: "Answer 1 FRQ",
    shards: 20,
  },
] as const;

function DashboardCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background p-5 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

function ShardBadge({ amount }: { amount: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#C9A84C]/15 px-2.5 py-0.5 text-xs font-medium text-[#9A7B2E]">
      <Coins className="size-3" aria-hidden />
      +{amount} Shards
    </span>
  );
}

function isSubjectSlug(value: string): value is SubjectSlug {
  return (SUBJECT_SLUGS as readonly string[]).includes(value);
}

function parseReadinessScores(raw: unknown): ReadinessScores {
  const defaults: ReadinessScores = {
    "ap-stats": 0,
    "ap-bio": 0,
    "ap-calc-ab": 0,
    "ap-calc-bc": 0,
  };
  if (!raw || typeof raw !== "object") return defaults;
  const obj = raw as Record<string, unknown>;
  for (const slug of SUBJECT_SLUGS) {
    const value = obj[slug];
    if (typeof value === "number" && !Number.isNaN(value)) {
      defaults[slug] = Math.min(100, Math.max(0, Math.round(value)));
    }
  }
  return defaults;
}

export default async function DashboardPage() {
  const { userId } = await auth();
  let streak = 0;
  let enrolledSubjects: SubjectSlug[] = [];
  let readinessScores: ReadinessScores = {
    "ap-stats": 0,
    "ap-bio": 0,
    "ap-calc-ab": 0,
    "ap-calc-bc": 0,
  };

  if (userId) {
    const supabase = await createClient();
    const { data: user } = await supabase
      .from("users")
      .select("id, streak_count, readiness_scores")
      .eq("clerk_user_id", userId)
      .single();

    if (user) {
      streak = user.streak_count ?? 0;
      readinessScores = parseReadinessScores(user.readiness_scores);

      const { data: rows } = await supabase
        .from("user_subjects")
        .select("subject_slug")
        .eq("user_id", user.id);

      enrolledSubjects = (rows ?? [])
        .map((r) => r.subject_slug)
        .filter((slug): slug is SubjectSlug => isSubjectSlug(slug));
    }
  }

  const readinessCards = enrolledSubjects.map((slug) => {
    const meta = getSubjectMeta(slug);
    return {
      slug,
      name: meta.label,
      badgeLabel: meta.shortLabel,
      score: readinessScores[slug],
      badgeBg: meta.bgColor,
      badgeText: meta.color,
    };
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <DashboardCard>
          <h2 className="text-base font-semibold text-foreground">
            Daily goal
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Answer {DAILY_GOAL_QUESTIONS} questions today
          </p>
          <div className="mt-4">
            <Progress value={DAILY_GOAL_PROGRESS} className="flex-col gap-2">
              <div className="flex w-full items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {DAILY_GOAL_PROGRESS}%
                </span>
              </div>
              <ProgressTrack className="h-3">
                <ProgressIndicator />
              </ProgressTrack>
            </Progress>
          </div>
          <Button
            className="mt-5 w-full rounded-full sm:w-auto"
            render={<Link href="/dashboard/study" />}
          >
            Start Studying
          </Button>
        </DashboardCard>

        <DashboardCard>
          <h2 className="text-base font-semibold text-foreground">
            Today&apos;s Challenges
          </h2>
          <ul className="mt-4 divide-y divide-border">
            {CHALLENGES.map((challenge) => (
              <li
                key={challenge.id}
                className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <input
                  type="checkbox"
                  checked={false}
                  readOnly
                  aria-label={`${challenge.description} (not completed)`}
                  className="mt-0.5 size-4 shrink-0 rounded border-border text-primary accent-primary"
                />
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 gap-y-1">
                  <span className="text-sm text-foreground">
                    {challenge.description}
                  </span>
                  <ShardBadge amount={challenge.shards} />
                </div>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>

      <div className="flex flex-col gap-6 lg:col-span-1">
        <DashboardCard className="flex flex-col items-center text-center">
          <Flame
            className={cn(
              "size-10",
              streak > 0 ? "text-[#C9A84C]" : "text-muted-foreground/50"
            )}
            strokeWidth={1.75}
            aria-hidden
          />
          <p className="mt-3 text-5xl font-semibold tabular-nums tracking-tight text-foreground">
            {streak}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Day streak</p>
        </DashboardCard>

        <div className="space-y-3">
          <h2 className="px-0.5 text-sm font-medium text-muted-foreground">
            Readiness
          </h2>
          {readinessCards.length === 0 ? (
            <DashboardCard>
              <p className="text-sm text-muted-foreground">
                Enroll in a subject on your{" "}
                <Link href="/dashboard/profile" className="text-primary underline">
                  profile
                </Link>{" "}
                to track readiness.
              </p>
            </DashboardCard>
          ) : (
            readinessCards.map((subject) => (
              <DashboardCard key={subject.slug} className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="rounded-full px-3 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: subject.badgeBg,
                      color: subject.badgeText,
                    }}
                  >
                    {subject.badgeLabel}
                  </span>
                  <span className="sr-only">{subject.name}</span>
                </div>
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                  {subject.score}
                </p>
                <Progress value={subject.score} className="gap-0">
                  <ProgressTrack className="h-2">
                    <ProgressIndicator />
                  </ProgressTrack>
                </Progress>
              </DashboardCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
