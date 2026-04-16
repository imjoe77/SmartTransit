import { redirect } from "next/navigation";
import { getSafeAuthSession } from "@/auth";
import AdminLanding from "@/components/AdminLanding";

export default async function AdminHomePage() {
  const session = await getSafeAuthSession();
  
  if (!session) {
    redirect("/login?role=admin");
  }

  if (session.user?.role !== "admin") {
    // If a driver or student somehow ends up here
    if (session.user?.role === "driver") redirect("/driverhome");
    if (session.user?.role === "student") redirect("/studenthome");
    redirect("/");
  }

  return <AdminLanding session={session} />;
}
