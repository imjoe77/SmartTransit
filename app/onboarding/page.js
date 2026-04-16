import { redirect } from "next/navigation";
import { getSafeAuthSession } from "@/auth";
import AppFrame from "@/components/AppFrame";
import OnboardingClient from "@/components/OnboardingClient";
import { getOnboardingStatusForSession } from "@/lib/onboarding-helpers";

export default async function OnboardingPage() {
  const session = await getSafeAuthSession();
  if (!session) {
    redirect("/");
  }

  const { role, isOnboarded } = await getOnboardingStatusForSession(session);

  if (role !== "student") {
    redirect("/tracking");
  }

  if (isOnboarded) {
    redirect("/tracking");
  }

  return (
    <AppFrame session={session} title="Onboarding" subtitle="Set your profile and preferred route">
      <OnboardingClient />
    </AppFrame>
  );
}
