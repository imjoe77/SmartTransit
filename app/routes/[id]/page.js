import Link from "next/link";
import { redirect } from "next/navigation";
import { getSafeAuthSession } from "@/auth";
import AppFrame from "@/components/AppFrame";
import RouteDetailsClient from "@/components/RouteDetailsClient";
import { getOnboardingStatusForSession } from "@/lib/onboarding-helpers";

export default async function RoutePage({ params }) {
  const session = await getSafeAuthSession();
  if (!session) {
    redirect("/");
  }

  const { role, isOnboarded } = await getOnboardingStatusForSession(session);
  if (role === "student" && !isOnboarded) {
    redirect("/onboarding");
  }

  const { id } = await params;

  return (
    <AppFrame session={session} title="Route Details" subtitle={`Route ID: ${id}`}>
      <div className="mb-4">
        <Link className="btn btn-secondary" href="/tracking">
          Back to Dashboard
        </Link>
      </div>
      <RouteDetailsClient routeId={id} />
    </AppFrame>
  );
}
