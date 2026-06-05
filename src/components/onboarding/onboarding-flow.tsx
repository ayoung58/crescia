// Multi-step onboarding flow: name, subjects, and confirmation.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { completeOnboardingAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import { SUBJECT_DESCRIPTIONS, SUBJECT_ICONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  USERNAME_MAX,
  USERNAME_MIN,
  validateUsernameFormat,
} from "@/lib/onboarding/username";
import {
  getSubjectMeta,
  SUBJECTS,
  type SubjectSlug,
} from "@/types";

const STEP_COUNT = 3;

interface OnboardingFlowProps {
  clerkFirstName: string;
  clerkLastName: string;
}

/**
 * Three-step onboarding wizard for new users after sign-up.
 */
export function OnboardingFlow({
  clerkFirstName,
  clerkLastName,
}: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [firstName, setFirstName] = useState(clerkFirstName);
  const [lastName, setLastName] = useState(clerkLastName);
  const [username, setUsername] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectSlug[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { status: usernameStatus } = useUsernameAvailability({
    username,
    shouldCheck: username.trim().length > 0,
  });

  const formatValidation = validateUsernameFormat(username);
  const usernameFormatValid = formatValidation.valid && username.length > 0;
  const canContinueStep1 =
    usernameFormatValid &&
    (usernameStatus === "available" || usernameStatus === "error");

  const canContinueStep2 = selectedSubjects.length >= 1;

  const displayName = firstName.trim() || username.trim() || "there";

  const goToStep = (next: number): void => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const toggleSubject = (slug: SubjectSlug): void => {
    setSelectedSubjects((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug]
    );
  };

  const handleComplete = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const result = await completeOnboardingAction({
        firstName,
        lastName,
        username: username.trim(),
        subjects: selectedSubjects,
      });

      if (!result.success) {
        toast.error(result.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -20 : 20,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-1 flex-col">
      <div
        className="mb-8 flex justify-center gap-2"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={STEP_COUNT}
      >
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 w-2 rounded-full transition-colors duration-300",
              i + 1 <= step ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {step === 1 && (
          <motion.div
            key="step-1"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="flex flex-1 flex-col"
          >
            <h1 className="mb-6 text-2xl font-semibold tracking-tight">
              What should we call you?
            </h1>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    maxLength={USERNAME_MAX}
                    aria-invalid={
                      usernameStatus === "taken" || !formatValidation.valid
                    }
                    className={cn(
                      usernameStatus === "taken" &&
                        "border-incorrect ring-3 ring-incorrect/20"
                    )}
                  />
                  {usernameStatus === "checking" && (
                    <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                  {usernameStatus === "available" && usernameFormatValid && (
                    <Check className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
                  )}
                </div>
                {!formatValidation.valid && username.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatValidation.message ??
                      `Use ${USERNAME_MIN}–${USERNAME_MAX} characters: letters, numbers, and underscores only.`}
                  </p>
                )}
                {username.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {USERNAME_MIN}–{USERNAME_MAX} characters: letters, numbers,
                    and underscores only.
                  </p>
                )}
                {usernameStatus === "taken" && (
                  <p className="text-xs text-incorrect">Username is taken</p>
                )}
              </div>
            </div>

            <div className="mt-auto space-y-3 pt-8">
              <Button
                className="w-full transition-opacity duration-200"
                disabled={!canContinueStep1}
                onClick={() => goToStep(2)}
              >
                Continue
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                You can change these later in your profile.
              </p>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="flex flex-1 flex-col"
          >
            <h1 className="text-2xl font-semibold tracking-tight">
              What are you studying for?
            </h1>
            <p className="mb-6 mt-2 text-sm text-muted-foreground">
              Select at least one. You can add more later.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SUBJECTS.map((subject) => {
                const Icon = SUBJECT_ICONS[subject.slug];
                const selected = selectedSubjects.includes(subject.slug);

                return (
                  <motion.button
                    key={subject.slug}
                    type="button"
                    onClick={() => toggleSubject(subject.slug)}
                    animate={{ scale: selected ? 1.02 : 1 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={cn(
                      "rounded-2xl p-4 text-left transition-colors",
                      selected
                        ? "border-2 border-primary bg-primary/5"
                        : "border border-border bg-background"
                    )}
                  >
                    <Icon
                      className={cn(
                        "mb-3 size-6",
                        selected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <p className="font-medium">{subject.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {SUBJECT_DESCRIPTIONS[subject.slug]}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-auto pt-8">
              <Button
                className="w-full transition-opacity duration-200"
                disabled={!canContinueStep2}
                onClick={() => goToStep(3)}
              >
                {selectedSubjects.length === 1
                  ? "Continue with 1 subject"
                  : `Continue with ${selectedSubjects.length} subjects`}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="flex flex-1 flex-col"
          >
            <h1 className="text-2xl font-semibold tracking-tight">
              You&apos;re all set, {displayName}!
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono">
                @{username.trim()}
              </Badge>
              {selectedSubjects.map((slug) => {
                const meta = getSubjectMeta(slug);
                return (
                  <span
                    key={slug}
                    className="inline-flex h-5 items-center rounded-3xl px-2 text-xs font-medium"
                    style={{
                      backgroundColor: meta.bgColor,
                      color: meta.color,
                    }}
                  >
                    {meta.shortLabel}
                  </span>
                );
              })}
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Your garden is planted. Your readiness starts at zero. Let&apos;s
              change that.
            </p>

            <div className="mt-auto pt-8">
              <Button
                className="w-full"
                size="lg"
                disabled={isSubmitting}
                onClick={() => void handleComplete()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Start Growing →"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
