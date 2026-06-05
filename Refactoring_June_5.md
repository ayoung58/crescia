## RULE 1 — CLIENT/SERVER BOUNDARY
Every file must be clearly one of: Server Component, Client Component, Server Action, 
API Route Handler, or a shared utility. Apply these rules strictly:
- Add 'use client' only to files that use React hooks, browser APIs, or event handlers.
- Add 'use server' only to Server Action files.
- Files with neither directive are Server Components by default — confirm this is 
  intentional for each one.
- Never call the Anthropic API, Supabase service role client, or Stripe secret key 
  from client-side code. If you find any instance of this, move it server-side and 
  flag it in your summary.
- Data fetching for initial page render: use Server Components and pass data as props.
- Data fetching triggered by user interaction: use API routes called from Client 
  Components, or Server Actions.
- Never fetch data in a useEffect when a Server Component could do it instead.

---

## RULE 2 — ENVIRONMENT VARIABLES
Create src/lib/config.ts if it does not exist. This file:
- Imports all environment variables used anywhere in the codebase
- Validates that required server-side variables are non-empty strings at import time
  (throw a clear error like: "Missing required env var: ANTHROPIC_API_KEY")
- Exports typed constants: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, 
  SUPABASE_SERVICE_ROLE_KEY, CLERK_WEBHOOK_SECRET, STRIPE_SECRET_KEY, 
  STRIPE_WEBHOOK_SECRET, STRIPE_MONTHLY_PRICE_ID, STRIPE_ANNUAL_PRICE_ID
- NEXT_PUBLIC_ variables are validated only if non-empty (they may be undefined 
  in server contexts)
- All other files must import from this config file instead of accessing 
  process.env directly. Replace all process.env.X references across the codebase.

---

## RULE 3 — ERROR HANDLING
Standardize all API route handlers to return this exact shape:
  Success: { success: true, data: T }
  Failure: { success: false, error: string, code?: string }

HTTP status codes to use consistently:
  200 — success
  400 — bad request (invalid input)
  401 — unauthenticated (no Clerk session)
  403 — forbidden (authenticated but not authorized, e.g. wrong plan)
  404 — resource not found
  409 — conflict (e.g. username already taken)
  500 — unexpected server error

Rules:
- Never return a raw error object or Error instance in the JSON response.
- Never expose stack traces or Supabase error details to the client.
- Always log the full error server-side with console.error before returning a 500.
- Wrap the entire body of every route handler in a try/catch.
- Use early returns to avoid deeply nested if/else blocks.

---

## RULE 4 — TYPE SAFETY
- No 'any' types anywhere. Replace every instance with a proper type from 
  src/types/index.ts or a locally defined interface.
- No type assertions (as SomeType) unless absolutely unavoidable, and if used, 
  add a comment explaining why.
- All Supabase query results must be typed. Use the pattern:
  const { data, error } = await supabase.from('table').select()
  and type 'data' explicitly.
- No implicit 'any' from untyped function parameters.
- All function signatures must have explicit return types, including async functions 
  (e.g. async function foo(): Promise<Bar>).

---

## RULE 5 — CODE CLARITY AND COMMENTS
Balance brevity with readability. Follow these specific rules:
Comments:
- Add a JSDoc comment to every exported function and component explaining what it 
  does, its parameters, and what it returns. Keep these to 1-3 lines — not novels.
- Add inline comments only when the logic is genuinely non-obvious. Do not comment 
  obvious things like: // increment the count.
- Each file should have a 1-line comment at the very top describing its purpose.
  Example: // Server Action: validates and saves the user's onboarding data.

Ternary operators:
- Use ternary (? :) only for simple single-value assignments or JSX rendering where 
  both branches are short (under ~40 chars each).
- Never use nested ternaries. Use if/else or early returns instead.
- Never use ternary for multi-line blocks.
Variable naming:
- Boolean variables must start with is, has, can, or should (e.g. isLoading, hasError).
- Handler functions in components must start with handle (e.g. handleSubmit, handleSelect).
- API route functions are named GET, POST, PUT, DELETE (Next.js convention).
- No single-letter variable names except loop indices (i, j) and well-known math (x, y).
Avoid:
- Functions longer than 40 lines. If a function exceeds this, extract the logic into 
  named helper functions in the same file.
- Files longer than 200 lines. If a file exceeds this, split into logical sub-files 
  and re-export from an index.ts.
- Repetition: if the same logic appears in 2+ places, extract it into a shared utility.
---
## RULE 6 — CONSTANTS AND MAGIC STRINGS
- No raw string literals for subject slugs, plan names, session statuses, 
  achievement keys, rarity values, or any other enumerated value.
- These must always reference the types and constants defined in src/types/index.ts.
- If a constant is used in multiple files, it lives in types/index.ts or a dedicated 
  src/lib/constants.ts — not defined inline in a component.
- HTTP method strings ('GET', 'POST') are exempt.
---

## RULE 7 — ASYNC AND DATA FETCHING PATTERNS
- Use async/await exclusively. No .then() or .catch() chains anywhere.
- Never mix async/await and .then() in the same file.
- Always destructure Supabase results immediately: 
  const { data, error } = await supabase...
  Never chain .data or .error access without checking for the error first.
- After every Supabase write (insert/update/delete), check the error before 
  assuming success.
- useEffect should never contain data fetching that could be done in a Server 
  Component or via a Server Action.
---
## RULE 8 — REACT COMPONENT STANDARDS
- One component per file. No exceptions.
- Component files are PascalCase. Utility files are camelCase.
- Props interfaces are defined immediately above the component and named 
  [ComponentName]Props.
- Default exports for page components (Next.js requires this).
- Named exports for all other components, hooks, and utilities.
- No inline styles. All styling via Tailwind classes or CSS variables.
- Extract repeated className strings (used in 3+ places) into a local const.
---
## RULE 9 — HOOKS
- Custom hooks live in src/hooks/ and are named useX.
- Each hook has a single, clearly defined responsibility.
- Never put business logic directly in a component — extract to a hook or utility.
- Hooks must clean up side effects (clear intervals, remove event listeners) in 
  the useEffect return function.
