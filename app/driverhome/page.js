import { redirect } from "next/navigation";
import { getSafeAuthSession } from "@/auth";
import DriverLanding from "@/components/DriverLanding";

export default async function DriverHomePage() {
  const session = await getSafeAuthSession();
  
  // Basic protection: only drivers can see this tech landing
  if (!session) {
    redirect("/login?role=driver");
  }

  if (session.user?.role !== "driver") {
    redirect("/");
  }

  return <DriverLanding session={session} />;
}
