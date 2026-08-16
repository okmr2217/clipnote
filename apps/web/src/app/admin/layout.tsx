import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminFooter } from "@/components/admin/admin-footer";
import { EmailVerificationBanner } from "@/components/account/email-verification-banner";
import { ToastProvider, Toaster } from "@/components/ui/toast";

// Sole authentication gate for /admin/*. A cookie-presence-only fast path
// (proxy.ts) was removed because @opennextjs/cloudflare does not support
// Next.js 16's Node.js-runtime Proxy; this layout's full session validation
// (signature + expiry, backed by a D1 read) was already the authoritative
// check, so no coverage is lost.
//
// Session-gated content must never be statically prerendered at build time:
// besides being meaningless for per-user content, next build spawns
// parallel workers that would each open their own local D1 connection and
// crash workerd with SQLITE_BUSY. force-dynamic here also covers every
// nested /admin/* page/layout that doesn't set its own dynamic config.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <ToastProvider>
      <div className="flex h-dvh flex-col overflow-hidden">
        <AdminHeader user={{ name: session.user.name, email: session.user.email }} />
        {!session.user.emailVerified && <EmailVerificationBanner email={session.user.email} />}
        <div className="min-h-0 flex-1 overflow-y-auto bg-background">{children}</div>
        <AdminFooter />
      </div>
      <Toaster />
    </ToastProvider>
  );
}
