import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.AUTH_SECRET || "quicktestwala-fallback-secret-at-least-32-chars-long";
const key = new TextEncoder().encode(secretKey);

export interface UserSessionPayload {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  status: "ACTIVE" | "BLOCKED";
}

export async function signToken(payload: UserSessionPayload, expiresIn = "7d"): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as UserSessionPayload;
  } catch {
    return null;
  }
}
