import { redirect } from "next/navigation";
import { getSafeAuthSession } from "@/auth";
import AppFrame from "@/components/layout/AppFrame";
import DriverDetails from "@/components/DriverProfile2/DriverDetails";
import DriverMap from "@/components/DriverProfile2/DriverMap";

export default async function DriverProfilePage() {
  const session = await getSafeAuthSession();
  if (!session) {
    redirect("/");
  }

  // Allow only drivers to access this page
  if (session.user?.role !== "driver") {
    redirect("/tracking");
  }

  return (
    <AppFrame session={session}>
      <div className="-mt-24 space-y-0">
        <DriverDetails />
        <DriverMap />
      </div>
    </AppFrame>
  );
}
