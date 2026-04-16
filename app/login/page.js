import AdminLogin from "@/components/AdminLogin/page";
import DriverLogin from "@/components/DriverLogin/page";
import StudentLogin from "@/components/StudentLogin/page";

export default async function LoginPage({ searchParams }) {
  // In modern Next.js, searchParams is an async promise that should be awaited
  const params = await searchParams;
  const role = params?.role || "student";

  // Render the appropriate login interface based on the role resolved on the server
  if (role === "admin") {
    return <AdminLogin />;
  }

  if (role === "driver") {
    return <DriverLogin />;
  }

  // Fallback to student login
  return <StudentLogin />;
}
