import crypto from "crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "bt_admin";

function hash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return token === hash(process.env.ADMIN_PASSCODE || "");
}

export function verifyAdminPasscode(passcode: string): boolean {
  return passcode === process.env.ADMIN_PASSCODE;
}

export function adminSessionToken(): string {
  return hash(process.env.ADMIN_PASSCODE || "");
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE;
