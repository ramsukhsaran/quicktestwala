import { cookies } from "next/headers";
import { signToken, verifyToken, type UserSessionPayload } from "./jwt";
import { getUserById } from "@/lib/data/store";

export const SESSION_COOKIE_NAME = "quicktestwala_session";

export async function setSessionCookie(payload: UserSessionPayload): Promise<void> {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<UserSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(): Promise<UserSessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized: Authentication required");
  }
  if (session.status === "BLOCKED") {
    throw new Error("Forbidden: Account is suspended");
  }
  try {
    const liveUser = await getUserById(session.id);
    if (liveUser && liveUser.status === "BLOCKED") {
      throw new Error("Forbidden: Account is suspended");
    }
  } catch (err: any) {
    if (err?.message?.includes("Forbidden")) throw err;
  }
  return session;
}

export async function requireAdmin(): Promise<UserSessionPayload> {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    throw new Error("Forbidden: Administrator access required");
  }
  return session;
}
