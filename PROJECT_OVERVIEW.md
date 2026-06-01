# Crescia — Project Overview

*Version 1.0 · May 2026 · Solo Founder*

---

## What It Is

Crescia is a web-based exam prep platform for high school students preparing for AP exams. It combines AI-generated practice questions, adaptive performance tracking, and a garden gamification system where consistent studying grows a virtual garden. The name comes from the Latin root *crescere* — to grow.

**Tagline:** *Study smarter. Watch it grow.*

---

## The Problem

AP students have three compounding problems:

1. They don't know **what** to study — generic review books cover everything equally regardless of exam probability.
2. They have no **feedback loop** — no tool connects performance data over weeks into a clear trajectory.
3. They have no **motivation system** — existing tools are utilitarian and don't make students want to return daily.

---

## The Solution

Crescia solves all three:

- **AI question engine** generates realistic, rubric-aligned MCQ and FRQ questions from AP exam patterns.
- **Adaptive performance model** tracks per-topic accuracy over time and surfaces exactly what to study next.
- **Garden gamification** turns daily studying into a visible, growing reward — plants flourish when students do.

---

## MVP Scope

### Subjects (MVP)


| Subject           | MCQ | FRQ |
| ----------------- | --- | --- |
| AP Statistics     | ✅   | ✅   |
| AP Biology        | ✅   | ❌   |
| AP Calculus AB/BC | ✅   | ❌   |


### Core Features (MVP)

- AI-generated MCQ questions per subject and topic
- AI-powered FRQ grading for AP Statistics (rubric-aligned, line-level feedback)
- Timed and untimed session modes
- Per-topic accuracy tracking and heatmap
- Readiness Score (0–100 per subject, updates after every session)
- Question bank: AI-generated + scraped from public AP resources
- Garden tab: basic plant collection, growth stages, Shard currency, Seed Shop
- Gamification: XP, levels, daily streaks, 10 achievement badges, daily challenges
- Session summary screen (score, XP earned, readiness delta, badges unlocked)
- User authentication (Clerk)
- Freemium paywall logic (Stripe test mode)
- Shareable Scholar Card (profile snapshot)

### Deferred Features (Post-MVP)

- Parent account linking and parent dashboard
- Party / group study system
- Diagnostic / prerequisite placement test
- Lockdown browser
- IB curriculum (HL/SL)
- SAT prep content
- Tutor partnerships and video sharing
- Leaderboards
- Companion / pet system
- Full garden lore and seasonal events
- Stripe live mode (real payments)
- Mobile app
- LMS integrations (Canvas, Schoology)
- B2B school/district licensing

---

## Gamification System

### Core Loop

Study session → earn XP + Shards → grow plants → unlock achievements → check readiness score → return tomorrow.

### XP & Levels

- Correct answer = XP. Wrong answer = no XP. Participation earns nothing.
- Difficulty multiplier: hard questions give 2x XP. Weak topic bonus: 1.5x XP.
- Levels have no visible cap. Always a next level.
- Streak multiplier: Day 7+ = 1.25x, Day 30+ = 1.5x.

### Streaks

- Study once per day = streak maintained.
- 1 grace day per week (streak does not break on one missed day per week).
- Streak counter shown prominently on dashboard.

### Readiness Score

- 0–100 per subject, updated after every session.
- Weighted average of recent topic_stats accuracy.
- Shows delta after each session: "▲ +3 Readiness."
- This is the product's most motivating single number.

### Garden System

- Students earn Shards by studying correctly.
- Shards are spent in the Seed Shop on plant seeds (Common / Uncommon / Rare tiers).
- Plants have 5 growth stages: Seed → Sprout → Budding → Flowering → Flourishing.
- Growth is triggered by: maintaining daily streak, completing daily challenges.
- Dormancy: 3 days of inactivity causes a plant to go dormant (greyed out, not deleted).
- Revival Potion: earned from challenges, used to revive dormant plants.
- Fertilizer: earned from streak milestones, accelerates one growth stage.
- Garden Exchange: students can visit each other's gardens (no rankings, inspiration only).
- Garden tiers: garden space itself upgrades as student studies more (more plots unlock).

### Achievements (MVP — 10 badges)


| Badge          | Trigger                                      |
| -------------- | -------------------------------------------- |
| First Bloom    | Complete your first session                  |
| On a Roll      | 5 correct answers in a row                   |
| Week Warrior   | 7-day streak                                 |
| FRQ Fighter    | Submit your first FRQ                        |
| Weak Spot      | Answer a red-heatmap topic correctly         |
| Perfectionist  | Score 100% on a session                      |
| Consistent     | 30-day streak                                |
| Domain Cleared | >80% accuracy across all topics in a subject |
| Speed Demon    | Complete a timed session with >80% accuracy  |
| Comeback       | Return after a 7+ day absence                |


### Daily Challenges (3 per day, refreshes at midnight)

Examples:

- "Answer 5 Unit 3 questions correctly"
- "Complete a timed session"
- "Answer 3 FRQs correctly"
- "Answer a topic from your weakest area"

Completing all 3 = bonus Shards + XP reward.

---

## Monetization (MVP — Stripe Test Mode)


| Tier            | Price     | Limits                                                                            |
| --------------- | --------- | --------------------------------------------------------------------------------- |
| Free            | $0        | 10 questions/day, 1 hint token/day, basic readiness score, 6 garden plots         |
| Student Monthly | $14.99/mo | Unlimited questions, 3 hint tokens/day, full heatmap, FRQ grader, 20 garden plots |
| Student Annual  | $89.99/yr | Same as Monthly (~$7.50/mo)                                                       |


Hint Tokens: limited daily resource. Spend one to get a scaffolded hint on a question — not the answer, a nudge. Scarcity makes them feel valuable.

---

## Tech Stack


| Layer     | Choice                                   | Cost              |
| --------- | ---------------------------------------- | ----------------- |
| Framework | Next.js 14 (App Router) + TypeScript     | Free              |
| UI        | Tailwind CSS + shadcn/ui + Framer Motion | Free              |
| Charts    | Recharts                                 | Free              |
| Database  | Supabase (Postgres)                      | Free tier         |
| Auth      | Clerk                                    | Free to 50k users |
| AI        | Anthropic API (Claude Sonnet 4)          | ~$30–50/mo        |
| Payments  | Stripe (test mode)                       | Free until live   |
| Hosting   | Vercel                                   | Free tier         |
| IDE       | Cursor Pro (student — free 1 yr)         | Free              |
| AI Agent  | Claude Code (terminal)                   | Usage-based       |


**Estimated monthly cost during MVP: ~$30–50/month (Anthropic API only)**

---

## Go-To-Market Plan (Post-MVP)

1. Post to r/APStatistics, r/APStudents — show readiness score and garden in action.
2. Reach out to AP students in Discord study servers (offer free paid access for feedback).
3. Email 5 AP Stats teachers directly with a free teacher account.
4. Post a short demo video on TikTok/Instagram showing the garden growing after a good session.
5. Seasonal push: September (new school year) and April/May (exam crunch).

---

## Key Metrics to Track


| Metric                   | Target                               |
| ------------------------ | ------------------------------------ |
| Day-7 retention          | >30%                                 |
| Session completion rate  | >65%                                 |
| Question realism rating  | >70% "feels like a real AP question" |
| Free → Paid conversion   | >5%                                  |
| Daily streak maintenance | >40% of active users                 |
| Average session length   | 15–25 minutes                        |


