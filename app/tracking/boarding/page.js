import { redirect } from "next/navigation";
import { getSafeAuthSession } from "@/auth";
import AppFrame from "@/components/AppFrame";
import BoardingFlowClient from "@/components/BoardingFlowClient";

import Script from "next/script";

export default async function BoardingPage() {
  const session = await getSafeAuthSession();
  if (!session || session.user?.role !== "student") {
    redirect("/");
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <BoardingFlowClient session={session} />
    </>
  );
}
