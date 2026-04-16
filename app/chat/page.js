import { redirect } from "next/navigation";
import { getSafeAuthSession } from "@/auth";
import ChatClient from "@/components/chat/ChatClient";
import { getOnboardingStatusForSession } from "@/lib/onboarding-helpers";

export default async function ChatPage() {
  const session = await getSafeAuthSession();
  if (!session) {
    redirect("/");
  }

  const { role, isOnboarded } = await getOnboardingStatusForSession(session);
  if (role === "student" && !isOnboarded) {
    redirect("/onboarding");
  }

  return <ChatClient session={session} />;
}
