import { getServerSession, type AuthOptions, type DefaultSession } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "./lib/db/mongodb";
import { UserModel } from "@/models/User";

// Extend session type for custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      hasCompletedOnboarding: boolean;
    } & DefaultSession["user"];
  }
}

function parseEmailList(value: string | undefined): Set<string> {
  return new Set(
    (value || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  );
}

const adminEmails = parseEmailList(process.env.ADMIN_EMAILS);
const driverEmails = parseEmailList(process.env.DRIVER_EMAILS);

function resolveRole(email: string | null | undefined): "student" | "driver" | "admin" {
  const normalized = `${email || ""}`.toLowerCase();
  
  if (adminEmails.has(normalized)) return "admin";
  if (driverEmails.has(normalized)) return "driver";
  return "student";
}

async function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  return UserModel.findOne({ email: normalized }).lean();
}

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID || "demo-github-id",
      clientSecret:
        process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_SECRET || "demo-github-secret",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "demo-google-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo-google-secret",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "demo-nextauth-secret",
  session: { strategy: "jwt" },
  logger: {
    error(code, metadata) {
      if (
        code === "JWT_SESSION_ERROR" &&
        `${(metadata as any)?.message || ""}`.toLowerCase().includes("decryption operation failed")
      ) {
        return;
      }
      console.error("[next-auth][error]", code, metadata);
    },
  },
  callbacks: {
    async signIn({ user, profile }) {
      try {
        if (!user?.email) return false;

        await connectToDatabase();
        const normalizedEmail = user.email.toLowerCase();
        const role = resolveRole(normalizedEmail);
        
        // Capture image from various possible locations in the OAuth payload
        const imageUrl = user.image || (profile as any)?.picture || (profile as any)?.image || "";

        const basePayload: any = {
          name: user.name || (profile as any)?.name || "",
          email: normalizedEmail,
          role,
        };

        // Only update image if we actually have one from the provider
        if (imageUrl) {
          basePayload.image = imageUrl;
        }

        await UserModel.findOneAndUpdate(
          { email: normalizedEmail },
          {
            $set: basePayload,
            $setOnInsert: {
              studentProfile: {
                rollNumber: "",
                department: "",
                year: null,
                preferredRouteId: null,
                boardingStop: "",
              },
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return true;
      } catch (err) {
        console.error("[next-auth] SignIn callback error:", err);
        return false;
      }
    },
    async jwt({ token, user }) {
      try {
        const email = `${user?.email || token?.email || ""}`.toLowerCase();
        if (!email) return token;

        await connectToDatabase();
        const dbUser: any = await findUserByEmail(email);
        if (!dbUser) {
           if (user) {
             token.userId = user.id;
             token.role = resolveRole(user.email);
             token.name = user.name;
             token.email = user.email;
             token.picture = user.image;
           }
           return token;
        }

        token.userId = dbUser._id.toString();
        token.role = dbUser.role as "student" | "driver" | "admin";
        token.hasCompletedOnboarding = Boolean(dbUser.studentProfile?.preferredRouteId);
        token.name = dbUser.name || token.name;
        token.email = dbUser.email || token.email;
        token.picture = dbUser.image || token.picture;
        return token;
      } catch {
        return token;
      }
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = `${token.userId || ""}`;
        (session.user as any).role = token.role || "student";
        (session.user as any).hasCompletedOnboarding = Boolean(token.hasCompletedOnboarding);
        session.user.email = (token.email as string) || session.user.email;
        session.user.name = (token.name as string) || session.user.name;
        session.user.image = (token.picture as string) || session.user.image;
      }
      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

export async function getSafeAuthSession() {
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}
