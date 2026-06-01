// User type
export type UserPlan = "free" | "student";

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  xp: number;
  level: number;
  streak: number;
  grace_days_used: number;
  last_session_date: string | null;
  plan: UserPlan;
  readiness_score_ap_stats: number | null;
  readiness_score_ap_bio: number | null;
  readiness_score_ap_calc: number | null;
}

// Session type
export type Subject = "ap-stats" | "ap-bio" | "ap-calc";
export type SessionMode = "timed" | "untimed";

export interface Session {
  id: string;
  user_id: string;
  subject: Subject;
  mode: SessionMode;
  score: number;
  total_questions: number;
  completed_at: string;
  created_at: string;
  duration_seconds: number;
}

// Answer type
export interface Answer {
  id: string;
  session_id: string;
  question_id: string;
  user_id: string;
  is_correct: boolean;
  time_spent_seconds: number;
  topic_tag: string;
  user_answer: string;
  created_at: string;
}

// TopicStat type
export interface TopicStat {
  id: string;
  user_id: string;
  subject: Subject;
  topic_tag: string;
  attempts: number;
  correct: number;
  accuracy: number; // computed: correct / attempts
  last_updated: string;
}

// Question type
export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "mcq" | "frq";

export interface Question {
  id: string;
  subject: Subject;
  topic_tag: string;
  difficulty: Difficulty;
  type: QuestionType;
  question_text: string;
  options?: string[]; // For MCQ only
  correct_answer: string;
  explanation: string;
  created_at: string;
}

// Achievement type
export interface Achievement {
  id: string;
  user_id: string;
  achievement_key: string;
  unlocked_at: string;
}

// GardenPlot type
export type GrowthStage = 0 | 1 | 2 | 3 | 4; // Seed -> Sprout -> Budding -> Flowering -> Flourishing

export interface GardenPlot {
  id: string;
  user_id: string;
  plot_index: number;
  plant_id?: string;
  growth_stage: GrowthStage;
  last_watered?: string;
  is_dormant: boolean;
  created_at: string;
}

// Plant type
export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export interface Plant {
  id: string;
  name: string;
  species: string;
  rarity: Rarity;
  subject_affinity: Subject;
  shard_cost: number;
  image_url?: string;
  created_at: string;
}

// UserPlan type (for garden items)
export interface UserPlant {
  id: string;
  user_id: string;
  plant_id: string;
  plot_id?: string;
  growth_stage: GrowthStage;
  last_watered?: string;
  is_dormant: boolean;
  acquired_at: string;
}

// Garden items (shards, potions, etc)
export interface GardenItem {
  id: string;
  user_id: string;
  item_type: "shard" | "revival_potion" | "fertilizer";
  quantity: number;
  updated_at: string;
}

// Subscription type
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan: UserPlan;
  status: "active" | "past_due" | "canceled" | "unpaid";
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}
