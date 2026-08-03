import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// proxy.ts already redirects unauthenticated requests based on cookie
// presence alone (no D1 read). This layout does the full validation
// (signature + expiry, backed by a D1 read) that proxy can't cheaply
// do for every request.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
