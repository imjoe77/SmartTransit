import { redirect } from "next/navigation";
import { getSafeAuthSession } from "@/auth";
import DashboardClient from "@/components/DashboardClient";
import { getOnboardingStatusForSession } from "@/lib/onboarding-helpers";

export default async function TrackingPage() {
  const session = await getSafeAuthSession();
  if (!session) {
    redirect("/");
  }

  const { role, isOnboarded } = await getOnboardingStatusForSession(session);
  if (role === "student" && !isOnboarded) {
    redirect("/onboarding");
  }

  return <DashboardClient session={session} />;
}
