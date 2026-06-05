// Centralized environment variable access with import-time validation.

function requireEnv(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function optionalPublicEnv(value: string | undefined): string | undefined {
  if (!value || value.trim() === "") {
    return undefined;
  }
  return value;
}

export const ANTHROPIC_API_KEY = requireEnv(
  "ANTHROPIC_API_KEY",
  process.env.ANTHROPIC_API_KEY
);

export const SUPABASE_URL = requireEnv(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);

export const SUPABASE_ANON_KEY = requireEnv(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const SUPABASE_SERVICE_ROLE_KEY = requireEnv(
  "SUPABASE_SERVICE_ROLE_KEY",
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const CLERK_WEBHOOK_SECRET = requireEnv(
  "CLERK_WEBHOOK_SECRET",
  process.env.CLERK_WEBHOOK_SECRET
);

export const STRIPE_SECRET_KEY = requireEnv(
  "STRIPE_SECRET_KEY",
  process.env.STRIPE_SECRET_KEY
);

export const STRIPE_WEBHOOK_SECRET = requireEnv(
  "STRIPE_WEBHOOK_SECRET",
  process.env.STRIPE_WEBHOOK_SECRET
);

export const STRIPE_MONTHLY_PRICE_ID = requireEnv(
  "STRIPE_MONTHLY_PRICE_ID",
  process.env.STRIPE_MONTHLY_PRICE_ID
);

export const STRIPE_ANNUAL_PRICE_ID = requireEnv(
  "STRIPE_ANNUAL_PRICE_ID",
  process.env.STRIPE_ANNUAL_PRICE_ID
);

/** Validated only when non-empty; may be undefined in server-only contexts. */
export const NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = optionalPublicEnv(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);
