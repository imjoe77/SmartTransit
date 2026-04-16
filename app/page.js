import { getSafeAuthSession } from "@/auth";
import { redirect } from "next/navigation";
import DefaultLanding from "@/components/DefaultLanding/page";

export default async function Home() {
  const session = await getSafeAuthSession();

  // Redirect authenticated users to their specific dashboards
  if (session?.user?.role === "driver") {
    redirect("/driverhome");
  }
  if (session?.user?.role === "student") {
    redirect("/studenthome");
  }
  if (session?.user?.role === "admin") {
    redirect("/adminhome");
  }

  // Guest view - Professional Landing Page
  return <DefaultLanding />;
}
