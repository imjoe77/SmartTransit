"use client";

import { useEffect, useState } from "react";
import AppFrame from "@/components/AppFrame";
import AdminProfile from "@/components/AdminProfile/page";
import { getSafeAuthSession } from "@/auth";

export default function AdminProfilePage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setSession(data);
    };
    fetchSession();
  }, []);

  return (
    <AppFrame session={session}>
      <div className="p-6 lg:p-10">
        <AdminProfile session={session} />
      </div>
    </AppFrame>
  );
}
