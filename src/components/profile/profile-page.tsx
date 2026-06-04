"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  BarChart2,
  Check,
  Coins,
  FunctionSquare,
  Infinity,
  Leaf,
  Loader2,
  Lock,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUserStats } from "@/contexts/user-stats-context";
import { formatWithCommas } from "@/lib/format";
import {
  USERNAME_MAX,
  USERNAME_MIN,
  validateUsernameFormat,
} from "@/lib/onboarding/username";
import { cn } from "@/lib/utils";
import {
  SUBJECTS,
  type DbUser,
  type SubjectSlug,
} from "@/types";

const SUBJECT_DESCRIPTIONS: Record<SubjectSlug, string> = {
  "ap-stats": "Probability, inference, and data analysis",
  "ap-bio": "Cells, genetics, evolution, and ecology",
  "ap-calc-ab": "Limits, derivatives, and integrals",
  "ap-calc-bc": "Calc AB plus series and parametric equations",
};

const SUBJECT_ICONS: Record<
  SubjectSlug,
  React.ComponentType<{ className?: string }>
> = {
  "ap-stats": BarChart2,
  "ap-bio": Leaf,
  "ap-calc-ab": FunctionSquare,
  "ap-calc-bc": Infinity,
};

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";

interface ProfileSnapshot {
  firstName: string;
  lastName: string;
  username: string;
  emailNotifications: boolean;
}

