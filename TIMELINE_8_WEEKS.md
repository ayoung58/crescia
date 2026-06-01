# Crescia V1 — 8-Week Development Timeline

# 3–4 hours/day · 7 days/week · Starting June 1, 2026

# Solo developer · Windows · Cursor AI + Claude Code

---

## How to Use This Document

Each day has:

- A FOCUS — the single most important thing to accomplish
- TASKS — specific things to build or configure, in order
- CURSOR PROMPT — a ready-to-use prompt to give Cursor or Claude Code for the main task
- DONE WHEN — the concrete signal that the day is complete

Treat the DONE WHEN condition as your daily finish line.
Do not move to the next day until the current day's condition is met.
If a day runs long, it is okay to carry one task to the next morning — just note it.

At the end of each week, do a 15-minute review:

- What did you actually finish?
- What got carried forward?
- Is the overall pace on track?

---

## WEEK 1 — Foundation & Infrastructure

### Goal: A deployed, auth-protected app with no features yet.

---

### Day 1 — June 1 (Setup)

**FOCUS:** Complete the setup guide entirely.

TASKS:

1. Create all accounts (Supabase, Clerk, Anthropic, Stripe, Vercel) per SETUP_GUIDE.md Part 1
2. Save all API keys in a secure password manager (Bitwarden is free)
3. Create the Next.js project and install all dependencies per Part 2
4. Create .env.local with all values filled in
5. Copy .cursorrules, AGENTS.md, PROJECT_OVERVIEW.md into project root
6. Run npm run dev — confirm localhost:3000 loads

CURSOR PROMPT: Not needed today. This is pure setup — follow the guide manually.

DONE WHEN: npm run dev works and localhost:3000 shows the Next.js welcome page with no errors in the terminal.

---

### Day 2 — June 2 (GitHub + Vercel + Clerk basics)

**FOCUS:** Live deployment and working authentication.

TASKS:

1. Create GitHub repo (private), push initial commit per SETUP_GUIDE.md Part 3
2. Connect to Vercel, add environment variables, deploy per Part 4
3. Verify production URL loads
4. Install Clerk middleware

CURSOR PROMPT:

```
Context: Fresh Next.js 14 App Router project. Clerk is installed (@clerk/nextjs).
Task: Set up Clerk authentication middleware and basic layout.
Steps needed:
1. Create middleware.ts in the project root that protects all /dashboard/* routes
2. Wrap src/app/layout.tsx with ClerkProvider
3. Create src/app/(auth)/sign-in/[[...sign-in]]/page.tsx with Clerk's <SignIn /> component
4. Create src/app/(auth)/sign-up/[[...sign-up]]/page.tsx with Clerk's <SignUp /> component
5. Create a minimal src/app/dashboard/layout.tsx that shows a placeholder navbar
6. Create src/app/dashboard/page.tsx that says "Dashboard coming soon" and shows the current user's email via Clerk's currentUser()
Constraints: Use Server Components where possible. The sign-in and sign-up pages should be centered on the page.
Do NOT build any UI beyond what is needed to verify auth works.
```

DONE WHEN: You can sign up, sign in, and see your email on the /dashboard page. Vercel deployment also works with auth.

---

### Day 3 — June 3 (Supabase connection + user sync)

**FOCUS:** Database connected and users synced from Clerk.

TASKS:

1. Create Supabase client files
2. Build Clerk webhook to create user rows in Supabase on sign-up
3. Test: sign up a new account, verify a row appears in Supabase

CURSOR PROMPT:

```
Context: Next.js 14 App Router. Clerk for auth. Supabase for database.
Task: Set up Supabase client and Clerk webhook to sync new users.
Files to create:
1. src/lib/supabase/server.ts — Supabase server client using @supabase/ssr createServerClient
2. src/lib/supabase/client.ts — Supabase browser client using createBrowserClient
3. src/app/api/webhooks/clerk/route.ts — POST handler that:
   a. Verifies the webhook signature using the svix library and CLERK_WEBHOOK_SECRET
   b. On user.created event: inserts a row into a "users" table with fields: id (uuid), clerk_user_id (text), email (text), plan (text default 'free'), xp (int default 0), level (int default 1), streak_count (int default 0), streak_last_date (date nullable), created_at (timestamp)
   c. Returns 200 on success
Constraints: Use the service role key (SUPABASE_SERVICE_ROLE_KEY) in the webhook handler, not the anon key. Use svix for signature verification exactly as Clerk's docs specify.
```

After Cursor builds this: go to Supabase Table Editor and manually create the users table with the columns described (or ask Cursor to generate the SQL for you to paste).

DONE WHEN: Sign up a test account, check Supabase Table Editor, see a row in the users table.

---

### Day 4 — June 4 (TypeScript types + folder structure)

**FOCUS:** All types defined, folder structure clean, foundation solid.

TASKS:

1. Define all TypeScript interfaces
2. Set up basic page shells (empty pages for each route)
3. Confirm folder structure matches AGENTS.md exactly

CURSOR PROMPT:

```
Context: Crescia exam prep platform. Database tables: users, sessions, answers, topic_stats, questions_cache, achievements, garden_plots, plants, user_plants, garden_items, subscriptions.
Task: Create src/types/index.ts with TypeScript interfaces for all entities.
Include:
- User (matches users table columns)
- Session (subject: 'ap-stats' | 'ap-bio' | 'ap-calc', mode: 'timed' | 'untimed', score, total_questions, completed_at)
- Answer (session_id, question_id, is_correct, time_spent_seconds, topic_tag)
- TopicStat (user_id, subject, topic_tag, attempts, correct, accuracy: computed)
- Question (id, subject, topic_tag, difficulty: 'easy' | 'medium' | 'hard', type: 'mcq' | 'frq', question_text, options?: string[], correct_answer, explanation)
- Achievement (achievement_key, unlocked_at)
- GardenPlot (plot_index, plant_id?: string, growth_stage: 0|1|2|3|4, last_watered?: date, is_dormant: boolean)
- Plant (id, name, species, rarity: 'common'|'uncommon'|'rare'|'legendary', subject_affinity, shard_cost)
- UserPlan: 'free' | 'student'
Also create empty page shells:
- src/app/dashboard/study/page.tsx
- src/app/dashboard/garden/page.tsx
- src/app/dashboard/profile/page.tsx
- src/app/dashboard/subjects/page.tsx
Each shell returns a simple <div> with the page name. No logic yet.
```

DONE WHEN: TypeScript compiles with no errors (npm run build passes or no red squiggles in Cursor).

---

### Day 5 — June 5 (Navigation + Layout)

**FOCUS:** The dashboard shell looks like a real app.

TASKS:

1. Build the main dashboard layout with sidebar navigation
2. Apply Crescia color palette from UI_DESIGN_GUIDE.md to globals.css
3. Add subject navigation tabs

CURSOR PROMPT:

```
Context: Crescia study app. shadcn/ui with Luma preset. Colors defined in globals.css CSS variables.
Task: Build the main dashboard layout.
Create src/app/dashboard/layout.tsx with:
- A left sidebar (w-56, hidden on mobile, collapsible)
- Sidebar items: Dashboard (home icon), Study (book-open icon), Garden (leaf icon), Profile (user icon)
- Active state: sidebar item gets primary background color
- Top of sidebar: "Crescia" wordmark in font-semibold
- Bottom of sidebar: Clerk UserButton component for account management
- Main content area: flex-1, overflow-y-auto, p-6
- On mobile: bottom navigation bar instead of sidebar (4 icons)
Use Lucide icons. Use shadcn/ui components where applicable.
Color rules: background is --background (#FAFAF7), sidebar slightly darker at --background-secondary, active items use --primary.
Feel: clean, Notion-like. No gradients. No shadows on the sidebar — just a subtle right border.
```

DONE WHEN: Dashboard has a working sidebar with navigation between the 4 pages. Looks clean and intentional.

---

### Day 6 — June 6 (Dashboard home page — static)

**FOCUS:** Dashboard home looks designed, even with placeholder data.

TASKS:

1. Build the dashboard home page layout with static/placeholder data
2. Streak counter component
3. Readiness score cards (static numbers for now)
4. Daily goal progress bar

CURSOR PROMPT:

