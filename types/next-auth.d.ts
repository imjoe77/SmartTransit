import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "student" | "driver" | "admin";
      hasCompletedOnboarding: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: "student" | "driver" | "admin";
    hasCompletedOnboarding?: boolean;
  }
}
