import Link from "next/link";
import { Coins, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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

const READINESS_SUBJECTS = [
  {
    name: "AP Statistics",
    badgeLabel: "Stats",
    score: 0,
    badgeBg: "#E8F0EC",
    badgeText: "#3D6B4F",
  },
  {
    name: "AP Biology",
    badgeLabel: "Bio",
    score: 0,
    badgeBg: "#E8F2E8",
    badgeText: "#2E6B3E",
  },
  {
    name: "AP Calculus",
    badgeLabel: "Calc",
    score: 0,
    badgeBg: "#EAE8F0",
    badgeText: "#4A3D8F",
  },
] as const;

const STREAK = 0;

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

export default function DashboardPage() {
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
                <ProgressValue className="ml-0 text-sm font-medium text-foreground">
                  {DAILY_GOAL_PROGRESS}%
                </ProgressValue>
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
              STREAK > 0 ? "text-[#C9A84C]" : "text-muted-foreground/50"
            )}
            strokeWidth={1.75}
            aria-hidden
          />
          <p className="mt-3 text-5xl font-semibold tabular-nums tracking-tight text-foreground">
            {STREAK}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Day streak</p>
        </DashboardCard>

        <div className="space-y-3">
          <h2 className="px-0.5 text-sm font-medium text-muted-foreground">
            Readiness
          </h2>
          {READINESS_SUBJECTS.map((subject) => (
            <DashboardCard key={subject.name} className="space-y-3">
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
          ))}
        </div>
      </div>
    </div>
  );
}
