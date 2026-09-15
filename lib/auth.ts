import crypto from "crypto";
import { cookies } from "next/headers";
import { SessionPayload } from "@/types";

const SESSION_COOKIE = "bt_session";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

export function generateMembershipId(): string {
  return `BT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export function encodeSession(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeSession(token: string): SessionPayload | null {
  try {
    return JSON.parse(Buffer.from(token, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
