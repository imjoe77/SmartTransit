import { redirect } from "next/navigation";
import { getSafeAuthSession } from "@/auth";
import AppFrame from "@/components/AppFrame";
import DriverClient from "@/components/DriverClient";

export default async function DriverPage() {
  const session = await getSafeAuthSession();
  if (!session) {
    redirect("/");
  }

  if (session.user?.role !== "driver") {
    redirect("/tracking");
  }

  return (
    <AppFrame session={session} title="Driver Console" subtitle="Start or end trip and broadcast GPS">
      <DriverClient />
    </AppFrame>
  );
}