```
Context: Crescia dashboard home page. All data is static/placeholder for now — no real DB calls yet.
Task: Build src/app/dashboard/page.tsx as a 2-column layout.
Left column (2/3 width):
- Daily goal card: "Answer 20 questions today" with a Progress bar at 0%, a "Start Studying" button
- Today's Challenges card: 3 challenge items, each with a checkbox, description, and Shard reward badge
  Placeholder challenges: "Answer 5 AP Stats questions correctly", "Complete a timed session", "Answer 1 FRQ"
Right column (1/3 width):
- Streak card: large number "0" with a flame icon (Lucide: flame), "Day streak" label below
- Readiness scores: 3 compact cards, one per subject (AP Statistics: 0, AP Biology: 0, AP Calculus: 0)
  Each shows a subject badge, the score as a large number, and a thin progress bar
All data is hardcoded placeholder. No API calls.
Colors: cards use --background with border --border. Accent gold for shard badges. Primary green for progress bars.
Spacing: gap-6 between columns, p-5 inside cards. No shadows beyond shadow-sm.
```

DONE WHEN: Dashboard home looks like a designed product page, not a template. Screenshot it — it should look good enough to show someone.

---

### Day 7 — June 7 (Week 1 Review + Buffer)

**FOCUS:** Catch up, clean up, verify everything works end to end.

TASKS:

1. Fix any TypeScript errors or warnings accumulated during the week
2. Verify all 4 Vercel environment variables are set correctly (test a production deploy)
3. Test auth flow: sign up → dashboard → sign out → sign in again
4. Review .cursorrules — add any rules you've learned this week about how Cursor behaves
5. Write a brief note (can be in a NOTES.md file) of what you've learned and any blockers

DONE WHEN: A fresh sign-up flow works end to end in production (Vercel URL, not localhost).

---

## WEEK 2 — AI Question Engine (AP Statistics)

### Goal: Claude generates a real AP Stats MCQ and you can answer it.

---

### Day 8 — June 8 (Anthropic client + prompt architecture)

**FOCUS:** Claude generates a valid AP Stats question.

TASKS:

1. Build the Anthropic client wrapper
2. Build the AP Stats question generation prompt
3. Test in isolation (a simple test route)

CURSOR PROMPT:

```
Context: Crescia uses the Anthropic API (claude-sonnet-4-20250514) to generate AP exam questions.
Task: Build the question generation infrastructure.
Files to create:
1. src/lib/ai/client.ts — instantiates Anthropic SDK using ANTHROPIC_API_KEY, exports a singleton client
2. src/lib/ai/prompts/ap-stats.ts — exports a system prompt string for AP Statistics question generation.
   The system prompt should instruct Claude to:
   - Generate questions that match College Board AP Statistics exam style and difficulty
   - Return ONLY valid JSON in this exact shape: { question_text: string, options: string[] (4 items for MCQ), correct_answer: string (the full text of the correct option), explanation: string, topic_tag: string, difficulty: 'easy'|'medium'|'hard', type: 'mcq' }
   - Topic tags should match AP Stats units: 'exploring-data', 'sampling-distributions', 'probability', 'inference-means', 'inference-proportions', 'linear-regression', 'chi-square'
   - Mark the system prompt content with cache_control: { type: 'ephemeral' } for prompt caching
3. src/app/api/questions/generate/route.ts — POST endpoint that:
   - Accepts body: { subject: string, topic_tag?: string, difficulty?: string, type: 'mcq'|'frq' }
   - Calls Claude with the appropriate system prompt + a user prompt specifying the topic/difficulty
   - Parses and validates the JSON response
   - Returns the question object
   - Wraps everything in try/catch, returns { success, data, error }
Constraints: NEVER call this from client-side. This is a server-side API route only.
```

DONE WHEN: You can call the API route via a tool like Postman or the browser fetch console and get back a valid AP Stats MCQ question JSON.

---

### Day 9 — June 9 (Question cache table + cache logic)

**FOCUS:** Questions are cached in Supabase, not regenerated every time.

TASKS:

1. Create questions_cache table in Supabase
2. Add cache check logic to the generate route
3. Test: first call generates, second call returns cached

CURSOR PROMPT:

```
Context: The question generation API route exists at src/app/api/questions/generate/route.ts.
Task: Add question caching logic using Supabase.
The questions_cache table has columns: id (uuid), subject (text), topic_tag (text), difficulty (text), type (text), question_json (jsonb), used_count (int default 0), created_at (timestamp).
Modify the generate route to:
1. Before calling Claude: query questions_cache for an unused or low-used question matching (subject, topic_tag, difficulty, type). "Low-used" means used_count < 5.
2. Cache hit: increment used_count, return the cached question_json
3. Cache miss: call Claude, insert the result into questions_cache with used_count=0, return the new question
Add a separate src/app/api/questions/seed/route.ts that accepts { subject, topic_tag, count } and generates [count] questions for that topic/tag combination, storing all in cache. This is for pre-seeding the bank.
Constraints: Use the Supabase server client from src/lib/supabase/server.ts. Return { success, data, error } shape.
```

DONE WHEN: Calling generate twice for the same topic returns the same cached question (verified by checking Supabase Table Editor for the row).

---

### Day 10 — June 10 (QuestionCard component)

**FOCUS:** A real question renders beautifully in the browser.

TASKS:

1. Build QuestionCard component for MCQ
2. Connect it to the generate API
3. Render a live AP Stats question on the study page

CURSOR PROMPT:

```
Context: Crescia study app. shadcn/ui + Tailwind + Framer Motion available.
Task: Build src/components/study/QuestionCard.tsx for MCQ questions.
Props: { question: Question, onAnswer: (selectedOption: string) => void, isAnswered: boolean, selectedAnswer?: string }
Layout (unanswered state):
- Top row: subject badge (AP Statistics in subject color), topic badge, difficulty badge, optional timer slot
- Question text: text-lg font-medium, max-w-prose, my-6
- 4 answer buttons: full width, stacked with gap-3, rounded-xl border border-border
  Hover state: bg-background-secondary
  Default: bg-background
  
Layout (answered state — driven by isAnswered prop):
- Correct option: border-2 border-correct, bg-correct/10, show CheckCircle icon right-aligned
- Selected wrong option: border-2 border-incorrect, bg-incorrect/10, show XCircle icon right-aligned  
- Explanation text appears below the options with a subtle border-l-2 border-primary pl-4
- A "Next Question →" button appears at the bottom

Also create src/app/dashboard/study/page.tsx that:
- On mount, fetches one AP Stats question from /api/questions/generate
- Shows a loading skeleton while fetching
- Renders QuestionCard when question arrives
- On answer: shows feedback, then a "Next Question" button that fetches the next question
Use Framer Motion for: a brief green flash animation on correct answer (0.2s), card fade-in on new question (0.3s).
```

DONE WHEN: You can answer a real AI-generated AP Stats question in the browser and see correct/incorrect feedback.

---

### Day 11 — June 11 (Session flow — tracking answers)

**FOCUS:** A complete study session saves to the database.

TASKS:

1. Build session state management
2. Session completion saves to Supabase
3. Basic session summary screen

CURSOR PROMPT:

```
Context: The QuestionCard component works. Now we need a full session flow.
Task: Build the session management system.
1. Create src/hooks/useSession.ts — a custom hook that manages:
   - questions array, currentIndex, answers array, sessionStartTime
   - handleAnswer(selectedOption: string) — records the answer, marks correct/incorrect
   - completeSession() — calls the session complete API
   - State: 'loading' | 'active' | 'complete'

2. Create src/app/api/sessions/complete/route.ts — POST handler that:
   - Accepts: { subject, mode, questions_answered, correct_count, time_spent_seconds, answers: Answer[] }
   - Inserts into sessions table
   - Inserts all answers into answers table
   - For each answer, updates topic_stats: increment attempts, increment correct if is_correct
   - Returns { success, session_id, score_percent }
   Constraints: use server Supabase client, verify user is authenticated via Clerk

3. Create src/components/study/SessionSummary.tsx:
   - Shows: "X / Y correct", score percentage in large text
   - XP earned (calculate as: correct_count * 10, hard questions * 20)
   - "Well done" or "Keep going" message based on score
   - "Study Again" button (primary, larger) and "Go Home" button (ghost)
   - No animations yet — we will add those in Week 4
```

