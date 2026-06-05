// Client context: shard balance and refresh from profile API.

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ApiResponse, ProfileData } from "@/lib/api/types";

interface UserStatsContextValue {
  shards: number;
  setShards: (shards: number) => void;
  refreshUserStats: () => Promise<void>;
}

const UserStatsContext = createContext<UserStatsContextValue | null>(null);

interface UserStatsProviderProps {
  initialShards: number;
  children: ReactNode;
}

/**
 * Provides shard balance to dashboard shell; refreshes from /api/profile.
 */
export function UserStatsProvider({
  initialShards,
  children,
}: UserStatsProviderProps) {
  const [shards, setShards] = useState(initialShards);

  const refreshUserStats = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) return;
      const json = (await res.json()) as ApiResponse<ProfileData>;
      if (json.success && typeof json.data.user.shards === "number") {
        setShards(json.data.user.shards);
      }
    } catch {
      // ignore network errors for background refresh
    }
  }, []);

  const value = useMemo(
    () => ({ shards, setShards, refreshUserStats }),
    [shards, refreshUserStats]
  );

  return (
    <UserStatsContext.Provider value={value}>
      {children}
    </UserStatsContext.Provider>
  );
}

/**
 * Returns shard balance and refresh helpers from UserStatsProvider.
 */
export function useUserStats(): UserStatsContextValue {
  const ctx = useContext(UserStatsContext);
  if (!ctx) {
    throw new Error("useUserStats must be used within UserStatsProvider");
  }
  return ctx;
}
