"use server";

import { revalidatePath } from "next/cache";
import {
  completeOnboarding,
  type CompleteOnboardingInput,
} from "@/lib/onboarding/complete-onboarding";

export async function completeOnboardingAction(
  input: CompleteOnboardingInput
) {
  const result = await completeOnboarding(input);

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
  }

  return result;
}