DONE WHEN: Complete a 5-question session, click "Finish," see the summary screen, check Supabase — the session and answer rows exist.

---

### Day 12 — June 12 (Timed mode)

**FOCUS:** Timed sessions work with a countdown timer.

CURSOR PROMPT:

```
Context: The study session flow works. Now adding timed mode.
Task: Add timed mode to the study session.
1. Create src/components/study/Timer.tsx:
   - Accepts: { totalSeconds: number, onExpire: () => void }
   - Shows time remaining as MM:SS
   - A thin progress bar beneath that depletes from full to empty
   - When time < 20% remaining: text turns --incorrect color
   - When expired: calls onExpire()
   Use setInterval in a useEffect, clean up on unmount.

2. Modify the study page to support a mode selector:
   - Before the session starts, show two buttons: "Timed" and "Untimed"
   - Timed: 90 seconds per question for MCQ. Timer resets on each new question.
   - Untimed: no timer shown
   - Store the chosen mode in session state

3. When the timer expires on a question:
   - Auto-submit as incorrect
   - Show "Time's up!" instead of the normal wrong answer feedback
   - Move to next question after 2 seconds automatically
```

DONE WHEN: You can choose timed mode, see the countdown, and have it auto-advance when time expires.

---

### Day 13 — June 13 (XP + Levels)

**FOCUS:** Answering correctly earns XP and the level display works.

CURSOR PROMPT:

```
Context: Sessions complete and save to Supabase. Now adding XP and levels.
Task: Build the XP and leveling system.
1. Create src/lib/gamification/xp.ts:
   - XP_PER_CORRECT: easy=10, medium=20, hard=35
   - WEAK_TOPIC_MULTIPLIER: 1.5 (applied when topic accuracy < 50%)
   - calculateSessionXP(answers: Answer[], topicStats: TopicStat[]): number
   - getLevel(totalXp: number): number — level = Math.floor(totalXp / 200) + 1
   - getXpProgress(totalXp: number): { current: number, needed: number, percent: number }

2. Modify src/app/api/sessions/complete/route.ts:
   - After saving session, calculate XP earned
   - Update users.xp and users.level in Supabase
   - Return xp_earned and new_level in the response

3. Create src/components/rpg/XPBar.tsx:
   - Shows current level as "Lv. X"
   - Progress bar showing XP progress to next level
   - Displays XP fraction: "340 / 400 XP"
   - Used in the sidebar (small) and session summary (larger with animation slot)

4. Add XP earned to SessionSummary: "+X XP" in accent gold color
```

DONE WHEN: Complete a session, check the session summary for XP, check Supabase users table — xp and level columns have updated values.

---

### Day 14 — June 14 (Week 2 Review + Buffer)

**FOCUS:** Consolidation and cleanup.

TASKS:

1. Test the full flow: sign in → choose timed mode → answer 10 questions → see summary → check DB
2. Add loading skeletons to any components that fetch data (use shadcn/ui Skeleton)
3. Push clean commit to GitHub
4. Write down the 3 biggest friction points you experienced this week

DONE WHEN: The full study loop works without errors from sign-in to session summary.

---

## WEEK 3 — FRQ Grader + AP Bio + AP Calc Questions

### Goal: All three subjects generate questions, AP Stats FRQ grading works.

---

### Day 15 — June 15 (FRQ input component)

**FOCUS:** Students can type and submit a free response answer.

CURSOR PROMPT:

```
Context: MCQ flow works. Now building FRQ for AP Statistics only.
Task: Build the FRQ question and submission UI.
1. Create src/components/study/FRQInput.tsx:
   - Shows the FRQ question prompt (can be multi-paragraph)
   - Large textarea: min-h-[200px], resize-y, rounded-xl, border-border
   - Word count indicator below textarea (e.g., "142 words")
   - Hint token button: "Use Hint (2 remaining)" — ghost button, small, top right of textarea
   - Submit button: full width, primary, "Submit Response"
   - Disabled state when: textarea is empty, or question is already submitted

2. Modify the question generation route to support type: 'frq' for AP Stats.
   Add src/lib/ai/prompts/ap-stats-frq.ts:
   - System prompt that instructs Claude to generate AP Statistics FRQ questions
   - Format: multi-part questions (Part a, Part b, Part c)
   - Return JSON: { question_text: string, parts: string[], topic_tag: string, rubric_points: number, difficulty: 'medium'|'hard', type: 'frq' }
```

DONE WHEN: An FRQ question renders in the browser with the textarea input ready to type.

---

### Day 16 — June 16 (FRQ grading with Claude)

**FOCUS:** Claude scores a student's FRQ response against the AP rubric.

CURSOR PROMPT:

```
Context: FRQ questions render and students can submit answers.
Task: Build the FRQ grading API route.
1. Create src/lib/ai/frq-grader.ts:
   - Function: gradeResponse(question: Question, studentAnswer: string): Promise<FRQResult>
   - FRQResult type: { score: number, max_score: number, score_percent: number, feedback: string[], rubric_points: RubricPoint[], overall_comment: string }
   - RubricPoint type: { point_description: string, earned: boolean, explanation: string }
   - System prompt (with cache_control ephemeral): "You are an AP Statistics exam grader following College Board rubric standards exactly. Grade the student's response and return ONLY valid JSON."
   - User prompt: includes the question, the rubric context, and the student's answer

2. Create src/app/api/questions/grade/route.ts:
   - POST: accepts { question_id, student_answer, question }
   - Calls gradeResponse()
   - Saves result to answers table
   - Returns { success, data: FRQResult }

3. Create src/components/study/FRQFeedback.tsx:
   - Shows overall score: "3 / 4 points"
   - Progress bar for score
   - List of rubric points: each with a check/x icon, the point description, and the explanation
   - Overall comment in a styled blockquote
   - Color: earned points = --correct, missed = --incorrect
```

DONE WHEN: Submit an FRQ answer and receive rubric-aligned feedback from Claude with point-by-point scoring.

---

### Day 17 — June 17 (AP Biology questions)

**FOCUS:** AP Bio MCQ questions generate correctly.

CURSOR PROMPT:

```
Context: AP Stats MCQ and FRQ work. Now adding AP Biology.
Task: Add AP Biology to the question generation system.
1. Create src/lib/ai/prompts/ap-bio.ts:
   - System prompt for AP Biology MCQ generation (same JSON shape as AP Stats MCQ)
   - Topic tags: 'chemistry-of-life', 'cell-structure', 'cellular-energetics', 'cell-communication', 'heredity', 'gene-expression', 'natural-selection', 'ecology'
   
2. Modify src/app/api/questions/generate/route.ts:
   - Add subject routing: if subject === 'ap-bio', use the AP Bio system prompt
   - All other logic (caching, JSON parsing) stays the same

3. Add AP Biology to the subjects page:
   - Update src/app/dashboard/subjects/page.tsx
   - Show 3 subject cards: AP Statistics, AP Biology, AP Calculus
   - Each card: subject name, badge with color from UI_DESIGN_GUIDE.md, "Start Studying" button
   - Clicking navigates to /dashboard/study?subject=ap-bio

4. Update the study page to read the subject from URL search params
```

DONE WHEN: Click AP Biology on the subjects page, complete a study session, see Bio-specific questions.

---

### Day 18 — June 18 (AP Calculus questions)

**FOCUS:** AP Calc MCQ questions generate correctly.

CURSOR PROMPT:

```
Context: AP Stats and AP Bio both generate questions. Now adding AP Calculus AB/BC.
Task: Add AP Calculus to the question generation system (same pattern as AP Bio).
1. Create src/lib/ai/prompts/ap-calc.ts:
   - System prompt for AP Calculus MCQ
   - Topic tags: 'limits', 'derivatives', 'derivative-applications', 'integrals', 'integral-applications', 'differential-equations', 'series' (series only for BC)
   - Note in the prompt: indicate whether the question is AB or BC level

2. Add subject routing in the generate route for 'ap-calc'

3. Add AP Calculus card to the subjects page

4. Add a subject selector within the study session so students can switch subjects mid-session
   (a simple dropdown in the session header, only enabled before the session starts)
```

DONE WHEN: All three subjects generate valid questions and the subjects page shows all three cards.

---

