"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import AdminLogin from "@/components/AdminLogin/page";
import DriverLogin from "@/components/DriverLogin/page";
import StudentLogin from "@/components/StudentLogin/page";

function LoginContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "student";

  // Use the dedicated AdminLogin component when logging in as admin
  if (role === "admin") {
    return <AdminLogin />;
  }

  // Use the dedicated DriverLogin component when logging in as driver
  if (role === "driver") {
    return <DriverLogin />;
  }

  // Fallback to the dedicated StudentLogin for student and any other roles
  return <StudentLogin />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center"><div className="animate-spin rounded-full border-t-2 border-emerald-500 w-8 h-8"></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
