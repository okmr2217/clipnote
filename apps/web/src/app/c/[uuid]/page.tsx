import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormatBadge } from "@/components/clips/format-badge";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { buildPublicMetadata } from "@/lib/public-metadata";
import { loadPublicCollection } from "@/lib/public-access";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}): Promise<Metadata> {
  const { uuid } = await params;
  const result = await loadPublicCollection(uuid);

  return buildPublicMetadata({
    isPublic: result?.collection.visibility === "public",
    title: result?.collection.name ?? "Clipnote",
    description: result?.collection.description,
  });
}

export default async function PublicCollectionPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const result = await loadPublicCollection(uuid);
  if (!result) {
    notFound();
  }

  const { collection, members } = result;

  return (
    <div className="flex min-h-full flex-col bg-background">
      <PublicHeader title={collection.name} visibility={collection.visibility} />

      <main className="flex-1">
        <div className="mx-auto max-w-[880px] px-4 py-12 md:px-8 md:py-16">
          {collection.description && (
            <p className="mb-10 text-[15px] leading-relaxed font-medium text-secondary-foreground">
              {collection.description}
            </p>
          )}

          {members.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm font-medium text-muted-foreground">
              公開されているクリップがありません。
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {members.map((member) => (
                <li key={member.id}>
                  <Link
                    href={`/p/${member.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-[var(--shadow-card)] transition-colors hover:border-primary/40"
                  >
                    <FormatBadge contentType={member.contentType} />
                    <span className="truncate text-[15px] font-bold text-foreground">
                      {member.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