### Day 19 — June 19 (Topic stats + Heatmap)

**FOCUS:** Per-topic accuracy tracking is visible as a heatmap.

CURSOR PROMPT:

```
Context: Sessions save correctly and topic_stats table is being updated.
Task: Build the topic accuracy heatmap.
1. Create src/app/api/stats/topic/route.ts:
   - GET: accepts subject as query param
   - Queries topic_stats for the current user filtered by subject
   - Returns array of { topic_tag, attempts, correct, accuracy }

2. Create src/components/analytics/TopicHeatmap.tsx:
   - Accepts: { subject: string }
   - Fetches topic stats on mount
   - Renders a grid of topic nodes (one per topic_tag)
   - Node design: rounded-lg, 100px wide, shows topic name and accuracy percentage
   - Color based on accuracy: < 50% = --incorrect background tint, 50-75% = amber tint, > 75% = --correct tint
   - "Not attempted" nodes: gray with dashed border
   - Clicking a node shows a small popover: attempts, correct, accuracy, "Study this topic" button that links to /dashboard/study?subject=X&topic=Y

3. Add the heatmap to the profile page with subject tabs (AP Stats / AP Bio / AP Calc)
```

DONE WHEN: After answering questions in different topics, the heatmap on the profile page shows the correct colors and accuracy numbers.

---

### Day 20 — June 20 (Readiness Score)

**FOCUS:** The readiness score is live, real, and updates after every session.

CURSOR PROMPT:

```
Context: Topic stats are tracked. Now building the readiness score.
Task: Build the readiness score calculation and display.
1. Create src/lib/gamification/readiness.ts:
   - calculateReadinessScore(topicStats: TopicStat[], subject: string): number (0-100)
   - Algorithm: weighted average of topic accuracy, weighted by how many AP exam questions typically come from each topic
   - AP Stats weights: exploring-data 15%, sampling-distributions 15%, probability 10%, inference-means 20%, inference-proportions 20%, linear-regression 12%, chi-square 8%
   - AP Bio weights: distribute 100% across 8 topics roughly evenly
   - AP Calc weights: limits 10%, derivatives 20%, derivative-applications 15%, integrals 20%, integral-applications 15%, differential-equations 10%, series 10%
   - Return 0 if no topics have been attempted yet

2. Modify sessions/complete route to recalculate and store readiness score after each session:
   - Calculate new readiness score for the completed subject
   - Update a readiness_stats column on the users table (JSONB: { 'ap-stats': 0, 'ap-bio': 0, 'ap-calc': 0 })

3. Create src/components/analytics/ReadinessScore.tsx:
   - Large number display (0-100)
   - Subject label below
   - Color: 0-40 = muted, 40-70 = amber, 70-100 = primary green
   - Delta display: accepts a prevScore prop, shows "▲ +3" or "▼ -1" after a session

4. Update dashboard home to show real readiness scores from the database
```

DONE WHEN: Complete a session, check the dashboard — the readiness score has changed from 0 to a real number.

---

### Day 21 — June 21 (Week 3 Review + Buffer)

**FOCUS:** All three subjects work. FRQ works. Heatmap works. Readiness score is real.

TASKS:

1. Test all three subjects end to end
2. Test FRQ: generate, write an answer, see feedback
3. Check profile page: heatmap and readiness score both show real data
4. Fix any bugs or layout issues discovered
5. Push clean commit to GitHub

DONE WHEN: You can demo all three subjects + FRQ to a friend or family member without hitting any errors.

---

## WEEK 4 — Streaks, Achievements, Polish

### Goal: The gamification layer is fully functional and feels rewarding.

---

### Day 22 — June 22 (Streak system)

**FOCUS:** Daily streaks track correctly including grace day logic.

CURSOR PROMPT:

```
Task: Build the streak tracking system.
1. Create src/lib/gamification/streaks.ts:
   - checkAndUpdateStreak(userId: string, lastDate: Date | null, currentStreakCount: number): { newStreak: number, graceUsed: boolean, streakBroken: boolean }
   - Logic:
     * If lastDate is today: no change (already studied today)
     * If lastDate is yesterday: increment streak
     * If lastDate is 2 days ago: use grace day (no increment, no reset) — only if grace_used_this_week is false
     * If lastDate is 3+ days ago: reset to 1
   - Grace day resets every Monday

2. Modify sessions/complete route:
   - After session saves, call checkAndUpdateStreak
   - Update users.streak_count, users.streak_last_date, users.grace_used_this_week

3. Create src/components/rpg/StreakCounter.tsx:
   - Large flame icon (Lucide: flame) in --accent gold when streak > 0, gray when 0
   - Large streak number beside it
   - "Day streak" label
   - If streak >= 7: subtle golden glow around the flame
   - Show "Grace day available" badge when grace not yet used this week

4. Add StreakCounter to the dashboard home right column
```

DONE WHEN: Study two days in a row, check streak = 2. Skip a day, study again, check grace day logic works.

---

### Day 23 — June 23 (Achievement system)

**FOCUS:** All 10 achievements can be unlocked and display correctly.

CURSOR PROMPT:

```
Task: Build the achievement system.
1. Create src/lib/gamification/achievements.ts:
   Define ACHIEVEMENTS array with all 10:
   - first-bloom: "Complete your first session" — trigger: session count >= 1
   - on-a-roll: "5 correct answers in a row" — trigger: detected in session answer stream
   - week-warrior: "7-day streak" — trigger: streak_count >= 7
   - frq-fighter: "Submit your first FRQ" — trigger: first FRQ answer recorded
   - weak-spot: "Answer a red-heatmap topic correctly" — trigger: correct answer on topic with accuracy < 50%
   - perfectionist: "Score 100% on a session" — trigger: score_percent === 100
   - consistent: "30-day streak" — trigger: streak_count >= 30
   - domain-cleared: ">80% accuracy across all topics in a subject" — trigger: all topic accuracies > 80%
   - speed-demon: "Timed session with >80% accuracy" — trigger: mode === 'timed' && score_percent > 80
   - comeback: "Return after 7+ day absence" — trigger: days since last session >= 7 and new session completed

   Function: checkAchievements(context: AchievementContext): string[] — returns array of newly unlocked achievement keys

2. Modify sessions/complete route:
   - After all updates, call checkAchievements with the session context
   - For each newly unlocked achievement: insert into achievements table if not already present
   - Return newly_unlocked: string[] in the response

3. Create src/components/rpg/AchievementBadge.tsx:
   - Accepts: { achievementKey: string, unlocked: boolean, unlockedAt?: Date }
   - Unlocked: full color badge with icon, name, unlock date
   - Locked: grayscale silhouette, "???" for name
   - Assign an icon from Lucide to each achievement key

4. Add achievement grid to profile page (2x5 grid of AchievementBadge)
5. Add achievement unlock notification to SessionSummary (if newly_unlocked.length > 0, show badge cards with a subtle Framer Motion pop animation)
```

DONE WHEN: Complete your first session and see the "First Bloom" achievement unlock in the session summary.

---

### Day 24 — June 24 (Daily challenges)

**FOCUS:** Three daily challenges generate, track completion, and reward shards.

CURSOR PROMPT:

```
Task: Build the daily challenge system.
1. Create a daily_challenges table in Supabase: id, user_id, date, challenges (jsonb array of 3), completed_indices (int[]), shards_rewarded (bool), created_at

2. Create src/lib/gamification/challenges.ts:
   - CHALLENGE_TEMPLATES array of 10+ templates:
     "Answer {n} {subject} questions correctly", "Complete a timed session", "Answer {n} FRQs",
     "Answer a question from your weakest topic", "Score 80%+ on a session", "Answer {n} questions without using a hint"
   - generateDailyChallenges(userId, subject): Challenge[] — picks 3 random templates, fills in variables, stores in DB
   - checkChallengeCompletion(sessionResult, challenges): number[] — returns indices of newly completed challenges

3. Create src/app/api/challenges/route.ts:
   - GET: returns today's challenges for the user (generates if none exist for today)
   - POST: marks a challenge index as complete, awards shards if all 3 complete

4. Update DashboardHome to fetch and display real challenges with completion state (checkbox that checks off)

5. Create src/lib/gamification/shards.ts:
   - awardShards(userId, amount, reason): updates a shards_balance column on users table
   - SHARD_REWARDS: correct_answer=5, daily_goal=50, all_challenges=75, streak_7day=100
```

