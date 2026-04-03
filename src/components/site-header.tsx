import { auth } from "../../auth";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  const session = await auth();

  return <SiteHeaderClient role={session?.user?.role ?? null} />;
}
