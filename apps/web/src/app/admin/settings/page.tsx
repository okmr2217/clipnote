import type { Metadata } from "next";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { AccountSettings } from "@/components/account/account-settings";

export const metadata: Metadata = {
  title: "アカウント設定 | Clipnote",
};

export default async function SettingsPage() {
  // AdminLayoutが未認証を弾いているため、ここではセッションは存在する前提。
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session!.user;

  return (
    <main className="px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <AccountSettings
          user={{ name: user.name, email: user.email, emailVerified: user.emailVerified }}
        />
      </div>
    </main>
  );
}
