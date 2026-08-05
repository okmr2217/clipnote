import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminFooter } from "@/components/admin/admin-footer";
import { EmailVerificationBanner } from "@/components/account/email-verification-banner";

// Sole authentication gate for /admin/*. A cookie-presence-only fast path
// (proxy.ts) was removed because @opennextjs/cloudflare does not support
// Next.js 16's Node.js-runtime Proxy; this layout's full session validation
// (signature + expiry, backed by a D1 read) was already the authoritative
// check, so no coverage is lost.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader user={{ name: session.user.name, email: session.user.email }} />
      {!session.user.emailVerified && <EmailVerificationBanner email={session.user.email} />}
      <div className="flex-1 bg-background">{children}</div>
      <AdminFooter />
    </div>
  );
}
