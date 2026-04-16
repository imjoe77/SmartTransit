import { getSafeAuthSession } from "@/auth";

export async function requireSession() {
  const session = await getSafeAuthSession();
  if (!session?.user) {
    return null;
  }
  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();
  if (!session?.user) return null;
  return session.user.role === "admin" ? session : null;
}

export async function requireDriverSession() {
  const session = await requireSession();
  if (!session?.user) return null;
  return session.user.role === "driver" ? session : null;
}

export async function requireStudentSession() {
  const session = await requireSession();
  if (!session?.user) return null;
  return session.user.role === "student" ? session : null;
}
