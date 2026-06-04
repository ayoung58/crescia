"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface UserStatsContextValue {
  shards: number;
  setShards: (shards: number) => void;
  refreshUserStats: () => Promise<void>;
}

const UserStatsContext = createContext<UserStatsContextValue | null>(null);

export function UserStatsProvider({
  initialShards,
  children,
}: {
  initialShards: number;
  children: ReactNode;
}) {
  const [shards, setShards] = useState(initialShards);

  const refreshUserStats = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) return;
      const data = (await res.json()) as { user?: { shards?: number } };
      if (typeof data.user?.shards === "number") {
        setShards(data.user.shards);
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

export function useUserStats() {
  const ctx = useContext(UserStatsContext);
  if (!ctx) {
    throw new Error("useUserStats must be used within UserStatsProvider");
  }
  return ctx;
}