DONE WHEN: Three challenges appear on the dashboard every day. Completing one shows it as checked off.

---

### Day 25 — June 25 (Session summary polish + animations)

**FOCUS:** The post-session moment feels genuinely rewarding.

CURSOR PROMPT:

```
Task: Polish the session summary screen with Framer Motion animations.
Redesign src/components/study/SessionSummary.tsx:
1. Full-page layout (not a small card — takes up most of the screen)
2. Score display: large number counts up from 0 to the actual score over 0.8s using Framer Motion
3. XP earned: slides up and fades in after score animation, shows "+X XP" in accent gold
4. Readiness delta: appears after XP, shows "▲ +3 Readiness" or "▼ -1 Readiness" with appropriate color
5. Achievement unlocks: if any, cards appear one by one with a scale pop (0.95 → 1.05 → 1.0)
6. Best topic + weakest topic: two small badges side by side ("Strong: Probability" and "Focus: Inference")
7. Streak status: "🔥 X day streak" if maintained, or gentle "Streak safe (grace day used)" if grace applied
8. Two buttons at bottom: "Study Again" (primary, full width) and "Go Home" (ghost, smaller)

Animation sequence timing:
- Score count-up: 0ms
- XP slide-in: 900ms
- Readiness delta: 1200ms
- Achievement cards: 1500ms, 100ms stagger between each
- Topic badges: 2000ms
- Buttons: 2200ms
```

DONE WHEN: Complete a session and the summary screen feels like a real achievement moment, not a plain results page.

---

### Day 26 — June 26 (Hint token system)

**FOCUS:** Hint tokens are limited, valuable, and work correctly.

CURSOR PROMPT:

```
Task: Build the hint token system.
1. Add hint_tokens_remaining and hint_tokens_reset_date columns to users table
   - Free tier: resets to 1 daily. Paid tier: resets to 3 daily.

2. Create src/app/api/hints/route.ts:
   - POST: accepts { question_id, question_text, topic_tag }
   - Checks user's hint_tokens_remaining > 0
   - If yes: decrements tokens, calls Claude with a hint generation prompt
     Hint prompt: "Give a helpful nudge toward the answer without revealing it. 1-2 sentences max."
   - Returns { hint_text, tokens_remaining }
   - If no tokens: returns { success: false, error: 'No hint tokens remaining' }

3. Add daily token reset logic: in the GET /api/challenges route (called on every dashboard load),
   check if hint_tokens_reset_date is not today — if so, reset tokens to the user's plan limit

4. Update FRQInput.tsx to connect the hint button to this API
5. Add hint button to QuestionCard for MCQ as well (small ghost button below the options)
6. Show remaining token count in the sidebar (small badge near the user's level)
```

DONE WHEN: Use a hint on a question, see the token count decrement, verify it resets the next day.

---

### Day 27 — June 27 (Scholar card + profile page)

**FOCUS:** The profile page is shareable and looks great.

CURSOR PROMPT:

```
Task: Build the complete profile page.
Create src/app/dashboard/profile/page.tsx with:
1. Scholar Card section (top):
   - User avatar (Clerk initials avatar, circular, w-16 h-16)
   - Display name and email
   - Level badge: "Lv. X Scholar" in accent gold
   - Streak display: flame icon + X days
   - Readiness scores: 3 small score badges (one per subject)
   - "Share Card" button: uses Web Share API or copies a text summary to clipboard
   
2. Achievements section:
   - 2x5 grid of AchievementBadge components
   - Tab or section header: "Achievements (X / 10)"

3. Topic Heatmap section:
   - Subject tabs: AP Statistics / AP Biology / AP Calculus
   - TopicHeatmap component for the selected subject
   
4. Recent sessions section:
   - Last 5 sessions as a simple list: date, subject, score, XP earned
   - Recharts LineChart showing readiness score over time for the selected subject

Layout: single column, max-w-3xl, generous section spacing (space-y-10)
```

DONE WHEN: Profile page loads with real data and the Scholar Card looks like something worth screenshotting.

---

### Day 28 — June 28 (Week 4 Review + Buffer)

**FOCUS:** All gamification is working. Full loop tested end to end.

TASKS:

1. Complete a full day's "ideal session": open dashboard → see challenges → study → complete session → see summary → check profile
2. Verify achievement unlock works (create a test where you trigger "On a Roll")
3. Verify hint tokens reset logic
4. Push clean commit. Write a brief CHANGELOG.md entry for Week 4.

DONE WHEN: The full gamification loop works without any console errors or broken states.

---

## WEEK 5 — Garden System

### Goal: The garden tab is functional, beautiful, and connected to study activity.

---

### Day 29 — June 29 (Garden database + data model)

**FOCUS:** Garden tables exist and basic plant catalog is seeded.

TASKS:

1. Create garden tables in Supabase: garden_plots, plants, user_plants, garden_items
2. Seed the plants catalog with 20 initial plants

CURSOR PROMPT:

```
Task: Set up the garden data layer.
1. Create src/app/api/garden/route.ts:
   - GET: returns the user's garden state:
     { plots: GardenPlot[], inventory: { shards: number, fertilizer: number, revival_potions: number }, owned_plants: UserPlant[] }
   - Fetches from garden_plots, users (shards), garden_items tables

2. Create src/lib/gamification/garden.ts:
   - PLANT_CATALOG: array of 20 Plant objects. Examples:
     { id: 'common-clover', name: 'Lucky Clover', species: 'Trifolium repens', rarity: 'common', shard_cost: 50, subject_affinity: null }
     { id: 'stats-crystal', name: 'Data Crystal', species: 'Crystallus statisticus', rarity: 'uncommon', shard_cost: 150, subject_affinity: 'ap-stats' }
     { id: 'bio-orchid', name: 'Bio Orchid', species: 'Orchidaceae vitae', rarity: 'rare', shard_cost: 300, subject_affinity: 'ap-bio' }
     { id: 'calc-fern', name: 'Infinite Fern', species: 'Filix infinitus', rarity: 'uncommon', shard_cost: 150, subject_affinity: 'ap-calc' }
     Continue for 16 more plants across rarities
   
   - growthRequirements: { streak_days_for_stage: [0, 3, 7, 14, 30] } — days of streak needed per growth stage

3. Create src/app/api/garden/plant/route.ts:
   - POST: accepts { plot_index, plant_id }
   - Validates: user has enough shards, plot is empty, user doesn't already own this plant
   - Deducts shards, creates user_plants row, updates garden_plots
   - Returns updated garden state
```

DONE WHEN: The plants catalog exists in /lib, and the garden API routes return valid data.

---

### Day 30 — June 30 (Garden grid UI)

**FOCUS:** The garden tab renders beautifully.

CURSOR PROMPT:

```
Task: Build the garden tab UI.
Create src/app/dashboard/garden/page.tsx and garden components.

1. src/components/garden/GardenGrid.tsx:
   - Responsive grid: grid-cols-3 on mobile, grid-cols-5 on desktop
   - Background: a soft sage green / cream gradient (--background-garden)
   - Each cell is a GardenPlot component

2. src/components/garden/GardenPlot.tsx:
   Props: { plot: GardenPlot, plant?: Plant, onPlotClick: () => void }
   - Empty plot: rounded-xl, dashed border (border-dashed border-border), bg-background-garden/50, centered + icon (Lucide: plus), subtle hover state
   - Planted plot: rounded-xl solid border, white background, centered plant icon (use Lucide: sprout for early stages, flower for later), growth stage dots at bottom (5 dots, filled = current stage and below)
   - Dormant: same as planted but desaturated (CSS filter: grayscale(0.7)), small moon icon overlay top-right
   - Flourishing (stage 4): subtle golden box-shadow: 0 0 12px rgba(201, 168, 76, 0.3)
   
3. src/components/garden/SeedShop.tsx:
   - Sheet component (slides in from right) opened by a "Seed Shop" button top-right
   - Lists all plants in PLANT_CATALOG grouped by rarity
   - Each item: plant name, species in italic, rarity badge, shard cost, "Plant" button
   - "Plant" button disabled if: insufficient shards OR no empty plots OR already owned
   - Shows user's shard balance at the top of the sheet

4. Garden page header:
   - "Your Garden" title
   - Shard balance (coin icon + number)
   - Items inventory: small badges for Fertilizer count and Revival Potion count
   - "Seed Shop" button (ghost, right-aligned)
```

