import { redirect } from "next/navigation";
import { getSafeAuthSession } from "@/auth";
import StudentLanding from "@/components/StudentLanding/page";

export default async function StudentHomePage() {
  const session = await getSafeAuthSession();
  
  if (!session) {
    redirect("/login?role=student");
  }

  if (session.user?.role !== "student" && session.user?.role !== "admin") {
    // If a driver somehow ends up here, take them home
    if (session.user?.role === "driver") {
       redirect("/driverhome");
    }
    redirect("/");
  }

  return <StudentLanding session={session} />;
}
