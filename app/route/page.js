import { redirect } from "next/navigation";
import { getSafeAuthSession } from "@/auth";
import AppFrame from "@/components/AppFrame";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/models/User";
import { RouteModel } from "@/models/Route";
import TripPlannerClient from "@/components/route/TripPlannerClient";

export default async function RoutePage() {
  const session = await getSafeAuthSession();
  if (!session) redirect("/");

  await connectToDatabase();
  const rawUser = await UserModel.findOne({ email: session.user.email }).lean();
  const user = rawUser ? JSON.parse(JSON.stringify(rawUser)) : null;
  
  const preferredRouteId = user?.studentProfile?.preferredRouteId;
  let route = null;
  if (preferredRouteId) {
    const rawRoute = await RouteModel.findById(preferredRouteId).lean();
    route = rawRoute ? JSON.parse(JSON.stringify(rawRoute)) : null;
  }

  return (
    <div className="min-h-screen">
      <TripPlannerClient user={user} route={route} session={session} />
    </div>
  );
}