DONE WHEN: The garden tab looks beautiful, shows empty plots, and the Seed Shop opens as a side sheet.

---

### Day 31 — July 1 (Plant growth logic)

**FOCUS:** Plants actually grow when students study.

CURSOR PROMPT:

```
Task: Connect plant growth to study activity.
1. Modify sessions/complete route:
   - After session completes, call updateGardenGrowth(userId)
   - updateGardenGrowth: checks all user's planted, non-dormant plants
   - For each plant: if user's current streak meets the growth requirement for the next stage, advance growth_stage
   - Growth requirements: Stage 1 at streak 3, Stage 2 at streak 7, Stage 3 at streak 14, Stage 4 at streak 30
   - Update garden_plots table

2. Add dormancy logic to updateGardenGrowth:
   - If a plant's last_watered date is 3+ days ago AND growth_stage > 0: set is_dormant = true
   - "Watering" = completing a session (update last_watered on all planted plots when session completes)

3. Create src/app/api/garden/use-item/route.ts:
   - POST: accepts { item_type: 'fertilizer'|'revival_potion', plot_index: number }
   - Fertilizer: advances growth_stage by 1 (max stage 4), deducts 1 fertilizer from garden_items
   - Revival Potion: sets is_dormant = false on the plot, deducts 1 revival_potion
   - Both validate that the user has the item in inventory before using

4. Add item use buttons to GardenPlot on click:
   - Clicking a planted plot opens a small popover/dialog
   - Shows plant name, growth stage, dormancy status
   - If dormant: "Use Revival Potion (X remaining)" button
   - If not dormant and has fertilizer: "Use Fertilizer (X remaining)" button
```

DONE WHEN: Maintain a 3-day streak and see a plant advance from Stage 0 (Seed) to Stage 1 (Sprout).

---

### Day 32 — July 2 (Shard rewards connected to garden)

**FOCUS:** Shards flow from studying into the garden economy.

TASKS:

- Verify the full shard flow: answer correctly → earn shards → spend in Seed Shop → plant appears in garden
- Add shard balance to the sidebar (visible on all pages)
- Award Fertilizer from streak milestones (7 days = 1 fertilizer, 30 days = 3 fertilizer)

CURSOR PROMPT:

```
Task: Complete the shard and item reward economy.
1. Update the sessions/complete route shard awards:
   - Per correct answer: 5 shards (easy), 10 shards (medium), 18 shards (hard)
   - Weak topic bonus: 1.5x multiplier if topic accuracy < 50%
   - Daily goal complete: +50 shards
   - All 3 challenges complete: +75 shards
   
2. Award items from streak milestones in streak update logic:
   - Streak reaches 7: award 1 Fertilizer
   - Streak reaches 14: award 1 Fertilizer + 1 Revival Potion
   - Streak reaches 30: award 3 Fertilizer + 2 Revival Potions

3. Add a persistent ShardBalance component to the dashboard sidebar:
   - Small coin icon + shard count, always visible
   - Animate count increase when shards are earned (brief +X float-up animation)

4. Ensure the Seed Shop deducts shards correctly and shows the updated balance immediately after purchase
```

DONE WHEN: Answer 10 questions, accumulate shards, buy a seed, plant it, see it in the garden grid.

---

### Day 33 — July 3 (Garden Exchange — view other gardens)

**FOCUS:** Students can browse other gardens for inspiration (no rankings).

CURSOR PROMPT:

```
Task: Build the Garden Exchange — a read-only gallery of other students' gardens.
1. Create src/app/api/garden/exchange/route.ts:
   - GET: returns 12 featured gardens — curated selection (for MVP: just the 12 most recently active users who have at least 3 planted plots)
   - Returns for each: user display_name (or anonymous if they haven't set one), plant count, garden snapshot (array of plot stages), highest growth stage plant name
   - Does NOT return: XP, level, streak, readiness scores, or any performance metrics

2. Create src/app/dashboard/garden/exchange/page.tsx:
   - Page title: "Garden Exchange"
   - Subtitle: "Explore gardens from other students. Get inspired."
   - Grid of GardenPreviewCard components (3 columns)

3. Create src/components/garden/GardenPreviewCard.tsx:
   - Shows a mini garden grid (3x3 showing the first 9 plots)
   - Display name (or "Anonymous Grower")
   - Plant count: "X plants growing"
   - "Visit Garden" button (read-only view — for MVP, this can just expand the card)
   - NO ranking numbers, NO XP shown, NO comparison metrics

4. Add "Exchange" link to the garden tab navigation
```

DONE WHEN: The Garden Exchange page loads and shows a grid of other users' gardens.

---

### Day 34 — July 4 (Garden polish + Week 5 buffer)

**FOCUS:** The garden feels complete and cohesive.

TASKS:

1. Add Framer Motion to plant growth stage transitions (fade crossfade when stage advances)
2. Add a "My Garden" header stat: total plants, flourishing plants count, days tending
3. Add empty state for new users: "Plant your first seed to start your garden" with a CTA to the shop
4. Fix any layout issues on mobile for the garden grid
5. Push clean commit

DONE WHEN: The garden tab is something you would want to show someone as a feature, not just a prototype.

---

## WEEK 6 — Stripe Paywall + Question Bank Seeding

### Goal: Paywall logic gates features correctly. Question bank has 100+ cached questions.

---

### Day 35 — July 5 (Stripe integration)

**FOCUS:** Stripe checkout works in test mode.

CURSOR PROMPT:

```
Task: Build Stripe subscription integration in test mode.
1. Create src/lib/stripe/client.ts: Stripe SDK singleton using STRIPE_SECRET_KEY

2. Create src/lib/stripe/plan.ts:
   - getUserPlan(userId: string): Promise<UserPlan> — checks subscriptions table for active subscription
   - isFeatureAllowed(plan: UserPlan, feature: string): boolean
   - FEATURE_GATES: { 'unlimited_questions': 'student', 'full_heatmap': 'student', 'frq_grader': 'student', 'hint_tokens_3': 'student' }

3. Create src/app/api/stripe/checkout/route.ts:
   - POST: accepts { priceId }
   - Creates Stripe checkout session with success_url and cancel_url pointing back to /dashboard
   - Returns { checkoutUrl }

4. Create src/app/api/webhooks/stripe/route.ts:
   - Verifies webhook signature with STRIPE_WEBHOOK_SECRET
   - On checkout.session.completed: create/update subscriptions row, set users.plan = 'student'
   - On customer.subscription.deleted: update subscriptions row status, set users.plan = 'free'

5. Create src/app/dashboard/upgrade/page.tsx:
   - Pricing table: Free vs Student plan comparison
   - Two buttons: "Monthly ($14.99)" and "Annual ($89.99 — save 50%)"
   - Both call the checkout API with the respective price ID
   - Add "Test mode — no real charges" banner at the top

6. Add paywall checks to gated Server Actions:
   - Question generation: check daily limit for free users (10/day)
   - FRQ grader: check plan === 'student'
```

DONE WHEN: Click "Upgrade," go through Stripe test checkout (use card number 4242 4242 4242 4242), return to dashboard, verify users.plan updated to 'student' in Supabase.

---

### Day 36 — July 6 (Free tier limits enforcement)

**FOCUS:** Free tier limits are enforced server-side, not just hidden in the UI.

CURSOR PROMPT:

```
Task: Enforce free tier limits server-side.
1. Add question_count_today and question_count_reset_date to users table
   Reset logic: same pattern as hint tokens — check on each API call

2. Modify /api/questions/generate:
   - Check getUserPlan(userId)
   - If free: check question_count_today >= 10 → return { success: false, error: 'daily_limit_reached', upgrade_url: '/dashboard/upgrade' }
   - If free: increment question_count_today on each successful generation
   - If student: no limit

3. Modify /api/questions/grade (FRQ):
   - If free plan: return { success: false, error: 'feature_requires_upgrade', upgrade_url: '/dashboard/upgrade' }

4. Create src/components/ui/UpgradePrompt.tsx:
   - A card/modal that appears when a limit is hit
   - Two variants: 'daily_limit' and 'feature_locked'
   - Daily limit: "You've used all 10 free questions today. Upgrade for unlimited access."
   - Feature locked: "FRQ grading is available on the Student plan."
   - CTA button: "Upgrade — $14.99/month"
   - Dismiss button (ghost)
```

