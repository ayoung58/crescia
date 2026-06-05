// Application-wide TypeScript types, database row shapes, and subject metadata.

export type SubjectSlug =
  | "ap-stats"
  | "ap-bio"
  | "ap-calc-ab"
  | "ap-calc-bc";

export type SessionMode = "practice_questions" | "practice_exam";

export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType = "mcq" | "frq";

export type UserPlan = "free" | "student";

export type GrowthStage = 0 | 1 | 2 | 3 | 4;

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export type SessionStatus = "active" | "completed" | "abandoned";

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing";

export type ReadinessScores = Record<SubjectSlug, number>;

// =============================================================================
// Database row types (mirror public.* Supabase tables — snake_case columns)
// =============================================================================

export interface DbUser {
  id: string;
  clerk_user_id: string;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  onboarding_complete: boolean;
  plan: UserPlan;
  xp: number;
  level: number;
  shards: number;
  streak_count: number;
  streak_last_date: string | null;
  grace_used_this_week: boolean;
  hint_tokens_remaining: number;
  hint_tokens_reset_date: string | null;
  question_count_today: number;
  question_count_reset_date: string | null;
  email_notifications: boolean;
  readiness_scores: ReadinessScores;
  created_at: string;
  updated_at: string;
}

export interface DbUserSubject {
  id: string;
  user_id: string;
  subject_slug: SubjectSlug;
  enrolled_at: string;
}

export interface DbSession {
  id: string;
  user_id: string;
  subject_slug: string;
  mode: SessionMode;
  timed: boolean;
  started_at: string;
  ended_at: string | null;
  question_count: number;
  correct_count: number;
  xp_earned: number;
  shards_earned: number;
  status: SessionStatus;
}

export interface DbAnswer {
  id: string;
  session_id: string;
  user_id: string;
  question_id: string | null;
  subject_slug: string;
  topic_tag: string | null;
  question_type: QuestionType | null;
  is_correct: boolean | null;
  selected_answer: string | null;
  time_spent_seconds: number | null;
  submitted_at: string;
}

export interface DbTopicStat {
  id: string;
  user_id: string;
  subject_slug: string;
  topic_tag: string;
  attempts: number;
  correct: number;
  last_attempted_at: string | null;
}

export interface DbQuestionsCache {
  id: string;
  subject_slug: string;
  topic_tag: string;
  difficulty: Difficulty | null;
  question_type: QuestionType | null;
  question_json: unknown;
  used_count: number;
  created_at: string;
}

export interface DbAchievement {
  id: string;
  user_id: string;
  achievement_key: string;
  unlocked_at: string;
}

export interface DbDailyChallenge {
  id: string;
  user_id: string;
  date: string;
  challenges: unknown;
  completed_indices: number[];
  shards_rewarded: boolean;
}

export interface DbGardenPlot {
  id: string;
  user_id: string;
  plot_index: number;
  plant_catalog_id: string | null;
  growth_stage: GrowthStage;
  last_watered: string | null;
  is_dormant: boolean;
  planted_at: string | null;
}

export interface DbPlantCatalog {
  id: string;
  name: string;
  species: string | null;
  rarity: Rarity | null;
  shard_cost: number;
  subject_affinity: string | null;
  description: string | null;
  created_at: string;
}

export interface DbGardenItems {
  id: string;
  user_id: string;
  fertilizer_count: number;
  revival_potion_count: number;
  updated_at: string;
}

export interface DbSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  price_id: string | null;
  status: SubscriptionStatus | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Subject metadata
// =============================================================================

export interface SubjectMeta {
  slug: SubjectSlug;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const SUBJECT_SLUGS = [
  "ap-stats",
  "ap-bio",
  "ap-calc-ab",
  "ap-calc-bc",
] as const satisfies readonly SubjectSlug[];

export const SUBJECTS = [
  {
    slug: "ap-stats",
    label: "AP Statistics",
    shortLabel: "Stats",
    color: "#3D6B4F",
    bgColor: "#E8F0EC",
    icon: "bar-chart-2",
  },
  {
    slug: "ap-bio",
    label: "AP Biology",
    shortLabel: "Biology",
    color: "#2E6B3E",
    bgColor: "#E8F2E8",
    icon: "leaf",
  },
  {
    slug: "ap-calc-ab",
    label: "AP Calculus AB",
    shortLabel: "Calc AB",
    color: "#4A3D8F",
    bgColor: "#EAE8F0",
    icon: "function-square",
  },
  {
    slug: "ap-calc-bc",
    label: "AP Calculus BC",
    shortLabel: "Calc BC",
    color: "#6B3D8F",
    bgColor: "#F0E8F0",
    icon: "sigma",
  },
] as const satisfies readonly SubjectMeta[];

/**
 * Returns metadata for a subject slug; throws if slug is unknown.
 */
export function getSubjectMeta(slug: SubjectSlug): SubjectMeta {
  const meta = SUBJECTS.find((s) => s.slug === slug);
  if (!meta) {
    throw new Error(`Unknown subject slug: ${slug}`);
  }
  return meta;
}

// =============================================================================
// Session & questions (UI shapes)
// =============================================================================

export interface SessionConfig {
  subject: SubjectSlug;
  mode: SessionMode;
  timed: boolean;
  /** Only applies when mode === "practice_questions" */
  stopwatch: boolean;
}

export interface Question {
  id: string;
  subject: SubjectSlug;
  topicTag: string;
  difficulty: Difficulty;
  type: QuestionType;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface RubricPoint {
  pointDescription: string;
  earned: boolean;
  explanation: string;
}

export interface FRQResult {
  score: number;
  maxScore: number;
  scorePercent: number;
  feedback: string[];
  rubricPoints: RubricPoint[];
  overallComment: string;
}

// =============================================================================
// Joined / enriched shapes
// =============================================================================

export type UserProfile = DbUser & {
  subjects: SubjectSlug[];
};

export type TopicStatWithMeta = DbTopicStat & {
  accuracy: number;
  label: string;
};

export interface AchievementMeta {
  key: string;
  name: string;
  description: string;
  icon: string;
}
