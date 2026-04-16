import { redirect } from "next/navigation";
import { getSafeAuthSession } from "@/auth";
import StudentProfile from "@/components/StudentProfile/page";

export default async function ProfilePage() {
  const session = await getSafeAuthSession();
  if (!session) {
    redirect("/");
  }

  if (session.user?.role !== "student") {
    redirect("/tracking");
  }

  return <StudentProfile />;
}
