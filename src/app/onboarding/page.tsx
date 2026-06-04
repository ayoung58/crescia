import { currentUser } from "@clerk/nextjs/server";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default async function OnboardingPage() {
  const user = await currentUser();

  return (
    <OnboardingFlow
      clerkFirstName={user?.firstName ?? ""}
      clerkLastName={user?.lastName ?? ""}
    />
  );
}