DONE WHEN: Using a free account, answer 10 questions and verify the 11th triggers the UpgradePrompt.

---

### Day 37 — July 7 (Question bank seeding — AP Stats)

**FOCUS:** 50+ AP Stats questions cached in the database.

TASKS:

1. Build the seed script in /lib/scraper
2. Run it for AP Stats — generate questions across all 7 topic tags at all difficulties
3. Verify questions are in the database

CURSOR PROMPT:

```
Task: Build a question bank seeding script.
Create src/lib/scraper/seed-questions.ts:
- A script (not an API route) that generates questions in batches and stores them in questions_cache
- For each subject and topic combination, generate 5 questions at each difficulty level (easy, medium, hard)
- Use the existing question generation logic from /lib/ai
- Add a 2-second delay between Claude API calls to avoid rate limiting
- Log progress to console: "Generated: ap-stats / probability / hard (3/5)"
- At the end, log total questions generated and total cost estimate

Create src/lib/scraper/run.ts:
- Entry point that calls seed-questions for AP Statistics first
- Accepts a --subject flag to run for a specific subject: npx ts-node src/lib/scraper/run.ts --subject ap-stats

Also create a simple admin check route src/app/api/admin/cache-stats/route.ts:
- Returns: total questions in cache per subject, total per topic, average per difficulty
- Protected: only works if a hardcoded ADMIN_SECRET header matches an env var
```

After Cursor builds this, run: npx ts-node src/lib/scraper/run.ts --subject ap-stats
This will take 20-40 minutes and cost approximately $3-6 in API fees. Let it run.

DONE WHEN: Check Supabase questions_cache table — should have 100+ rows for AP Stats.

---

### Day 38 — July 8 (Question bank seeding — AP Bio + Calc)

**FOCUS:** All three subjects have a seeded question bank.

TASKS:

1. Run the seed script for AP Biology
2. Run the seed script for AP Calculus
3. Verify question quality by reviewing 10 random questions from each subject

DONE WHEN: All three subjects have 100+ cached questions each. Manually review and delete any that seem off.

---

### Day 39 — July 9 (Landing page)

**FOCUS:** A convincing landing page that can be shown to potential users.

CURSOR PROMPT:

```
Task: Build the Crescia landing page at src/app/page.tsx (the root route, not /dashboard).
The landing page should show for non-authenticated users. Authenticated users are redirected to /dashboard.
Sections:
1. Hero: "Study smarter. Watch it grow." — headline. Sub: "AI-powered AP exam prep with a garden that grows as you do." Two CTAs: "Start for free" (primary) and "See how it works" (ghost, scrolls to features section). No hero image — clean typographic hero.
2. Features (3 cards): "Exam-accurate questions" / "Know exactly what to study" / "Study that sticks" — each with a brief 2-sentence description. No icons required — clean text cards.
3. Subjects: "Launching with AP Statistics, AP Biology, and AP Calculus. More subjects coming soon."
4. Pricing: simple 2-column comparison (Free vs Student). Matches the upgrade page design.
5. CTA footer: "Start growing today" with sign-up button.
Design rules: no gradients, no hero images, generous whitespace, max-w-4xl centered content. Sage green accents only. Looks like Linear or Vercel's marketing site — not a colorful edtech site.
```

DONE WHEN: The landing page looks professional enough to share with a stranger.

---

### Day 40 — July 10 (Onboarding flow)

**FOCUS:** New users know exactly what to do from the moment they sign up.

CURSOR PROMPT:

```
Task: Build the onboarding flow for new users.
Trigger: user has 0 sessions completed (checked on first /dashboard load).
Flow (a step-by-step modal/overlay, can be dismissed):
Step 1: "Welcome to Crescia" — brief intro, "Let's set up your garden." — Next button
Step 2: Subject selection — "Which AP exam are you preparing for?" — 3 subject cards, multi-select allowed — Next button
Step 3: "Here's your Readiness Score" — show 3 scores all at 0 with a brief explanation — "Start studying to grow your score" — "Start my first session" button (navigates to /dashboard/study with the first selected subject)
Store onboarding_complete: boolean on users table. Once complete, never show again.
Also: if user lands on /dashboard and has never studied, show a prominent "Start your first session" empty state instead of the normal dashboard content.
```

DONE WHEN: Create a brand new test account and go through the onboarding without confusion.

---

### Day 41 — July 11 (Week 6 Review + Buffer)

**FOCUS:** Paywall, question bank, landing page, onboarding — all verified.

TASKS:

1. Full test from a new user's perspective (incognito window, new account)
2. Verify Stripe test checkout works end to end
3. Verify free tier limits work correctly
4. Test onboarding flow
5. Push clean commit with a descriptive message

DONE WHEN: You can walk someone through signing up, studying, hitting the paywall, and upgrading — all without errors.

---

## WEEK 7 — Testing, Polish, Beta Prep

### Goal: A product you're proud to show real AP students.

---

### Day 42 — July 12 (Mobile responsiveness)

**FOCUS:** The app is usable on a phone (not perfect, but not broken).

TASKS:

1. Test every major screen on a mobile viewport (Chrome DevTools → toggle device toolbar → iPhone 14)
2. Fix the most broken mobile layouts (usually: sidebar → bottom nav, grid columns, font sizes)
3. Ensure the study session is fully functional on mobile (this is the most critical screen)

CURSOR PROMPT (if needed):

```
Task: Fix mobile layout issues on the study session page.
The current layout breaks on viewports below 640px. Fix:
1. Question card should be full width with p-4 on mobile
2. Answer buttons should have adequate tap target size (min-height 48px)
3. Timer should be more prominent on mobile (larger text)
4. Session summary should be single column on mobile
5. Ensure the submit button is always visible without scrolling
Use Tailwind responsive prefixes (sm:, md:) — do not change desktop layout.
```

DONE WHEN: You can complete a full study session on a mobile viewport without any broken elements.

---

### Day 43 — July 13 (Error handling + edge cases)

**FOCUS:** The app handles failures gracefully.

TASKS:

1. Test what happens when the Anthropic API is slow (add a loading state to question generation)
2. Add error boundaries for the main sections
3. Handle the case where a user tries to study a subject with 0 cached questions
4. Add a "Something went wrong" fallback UI

CURSOR PROMPT:

```
Task: Add graceful error handling throughout the study flow.
1. If question generation API returns an error: show a friendly card "We couldn't load a question — try again" with a Retry button. Do not show the raw error.
2. If FRQ grading times out (>30 seconds): show "Grading is taking longer than usual — your response has been saved. Check back in a moment."
3. Add a loading skeleton to the QuestionCard while a new question is being fetched — should look like the card but with shadcn Skeleton blocks
4. If session save fails: show a toast notification "Session save failed — your progress may not have been recorded" and log the error
5. Add a global error.tsx in src/app that catches uncaught errors with a friendly message and a "Go to dashboard" button
```

DONE WHEN: Kill your internet connection mid-session and verify the app shows a friendly error instead of crashing.

---

### Day 44 — July 14 (Performance — caching and loading)

**FOCUS:** The app feels fast.

TASKS:

1. Add Next.js caching to the topic stats and readiness score API routes (revalidate: 60)
2. Add optimistic UI updates for shard balance changes (update immediately, sync in background)
3. Lazy load the garden grid (it has the most assets)
4. Verify dashboard loads in under 3 seconds on a slow 3G simulation in Chrome DevTools

DONE WHEN: Dashboard home loads under 3 seconds. Study session delivers a first question within 2 seconds (cache hit).

---

### Day 45 — July 15 (Feedback form integration)

**FOCUS:** Real users can report issues and give feedback.

TASKS:

1. Create a free account at tally.so — build a simple feedback form (3 questions: "What's working?", "What's broken?", "What would you add?")
2. Add a "Feedback" button to the dashboard sidebar (bottom, ghost, small)
3. The button opens the Tally form in a new tab or an embedded modal

