import Link from "next/link";
import { redirect } from "next/navigation";
import { getSafeAuthSession } from "@/auth";
import AppFrame from "@/components/AppFrame";
import AdminClient from "@/components/AdminClient";

export default async function AdminPage() {
  const session = await getSafeAuthSession();
  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }

  return (
    <AppFrame
      session={session}
      title="Admin Console"
      subtitle="Manage buses and routes for the demo"
    >
      <div className="mb-4">
        <Link className="btn btn-secondary" href="/tracking">
          Back to Dashboard
        </Link>
      </div>
      <AdminClient />
    </AppFrame>
  );
}
