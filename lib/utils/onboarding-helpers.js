import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function getOnboardingStatusForSession(session) {
  const role = session?.user?.role;
  if (role !== "student") {
    return { role, isOnboarded: true };
  }

  const email = `${session?.user?.email || ""}`.trim().toLowerCase();
  if (!email) {
    return { role, isOnboarded: false };
  }

  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ email })
      .select("studentProfile.preferredRouteId")
      .lean();

    return {
      role,
      isOnboarded: Boolean(user?.studentProfile?.preferredRouteId),
    };
  } catch {
    return { role, isOnboarded: false };
  }
}
