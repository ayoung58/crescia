// Server Action: completes onboarding and revalidates dashboard routes.

import { revalidatePath } from "next/cache";

import {
  completeOnboarding,
  type CompleteOnboardingInput,
  type CompleteOnboardingResult,
} from "@/lib/onboarding/complete-onboarding";

/**
 * Server Action wrapper that saves onboarding data and revalidates paths.
 */
export async function completeOnboardingAction(
  input: CompleteOnboardingInput
): Promise<CompleteOnboardingResult> {
  const result = await completeOnboarding(input);

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
  }

  return result;
}
