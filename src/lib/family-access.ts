import { cookies } from "next/headers";
import { auth } from "../../auth";

const FAMILY_COOKIE = "family_access";

export async function hasFamilyAccess(): Promise<boolean> {
  // Admin users always have access
  const session = await auth();
  if (session?.user) return true;

  // Check family cookie
  const cookieStore = await cookies();
  const token = cookieStore.get(FAMILY_COOKIE)?.value;
  return token === "verified";
}