function subjectsEqual(a: SubjectSlug[], b: SubjectSlug[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((slug, i) => slug === sortedB[i]);
}

function formatMemberSince(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ProfilePage() {
  const router = useRouter();
  const { openUserProfile } = useClerk();
  const { refreshUserStats, setShards } = useUserStats();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<DbUser | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savedProfile, setSavedProfile] = useState<ProfileSnapshot | null>(
    null
  );
  const [savedUsername, setSavedUsername] = useState("");

  const [selectedSubjects, setSelectedSubjects] = useState<SubjectSlug[]>([]);
  const [savedSubjects, setSavedSubjects] = useState<SubjectSlug[]>([]);

  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSubjects, setSavingSubjects] = useState(false);

  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        toast.error("Could not load your profile.");
        return;
      }
      const data = (await res.json()) as {
        user: DbUser;
        subjects: SubjectSlug[];
      };
      setUser(data.user);
      setShards(data.user.shards);
      setFirstName(data.user.first_name ?? "");
      setLastName(data.user.last_name ?? "");
      setUsername(data.user.username ?? "");
      setSavedUsername(data.user.username ?? "");
      setEmailNotifications(data.user.email_notifications);
      setSavedProfile({
        firstName: data.user.first_name ?? "",
        lastName: data.user.last_name ?? "",
        username: data.user.username ?? "",
        emailNotifications: data.user.email_notifications,
      });
      setSelectedSubjects(data.subjects);
      setSavedSubjects(data.subjects);
      setUsernameStatus("idle");
    } catch {
      toast.error("Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }, [setShards]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const profileDirty = useMemo(() => {
    if (!savedProfile) return false;
    return (
      firstName !== savedProfile.firstName ||
      lastName !== savedProfile.lastName ||
      username !== savedProfile.username ||
      emailNotifications !== savedProfile.emailNotifications
    );
  }, [savedProfile, firstName, lastName, username, emailNotifications]);

  const subjectsDirty = useMemo(
    () => !subjectsEqual(selectedSubjects, savedSubjects),
    [selectedSubjects, savedSubjects]
  );

  const hasUnsavedChanges = profileDirty || subjectsDirty;

  const usernameChanged = username.trim() !== savedUsername.trim();
  const formatValidation = validateUsernameFormat(username);
  const usernameFormatValid = formatValidation.valid && username.length > 0;

  const checkUsername = useCallback(async (value: string) => {
    const trimmed = value.trim();
    const format = validateUsernameFormat(trimmed);
    if (!format.valid) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");

    try {
      const res = await fetch(
        `/api/onboarding/check-username?username=${encodeURIComponent(trimmed)}`
      );
      if (!res.ok) {
        setUsernameStatus("error");
        return;
      }
      const data = (await res.json()) as {
        available: boolean;
        valid: boolean;
      };
      if (!data.valid) {
        setUsernameStatus("idle");
        return;
      }
      setUsernameStatus(data.available ? "available" : "taken");
    } catch {
      setUsernameStatus("error");
    }
  }, []);

  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameStatus("idle");
      return;
    }

    if (!usernameChanged) {
      setUsernameStatus("idle");
      return;
    }

    if (!validateUsernameFormat(trimmed).valid) {
      setUsernameStatus("idle");
      return;
    }

    const timer = setTimeout(() => {
      void checkUsername(trimmed);
    }, 400);

    return () => clearTimeout(timer);
  }, [username, usernameChanged, checkUsername]);

  const canSaveProfile =
    profileDirty &&
    usernameFormatValid &&
    (!usernameChanged ||
      usernameStatus === "available" ||
      usernameStatus === "error");

  const toggleSubject = (slug: SubjectSlug) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(slug)) {
        if (prev.length === 1) return prev;
        return prev.filter((s) => s !== slug);
      }
      return [...prev, slug];
    });
  };

  const handleSaveProfile = async () => {
    if (!canSaveProfile) return;
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          username: username.trim(),
          emailNotifications,
        }),
      });
      const data = (await res.json()) as { success: boolean; error?: string };
      if (!data.success) {
        toast.error(data.error ?? "Failed to update profile.");
        return;
      }
      const snapshot: ProfileSnapshot = {
        firstName,
        lastName,
        username: username.trim(),
        emailNotifications,
      };
      setSavedProfile(snapshot);
      setSavedUsername(username.trim());
      setUser((prev) =>
        prev
          ? {
              ...prev,
              first_name: firstName || null,
              last_name: lastName || null,
              username: username.trim(),
              email_notifications: emailNotifications,
            }
          : prev
      );
      toast.success("Profile updated.");
      void refreshUserStats();
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSubjects = async () => {
    if (!subjectsDirty) return;
    setSavingSubjects(true);
    try {
      const res = await fetch("/api/profile/subjects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjects: selectedSubjects }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        toast.error(data.error ?? "Failed to update subjects.");
        return;
      }
      setSavedSubjects([...selectedSubjects]);
      toast.success("Subjects updated.");
      router.refresh();
    } catch {
      toast.error("Failed to update subjects.");
    } finally {
      setSavingSubjects(false);
    }
  };

  const confirmLeave = useCallback(() => {
    setLeaveDialogOpen(false);
    if (pendingHref) {
      const href = pendingHref;
      setPendingHref(null);
      router.push(href);
    }
  }, [pendingHref, router]);

  const cancelLeave = useCallback(() => {
    setLeaveDialogOpen(false);
    setPendingHref(null);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const hasUnsavedRef = useRef(hasUnsavedChanges);
  hasUnsavedRef.current = hasUnsavedChanges;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!hasUnsavedRef.current) return;
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(url.pathname + url.search + url.hash);
      setLeaveDialogOpen(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl animate-pulse space-y-8">
        <div className="h-8 w-32 rounded-lg bg-muted" />
        <div className="h-48 rounded-4xl bg-muted" />
        <div className="h-64 rounded-4xl bg-muted" />
      </div>
    );
  }

  if (!user || !savedProfile) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-muted-foreground">
          Could not load your profile.{" "}
          <button
            type="button"
            className="text-primary underline"
            onClick={() => void loadProfile()}
          >
            Try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-first-name">First Name</Label>
                <Input
                  id="profile-first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-last-name">Last Name</Label>
                <Input
                  id="profile-last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-username">Username</Label>
              <div className="relative">
                <Input
                  id="profile-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={USERNAME_MAX}
                  aria-invalid={
                    usernameStatus === "taken" || !formatValidation.valid
                  }
                  className={cn(
                    usernameStatus === "taken" &&
                      "border-incorrect ring-3 ring-incorrect/20"
                  )}
                />
                {usernameChanged && usernameStatus === "checking" && (
                  <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
                {usernameChanged &&
                  usernameStatus === "available" &&
                  usernameFormatValid && (
                    <Check className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
                  )}
              </div>
              {!formatValidation.valid && username.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formatValidation.message ??
                    `Use ${USERNAME_MIN}–${USERNAME_MAX} characters: letters, numbers, and underscores only.`}
                </p>
              )}
              {usernameStatus === "taken" && usernameChanged && (
                <p className="text-xs text-incorrect">Username is taken</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <p className="text-sm text-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                Email is managed through your account settings.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive streak reminders by email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                disabled={!canSaveProfile || savingProfile}
                onClick={() => void handleSaveProfile()}
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Subjects</CardTitle>
            <CardDescription>
              You must be enrolled in at least one subject.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SUBJECTS.map((subject) => {
                const Icon = SUBJECT_ICONS[subject.slug];
                const selected = selectedSubjects.includes(subject.slug);
                const locked = selected && selectedSubjects.length === 1;

                return (
                  <motion.button
                    key={subject.slug}
                    type="button"
                    onClick={() => toggleSubject(subject.slug)}
                    disabled={locked}
                    animate={{ scale: selected ? 1.02 : 1 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    title={
                      locked
                        ? "You must keep at least one subject"
                        : undefined
                    }
                    className={cn(
                      "relative rounded-2xl p-4 text-left transition-colors",
                      selected
                        ? "border-2 border-primary bg-primary/5"
                        : "border border-border bg-background",
                      locked && "cursor-not-allowed"
                    )}
                  >
                    {locked && (
                      <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-border">
                        <Lock
                          className="size-3.5 text-muted-foreground"
                          aria-hidden
                        />
                        <span className="sr-only">
                          You must keep at least one subject
                        </span>
                      </span>
                    )}
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

            <div className="flex justify-end">
              <Button
                disabled={!subjectsDirty || savingSubjects}
                onClick={() => void handleSaveSubjects()}
              >
                {savingSubjects ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Subjects"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {user.plan === "student" ? (
                <Badge className="bg-primary text-primary-foreground">
                  Student Plan
                </Badge>
              ) : (
                <>
                  <Badge variant="secondary">Free Plan</Badge>
                  <Button
                    size="sm"
                    className="h-7 rounded-full px-3 text-xs"
                    render={<Link href="/dashboard" />}
                  >
                    Upgrade to Student →
                  </Button>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Member since {formatMemberSince(user.created_at)}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openUserProfile()}
            >
              Manage Account
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Total XP</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {formatWithCommas(user.xp)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Current Level</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {user.level}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Current Streak</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {user.streak_count}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    days
                  </span>
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Shards Balance</p>
                <p className="mt-1 flex items-center gap-1.5 text-xl font-semibold tabular-nums">
                  <Coins
                    className="size-4 text-[#C9A84C]"
                    aria-hidden
                  />
                  {formatWithCommas(user.shards)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Leave without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelLeave}>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave}>
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
