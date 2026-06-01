# Crescia — Setup Guide

# Windows · Solo Developer · May 2026

# Stack: Next.js 14 · TypeScript · Supabase · Clerk · Stripe · Anthropic API · Vercel

---

## Prerequisites Checklist

Before starting, confirm you have these installed:

- Node.js v18+ → verify with: node --version
- Git → verify with: git --version
- npm → verify with: npm --version
- VS Code or Cursor (use Cursor as primary IDE)
- GitHub account at github.com

If Node.js is below v18, download the latest LTS from nodejs.org.

---

## PART 1 — Accounts to Create

Create these accounts first before touching any code.
All are free at the level you need.

### 1.1 Supabase

1. Go to supabase.com → click "Start your project"
2. Sign up with GitHub (recommended — one less password)
3. Once in the dashboard, click "New Project"
4. Name it: crescia
5. Set a strong database password → SAVE THIS SOMEWHERE SAFE (you will need it later)
6. Region: choose US East (closest to your likely user base)
7. Click "Create new project" → wait ~2 minutes for it to provision
8. When ready, go to Project Settings → API
9. Copy and save these three values:
  - Project URL (looks like: [https://xxxx.supabase.co](https://xxxx.supabase.co))
  - anon public key (long JWT string)
  - service_role key (longer JWT string — keep this private, never expose client-side)

### 1.2 Clerk

1. Go to clerk.com → click "Start building for free"
2. Sign up with GitHub
3. Click "Create application"
4. Application name: Crescia
5. Sign-in options: enable Email and Google
6. Click "Create application"
7. You will land on the API Keys page automatically
8. Copy and save:
  - Publishable Key (starts with pk_test_)
  - Secret Key (starts with sk_test_)
9. In the left sidebar, go to JWT Templates
10. Click "New template" → choose Supabase
11. Name it: supabase
12. Copy the JWKS Endpoint URL shown — save it (needed for Supabase config)
13. Click Save
14. Now go to Webhooks in the left sidebar
15. Click "Add Endpoint"
16. URL: leave blank for now (you will fill this in after deploying to Vercel)
17. Subscribe to events: check user.created and user.deleted
18. Click Create → copy the Signing Secret shown → save it as CLERK_WEBHOOK_SECRET

### 1.3 Anthropic API

1. Go to console.anthropic.com
2. Sign up with email
3. Go to Settings → Billing → add a payment method
4. Set a monthly spend limit: $75 (protects against runaway costs)
5. Go to API Keys → click "Create Key"
6. Name: crescia-dev
7. Copy the key immediately — it is only shown once
8. Save it as ANTHROPIC_API_KEY

### 1.4 Stripe

1. Go to stripe.com → click "Start now"
2. Sign up with email
3. Complete the basic onboarding (you can skip business details for now — test mode works without them)
4. Make sure the toggle in the top right says "Test mode" (orange label) — leave it here
5. Go to Developers → API Keys
6. Copy and save:
  - Publishable key (starts with pk_test_)
  - Secret key (starts with sk_test_)
7. Go to Products → click "Add product"
8. Create Product 1:
  - Name: Crescia Student Monthly
  - Price: $14.99, recurring, monthly
  - Click Save → copy the Price ID (starts with price_)
9. Create Product 2:
  - Name: Crescia Student Annual
  - Price: $89.99, recurring, yearly
  - Click Save → copy the Price ID
10. Save both Price IDs — you will add them to your .env file

### 1.5 Vercel

1. Go to vercel.com → click "Sign Up"
2. Sign up with GitHub
3. Do NOT create a project yet — you will do this after setting up the local codebase

### 1.6 GitHub

You already have an account. Just make sure you are signed in.

---

## PART 2 — Local Project Setup (Windows)

Open your terminal. Cursor has a built-in terminal (Ctrl + `) — use that.

### 2.1 Create the Next.js Project

```
cd C:\Users\YourName\Documents   # or wherever you keep projects
npx create-next-app@14 crescia --typescript --tailwind --app --src-dir --import-alias "@/*"
cd crescia
```

When prompted:

- Would you like to use ESLint? → Yes
- Would you like to use Tailwind CSS? → Yes (already selected)
- Would you like your code inside a `src/` directory? → Yes
- Would you like to use App Router? → Yes
- Would you like to use Turbopack? → No (more stable without it for now)

### 2.2 Initialize shadcn/ui with Luma Preset

```
npx shadcn@latest init
```

When prompted:

- Which style would you like to use? → select "luma"
- Which color would you like to use as base color? → olive
- Would you like to use CSS variables for colors? → Yes

Then add the core components you will use throughout the project:

```
npx shadcn@latest add button card badge progress tabs dialog sheet input textarea label sonner avatar separator skeleton
```

### 2.3 Install All Dependencies

Run this as one command:

```
npm install @supabase/supabase-js @supabase/ssr @clerk/nextjs@5 @anthropic-ai/sdk stripe @stripe/stripe-js framer-motion recharts lucide-react svix
```

Clerk5 was used to align with next version 14. 

Then install dev dependencies:

```
npm install -D @types/node
```

### 2.4 Create the Folder Structure

Run these commands in order to create all required folders:

```
mkdir src\app\dashboard
mkdir src\app\dashboard\study
mkdir src\app\dashboard\garden
mkdir src\app\dashboard\profile
mkdir src\app\dashboard\subjects
mkdir "src\app\(auth)"
mkdir "src\app\(auth)\sign-in"
mkdir "src\app\(auth)\sign-up"
mkdir src\app\api\webhooks\clerk
mkdir src\app\api\webhooks\stripe
mkdir src\app\api\questions\generate
mkdir src\app\api\questions\grade
mkdir src\app\api\sessions
mkdir src\components\study
mkdir src\components\garden
mkdir src\components\rpg
mkdir src\components\analytics
mkdir src\lib\ai
mkdir src\lib\supabase
mkdir src\lib\stripe
mkdir src\lib\gamification
mkdir src\lib\scraper
mkdir src\types
mkdir src\hooks
```

### 2.5 Create the Environment File

Create a file called .env.local in the root of your project (same level as package.json):

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your_key_here

# Stripe (test mode only)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_id_here
STRIPE_ANNUAL_PRICE_ID=price_your_annual_id_here
```

Fill in all values from Part 1. 

IMPORTANT: Create a .gitignore file (Next.js creates one automatically) and confirm .env.local is listed in it. Never commit this file to GitHub.

### 2.6 Copy the AI Agent Files into the Project

Copy the three files you received earlier into the project root:

- .cursorrules → goes in the root folder (same level as package.json)
- AGENTS.md → goes in the root folder
- PROJECT_OVERVIEW.md → goes in the root folder

### 2.7 Verify the Project Runs

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the default Next.js welcome page. If it loads, your local setup is complete.

---

## PART 3 — GitHub Repository Setup

### 3.1 Create the Repo

1. Go to github.com → click "New repository"
2. Repository name: crescia
3. Set to Private
4. Do NOT initialize with README (you already have local files)
5. Click "Create repository"
6. Copy the remote URL shown (looks like: [https://github.com/yourusername/crescia.git](https://github.com/yourusername/crescia.git))

### 3.2 Push Your Local Project

In your Cursor terminal:

```
git init
git add .
git commit -m "initial setup: next.js, shadcn/ui luma, all dependencies"
git branch -M main
git remote add origin https://github.com/yourusername/crescia.git
git push -u origin main
```

---

## PART 4 — Vercel Deployment

### 4.1 Connect GitHub to Vercel

1. Go to vercel.com → click "Add New Project"
2. Click "Import Git Repository" → select crescia
3. Framework preset: Next.js (auto-detected)
4. Root directory: leave as default
5. Before clicking Deploy, click "Environment Variables"
6. Add every variable from your .env.local file one by one
7. Click "Deploy"
8. Wait ~2 minutes for the first deploy to complete
9. Copy your Vercel deployment URL (looks like: [https://crescia-xyz.vercel.app](https://crescia-xyz.vercel.app))

### 4.2 Update Clerk Webhook URL

1. Go back to clerk.com → Webhooks
2. Find the endpoint you created earlier
3. Update the URL to: [https://your-vercel-url.vercel.app/api/webhooks/clerk](https://your-vercel-url.vercel.app/api/webhooks/clerk)
4. Click Save

### 4.3 Update Stripe Webhook URL (for later when you test payments)

1. Go to stripe.com → Developers → Webhooks
2. Click "Add endpoint"
3. URL: [https://your-vercel-url.vercel.app/api/webhooks/stripe](https://your-vercel-url.vercel.app/api/webhooks/stripe)
4. Events to listen to: checkout.session.completed, customer.subscription.deleted, customer.subscription.updated
5. Click "Add endpoint" → copy the Signing Secret
6. Update STRIPE_WEBHOOK_SECRET in your Vercel environment variables

### 4.4 Verify Deployment

Visit your Vercel URL in a browser. The same Next.js welcome page should appear. If it does, your pipeline is live: local code → GitHub push → Vercel auto-deploy.

---

## PART 5 — Supabase Configuration

### 5.1 Connect Clerk JWT to Supabase

This step allows Supabase to verify Clerk-issued JWTs so your database knows who the logged-in user is.

1. Go to supabase.com → your project → Authentication → Providers
2. Scroll down to "Third Party Auth" or "JWT Settings" (exact label depends on Supabase version)
3. Add the JWKS URL you saved from Clerk (Step 1.2, item 12)
4. Save

If you cannot find this in the UI, go to Project Settings → API → JWT Settings and add the Clerk JWKS endpoint there.

### 5.2 Enable Email Confirmations (Optional for MVP)

Go to Authentication → Email Templates. You can leave defaults for now. Disable "Confirm email" during development so you can sign up without checking email every time:

1. Authentication → Providers → Email → toggle off "Confirm email" temporarily
2. Re-enable this before any real users touch the product.

---

## PART 6 — Question Bank Scraper Setup

The question bank scraper pulls publicly available AP practice questions from sites like College Board, Albert.io, and similar resources to pre-populate your question cache. This runs server-side only, never on user request.

### 6.1 Install Scraper Dependencies

```
npm install puppeteer cheerio axios
npm install -D @types/cheerio
```

Note on Puppeteer on Windows: Puppeteer downloads Chromium automatically on install. This takes a few minutes and ~300MB of disk space. If the install hangs, run:

```
npm install puppeteer --ignore-scripts
npx puppeteer browsers install chrome
```

### 6.2 Account: College Board

- No scraping account needed. College Board's past FRQ PDFs are publicly downloadable.
- URL pattern: apcentral.collegeboard.org/courses/[subject]/exam/past-exam-questions
- You will use axios to download PDFs and a PDF parser to extract question text.
- Install PDF parser: npm install pdf-parse

### 6.3 Account: Albert.io

- Create a free account at albert.io — free tier gives access to a limited question set.
- AP Statistics, AP Biology, and AP Calculus are all available.
- Use your free account credentials in the scraper to authenticate before scraping.
- Important: read Albert.io's Terms of Service. Scrape lightly and cache everything — do not hammer their servers. Rate limit all requests to 1 per 3 seconds minimum.

### 6.4 Scraper Architecture

The scraper lives in /src/lib/scraper. It is NOT called during user sessions. It runs:

- Manually during development (you run it from terminal to seed the database)
- Optionally as a scheduled Vercel Cron Job once per week in production

To run the scraper manually during development:

```
npx ts-node src/lib/scraper/run.ts
```

Ask Cursor to build the scraper module when you reach Week 4 of the timeline. At that point you will have your database tables ready to receive questions.

---

## PART 7 — Local Development Workflow

### Daily Development Loop

```
# Start the dev server
npm run dev

# In a separate terminal, push changes to GitHub (triggers Vercel deploy)
git add .
git commit -m "description of what you built"
git push
```

### Testing Stripe Webhooks Locally

Vercel webhooks only work in production. To test Stripe webhooks on localhost:

1. Install Stripe CLI:
  - Download from: github.com/stripe/stripe-cli/releases
  - Download the Windows .exe, place it somewhere in your PATH
  - Or install via: winget install Stripe.StripeCLI
2. Login: stripe login
3. Forward webhooks to local: stripe listen --forward-to localhost:3000/api/webhooks/stripe
4. Leave this running in a separate terminal while testing payments

### Environment Variables on Vercel

Any time you add a new variable to .env.local:

1. Also add it in Vercel → Project → Settings → Environment Variables
2. Redeploy (push a commit) for it to take effect

---

## PART 8 — Final Verification Checklist

Before writing any feature code, confirm each of these works:

- npm run dev starts without errors
- Visiting localhost:3000 shows the app (not an error page)
- GitHub repo has your initial commit
- Vercel deployment URL shows the app
- .env.local is NOT visible in GitHub (check your repo — it should not appear)
- Supabase project exists and you can access the Table Editor
- Clerk application exists and has Google + Email sign-in enabled
- Anthropic API key created with a $75 spend cap set
- Stripe is in test mode with two products created
- .cursorrules, AGENTS.md, and PROJECT_OVERVIEW.md are in the project root

Once all boxes are checked, you are ready to begin development. Start at Week 1, Day 1 of the timeline document.

---

## Quick Reference: Key URLs


| Service               | Dashboard URL           |
| --------------------- | ----------------------- |
| Supabase              | supabase.com/dashboard  |
| Clerk                 | dashboard.clerk.com     |
| Anthropic             | console.anthropic.com   |
| Stripe                | dashboard.stripe.com    |
| Vercel                | vercel.com/dashboard    |
| Your app (local)      | localhost:3000          |
| Your app (production) | your-project.vercel.app |