DONE WHEN: The feedback button works and the form submits successfully.

---

### Day 46 — July 16 (Email notifications — streak reminder)

**FOCUS:** Students get a gentle reminder when their streak is at risk.

TASKS:

1. Create a free account at Resend (resend.com) — free tier: 3,000 emails/month
2. Install: npm install resend
3. Add RESEND_API_KEY to .env.local and Vercel env vars
4. Build a Vercel Cron Job that runs daily at 7pm

CURSOR PROMPT:

```
Task: Build a streak reminder email system.
1. Create src/app/api/cron/streak-reminder/route.ts:
   - Called by Vercel Cron at 19:00 daily
   - Queries Supabase for all users where: streak_count > 0 AND streak_last_date = yesterday (haven't studied today yet)
   - For each: send an email via Resend with subject "Your Crescia streak is at risk 🌱"
   - Email body: plain text, friendly, mentions their current streak count, links to the app
   - Protect the route with a CRON_SECRET header check

2. Add the cron job to vercel.json:
   { "crons": [{ "path": "/api/cron/streak-reminder", "schedule": "0 19 * * *" }] }

3. Add an unsubscribe mechanism: a column email_notifications: boolean (default true) on users table.
   Only send to users where email_notifications = true.
   Add an "Email notifications" toggle to the profile page settings.
```

DONE WHEN: Manually trigger the cron route in the browser and verify an email arrives in your inbox.

---

### Day 47 — July 17 (Get 5 real users)

**FOCUS:** Real people use the product and you collect feedback.

TASKS (not coding today — this is your first real business day):

1. Identify 5 real AP students in your network (friends, Discord, etc.)
2. Create personal accounts for them (or invite them to sign up)
3. Give them all free Student plan access: manually set plan = 'student' in Supabase users table
4. Message each one individually: "I built this AP prep tool — would you spend 20 minutes trying it and tell me what you think? Specifically: do the questions feel like real AP questions?"
5. Set up a follow-up message for 3 days later asking for their feedback

DONE WHEN: 5 real people have accounts and you have at least 2 of them actively using the product.

---

### Day 48 — July 18 (Week 7 Review + Feedback integration)

**FOCUS:** Review feedback from beta users and prioritize fixes.

TASKS:

1. Read all feedback from the 5 beta users carefully
2. Categorize feedback into: (a) bugs to fix now, (b) UX improvements for this week, (c) features to add later
3. Fix category (a) bugs today
4. Update the backlog in a simple BACKLOG.md file

DONE WHEN: All critical bugs from beta users are fixed and deployed.

---

## WEEK 8 — Beta Launch

### Goal: Live, public, and collecting real feedback from strangers.

---

### Day 49 — July 19 (Landing page final polish)

**FOCUS:** Landing page is launch-ready.

TASKS:

1. Add a real email capture for a waitlist (use Tally or a simple Supabase insert)
2. Add a "Beta" badge to the Crescia logo (honest about the current state)
3. Write real copy (not lorem ipsum) for all landing page sections based on what your 5 beta users responded to
4. Add a simple FAQ section (3-4 questions based on what beta users asked)

---

### Day 50 — July 20 (SEO basics)

**FOCUS:** Google can find you.

CURSOR PROMPT:

```
Task: Add basic SEO metadata to Crescia.
1. Update src/app/layout.tsx metadata:
   - title: "Crescia — AP Exam Prep That Grows With You"
   - description: "AI-powered practice questions for AP Statistics, AP Biology, and AP Calculus. Adaptive performance tracking and a garden that grows as you study."
   - openGraph metadata for social sharing

2. Create src/app/sitemap.ts (Next.js sitemap)

3. Add metadata to the landing page specific to AP exam search terms

4. Add a robots.txt via src/app/robots.ts
```

---

### Day 51 — July 21 (Final QA pass)

**FOCUS:** Walk through every feature as a new user and fix anything broken.

TASKS (do ALL of these, in order, in an incognito window):

- Land on the homepage — does it look good?
- Sign up with a new email
- Complete onboarding
- Study 5 AP Stats MCQ questions (untimed)
- Study 5 AP Stats MCQ questions (timed)
- Submit an AP Stats FRQ
- Check profile page — readiness score, heatmap, achievements
- Buy a seed, plant it in the garden
- Check the Garden Exchange
- Hit the free daily limit (10 questions)
- See the upgrade prompt
- Go through Stripe test checkout
- Verify plan upgraded in dashboard
- Check streak counter
- Complete a daily challenge

Fix anything that breaks during this walkthrough before posting publicly.

---

### Day 52 — July 22 (Post to r/APStatistics)

**FOCUS:** First public users.

TASKS:

1. Write your Reddit post. Template:
  - Title: "I built an AP Stats study tool with AI question grading — free beta, looking for feedback"
  - Body: brief description, what makes it different (AI feedback on FRQs, garden that grows as you study), link, honest disclaimer that it's in beta
  - Be genuine — do not oversell. AP students respect honesty.
2. Post to: r/APStatistics, r/APStudents
3. Respond to every comment within 2 hours of posting
4. Do NOT post to multiple subreddits simultaneously — it reads as spam

---

### Day 53 — July 23 (Monitor + respond)

**FOCUS:** Watch what real users do and respond to everything.

TASKS:

1. Check Supabase — how many new sign-ups?
2. Check the feedback form — any submissions?
3. Check Anthropic API dashboard — what's the cost per user so far?
4. Respond to every piece of feedback personally
5. Do NOT add new features today — observe first

---

### Day 54 — July 24 (Discord outreach)

**FOCUS:** Reach AP students where they live.

TASKS:

1. Join AP Students Discord (search "AP Students Discord" — has 100k+ members)
2. Find the study tool sharing channels
3. Post a genuine, non-spammy intro to Crescia with a GIF or screenshot of the garden growing
4. Join 2-3 subject-specific AP Stats Discord servers and share there as well

---

### Day 55 — July 25 (Teacher outreach)

**FOCUS:** The highest-leverage distribution channel.

TASKS:

1. Find the email addresses of 5 AP Statistics teachers (LinkedIn, school websites, College Board AP teacher directory)
2. Send each a personal email (not a template blast):
  - Subject: "Free tool for your AP Stats students — built by a university student"
  - Body: 3 sentences about Crescia, an offer of free Student plan access for their entire class, a link
  - Keep it short — teachers are busy
3. If one teacher says yes: that's potentially 30+ users from one email

---

### Day 56 — July 26 (Week 8 + 2-Month Review)

**FOCUS:** Reflect, measure, and plan the next phase.

TASKS:

1. Pull your key metrics from Supabase:
  - Total sign-ups
  - Day-7 retention rate (users who signed up 7+ days ago and have a session in the last 7 days)
  - Average sessions per user
  - Free → paid conversion rate
  - Most studied subject
  - Most missed topics
2. Compare against your targets from PROJECT_OVERVIEW.md:
  - Day-7 retention target: >30%
  - Session completion rate target: >65%
  - Question realism target: >70%
3. Decide what to build next based on data, not assumptions.
  The most common outcomes at this stage:
  - Retention is low → fix the daily habit loop before adding features
  - Users love it but won't pay → adjust pricing or gating
  - Question quality complaints → spend a week on prompt engineering
  - High engagement → time to add the parent dashboard and more subjects
4. Write a brief 2-month retrospective — what you built, what you learned, what surprised you.

---

## Appendix: Daily Commit Message Template

```
git commit -m "[Week X, Day Y] What you built

- Feature or fix 1
- Feature or fix 2
- Any blockers noted"
```

## Appendix: When You Get Stuck

1. First: read the error message fully. Copy the exact error into Cursor chat.
2. Second: ask Cursor "What is causing this error and how do I fix it?" — paste the relevant file.
3. Third: search the error on Stack Overflow or the relevant docs (Supabase docs, Clerk docs, etc.)
4. Fourth: if stuck more than 45 minutes on one thing — move on, build something else, return fresh.
5. Never spend more than 2 hours on a single bug without taking a break.

## Appendix: Cost Monitoring

Check these weekly:

- Anthropic console: console.anthropic.com → Usage
- Supabase: supabase.com → project → Settings → Usage
- Vercel: vercel.com → project → Analytics (if enabled)

Target: stay under $75/month total until you have paying users.