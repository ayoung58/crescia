// Shared application constants for session modes and subject display metadata.

import {
  BarChart2,
  FunctionSquare,
  Infinity,
  Leaf,
  type LucideIcon,
} from "lucide-react";

import type { SessionMode, SubjectSlug } from "@/types";

export const SESSION_MODES: readonly SessionMode[] = [
  "practice_questions",
  "practice_exam",
];

export const SUBJECT_DESCRIPTIONS: Record<SubjectSlug, string> = {
  "ap-stats": "Probability, inference, and data analysis",
  "ap-bio": "Cells, genetics, evolution, and ecology",
  "ap-calc-ab": "Limits, derivatives, and integrals",
  "ap-calc-bc": "Calc AB plus series and parametric equations",
};

export const SUBJECT_ICONS: Record<SubjectSlug, LucideIcon> = {
  "ap-stats": BarChart2,
  "ap-bio": Leaf,
  "ap-calc-ab": FunctionSquare,
  "ap-calc-bc": Infinity,
};
