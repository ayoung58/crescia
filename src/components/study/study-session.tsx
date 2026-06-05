// Client component: study session configuration and active session placeholder.

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardList,
  Construction,
  ListChecks,
  Square,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SessionTypeCard } from "@/components/study/session-type-card";
import {
  modeLabel,
  timingSummary,
} from "@/components/study/study-session-utils";
import { useStopwatch } from "@/hooks/useStopwatch";
import type { ApiResponse, SessionStartData } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { isSessionMode } from "@/lib/validators/session-mode";
import { isSubjectSlug } from "@/lib/validators/subject-slug";
import {
  getSubjectMeta,
  SUBJECTS,
  type SessionConfig,
  type SessionMode,
  type SubjectMeta,
  type SubjectSlug,
} from "@/types";

interface StudySessionProps {
  enrolledSlugs: SubjectSlug[];
}

/**
 * Renders study session setup and the active session shell (questions TBD).
 */
export function StudySession({ enrolledSlugs }: StudySessionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const enrolledSubjects = useMemo(
    () => SUBJECTS.filter((s) => enrolledSlugs.includes(s.slug)),
    [enrolledSlugs]
  );

  const [subject, setSubject] = useState<SubjectSlug | null>(null);
  const [mode, setMode] = useState<SessionMode | null>(null);
  const [timed, setTimed] = useState(false);
  const [stopwatch, setStopwatch] = useState(false);
  const [view, setView] = useState<"config" | "active">("config");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeConfig, setActiveConfig] = useState<SessionConfig | null>(null);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const configHydrated = useRef(false);

  const stopwatchEnabled =
    view === "active" &&
    activeConfig?.mode === "practice_questions" &&
    activeConfig.stopwatch;

  const { formattedTime } = useStopwatch(Boolean(stopwatchEnabled));

  const syncConfigToUrl = useCallback(
    (config: {
      subject: SubjectSlug | null;
      mode: SessionMode | null;
      timed: boolean;
      stopwatch: boolean;
    }) => {
      const params = new URLSearchParams();
      if (config.subject) params.set("subject", config.subject);
      if (config.mode) params.set("mode", config.mode);
      if (config.timed) params.set("timed", "true");
      if (config.stopwatch) params.set("stopwatch", "true");
      const query = params.toString();
      router.replace(query ? `/dashboard/study?${query}` : "/dashboard/study", {
        scroll: false,
      });
    },
    [router]
  );

  useEffect(() => {
    if (configHydrated.current || enrolledSubjects.length === 0) return;
    configHydrated.current = true;

    const paramSubject = searchParams.get("subject");
    const paramMode = searchParams.get("mode");

    let validSubject: SubjectSlug | null = null;
    if (
      paramSubject &&
      isSubjectSlug(paramSubject) &&
      enrolledSlugs.includes(paramSubject)
    ) {
      validSubject = paramSubject;
    } else if (enrolledSubjects.length === 1) {
      validSubject = enrolledSubjects[0].slug;
    }

    let validMode: SessionMode | null = null;
    if (paramMode && isSessionMode(paramMode)) {
      validMode = paramMode;
    }

    setSubject(validSubject);
    setMode(validMode);
    setTimed(searchParams.get("timed") === "true");
    setStopwatch(searchParams.get("stopwatch") === "true");
  }, [searchParams, enrolledSubjects, enrolledSlugs]);

  useEffect(() => {
    if (view !== "config") return;
    syncConfigToUrl({ subject, mode, timed, stopwatch });
  }, [subject, mode, timed, stopwatch, view, syncConfigToUrl]);

  const canStart = Boolean(subject && mode);
  const singleSubject = enrolledSubjects.length === 1;

  const handleSubjectChange = (slug: SubjectSlug): void => {
    if (singleSubject) return;
    setSubject(slug);
  };

  const handleModeChange = (nextMode: SessionMode): void => {
    setMode(nextMode);
    if (nextMode === "practice_exam") {
      setStopwatch(false);
    } else {
      setTimed(false);
    }
  };

  const handleStart = async (): Promise<void> => {
    if (!subject || !mode) return;

    setIsStarting(true);
    try {
      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, mode, timed, stopwatch }),
      });
      const json = (await res.json()) as ApiResponse<SessionStartData>;

      if (!json.success) {
        toast.error(json.error ?? "Could not start session.");
        return;
      }

      const config: SessionConfig = { subject, mode, timed, stopwatch };
      setActiveConfig(config);
      setActiveSessionId(json.data.sessionId);
      setView("active");
    } catch {
      toast.error("Could not start session.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndSession = async (): Promise<void> => {
    if (!activeSessionId || !activeConfig) return;

    setIsEnding(true);
    try {
      const res = await fetch("/api/sessions/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId }),
      });
      const json = (await res.json()) as ApiResponse<null>;

      if (!json.success) {
        toast.error(json.error ?? "Could not end session.");
        return;
      }

      setView("config");
      setActiveSessionId(null);
      setActiveConfig(null);
      setEndDialogOpen(false);
      setSubject(activeConfig.subject);
      setMode(activeConfig.mode);
      setTimed(activeConfig.timed);
      setStopwatch(activeConfig.stopwatch);

      const params = new URLSearchParams();
      params.set("subject", activeConfig.subject);
      params.set("mode", activeConfig.mode);
      if (activeConfig.timed) params.set("timed", "true");
      if (activeConfig.stopwatch) params.set("stopwatch", "true");
      router.push(`/dashboard/study?${params.toString()}`);
    } catch {
      toast.error("Could not end session.");
    } finally {
      setIsEnding(false);
    }
  };

  const activeSubjectMeta: SubjectMeta | null = activeConfig
    ? getSubjectMeta(activeConfig.subject)
    : null;

  return (
    <div className="mx-auto w-full max-w-2xl py-8">
      <AnimatePresence mode="wait">
        {view === "config" ? (
          <motion.div
            key="config"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <header>
              <h1 className="text-2xl font-semibold tracking-tight">
                Study Session
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Configure your session below.
              </p>
            </header>

            {enrolledSubjects.length === 0 ? (
              <Card className="border-amber-200/80 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
                <CardContent className="pt-6 text-sm">
                  <p>
                    You haven&apos;t selected any subjects. Go to{" "}
                    <Link
                      href="/dashboard/profile"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Profile
                    </Link>{" "}
                    to add subjects.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <section className="space-y-3">
                  <Label>Subject</Label>
                  <div
                    className={cn(
                      "flex flex-wrap gap-2",
                      singleSubject && "pointer-events-none opacity-90"
                    )}
                    role="radiogroup"
                    aria-label="Subject"
                  >
                    {enrolledSubjects.map((s) => {
                      const selected = subject === s.slug;
                      return (
                        <button
                          key={s.slug}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => handleSubjectChange(s.slug)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                            selected
                              ? "border-2 border-primary bg-primary/5"
                              : "border-border bg-background hover:bg-muted/50"
                          )}
                        >
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: s.color }}
                            aria-hidden
                          />
                          {s.shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-3">
                  <Label>Session Type</Label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <SessionTypeCard
                      title="Practice Questions"
                      description="Answer questions one by one with instant feedback after each."
                      icon={ListChecks}
                      selected={mode === "practice_questions"}
                      onSelect={() => handleModeChange("practice_questions")}
                    />
                    <SessionTypeCard
                      title="Practice Exam"
                      description="Simulate exam conditions. Feedback shown at the end."
                      icon={ClipboardList}
                      selected={mode === "practice_exam"}
                      onSelect={() => handleModeChange("practice_exam")}
                    />
                  </div>
                </section>

                <AnimatePresence initial={false}>
                  {mode && (
                    <motion.section
                      key={mode}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 rounded-2xl border border-border bg-background p-4">
                        {mode === "practice_exam" ? (
                          <>
                            <div className="flex items-center justify-between gap-4">
                              <Label htmlFor="timed-exam" className="cursor-pointer">
                                Timed Exam
                              </Label>
                              <Switch
                                id="timed-exam"
                                checked={timed}
                                onCheckedChange={setTimed}
                              />
                            </div>
                            <AnimatePresence initial={false}>
                              {timed && (
                                <motion.p
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden text-xs text-muted-foreground"
                                >
                                  You&apos;ll have standard AP exam time limits.
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <Label
                                htmlFor="question-stopwatch"
                                className="cursor-pointer"
                              >
                                Question Stopwatch
                              </Label>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Tracks how long each question takes. Shown as a
                                small timer.
                              </p>
                            </div>
                            <Switch
                              id="question-stopwatch"
                              checked={stopwatch}
                              onCheckedChange={setStopwatch}
                            />
                          </div>
                        )}
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>

                <Button
                  className="w-full rounded-full"
                  size="lg"
                  disabled={!canStart || isStarting}
                  onClick={() => void handleStart()}
                >
                  {isStarting ? "Starting…" : "Start Session →"}
                </Button>
              </>
            )}
          </motion.div>
        ) : (
          activeConfig &&
          activeSubjectMeta && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: activeSubjectMeta.bgColor,
                      color: activeSubjectMeta.color,
                    }}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: activeSubjectMeta.color }}
                      aria-hidden
                    />
                    {activeSubjectMeta.shortLabel}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {modeLabel(activeConfig.mode)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {stopwatchEnabled && (
                    <span
                      className="font-mono text-sm tabular-nums text-muted-foreground"
                      aria-live="polite"
                    >
                      {formattedTime}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEndDialogOpen(true)}
                  >
                    <Square className="size-3.5" data-icon="inline-start" />
                    End Session
                  </Button>
                </div>
              </div>

              <Card className="border-dashed shadow-none">
                <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                  <Construction className="size-10 text-muted-foreground" />
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">
                      Questions loading soon
                    </h2>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      AI-powered questions are coming in the next phase. Your
                      session is active and being tracked.
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Subject: {activeSubjectMeta.label} · Mode:{" "}
                    {modeLabel(activeConfig.mode)} ·{" "}
                    {timingSummary(activeConfig)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        )}
      </AnimatePresence>

      <AlertDialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this session?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isEnding}>
              Keep Studying
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isEnding}
              onClick={() => void handleEndSession()}
            >
              {isEnding ? "Ending…" : "End Session"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
