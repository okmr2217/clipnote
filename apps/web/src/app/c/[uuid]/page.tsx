import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicCollectionGrid } from "@/components/public/public-collection-grid";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicCollectionHeader } from "@/components/public/public-header";
import { buildPublicMetadata } from "@/lib/public-metadata";
import { loadPublicCollection } from "@/lib/public-access";

const fullDateFormatter = new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric" });

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

  const { collection, ownerName, members } = result;
  const isPublic = collection.visibility === "public";

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <PublicCollectionHeader ownerName={ownerName} />

      <main className="flex-1">
        <section className="mx-auto max-w-[960px] border-b border-border px-4 pt-12 pb-10 md:px-8 md:pt-14">
          <div className="mb-3.5 flex items-center gap-2">
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-primary">
              コレクション
            </span>
            {!isPublic && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-secondary-foreground">
                非公開
              </span>
            )}
          </div>
          <h1 className="mb-4 max-w-[640px] text-[28px] leading-[1.3] font-extrabold tracking-[-0.02em] text-foreground md:text-[38px]">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="mb-5 max-w-[46ch] text-[15px] leading-relaxed font-normal text-secondary-foreground md:text-[16px]">
              {collection.description}
            </p>
          )}
          <div className="flex items-center gap-2.5 text-[12px] font-medium text-muted-foreground md:text-[13px]">
            <span>{members.length}件のクリップ</span>
            <span className="size-[3px] shrink-0 rounded-full bg-muted-foreground opacity-50" />
            <span>{fullDateFormatter.format(collection.updatedAt)} 更新</span>
          </div>
        </section>

        <section className="mx-auto max-w-[960px] px-4 py-10 md:px-8 md:py-12">
          <PublicCollectionGrid members={members} collectionId={collection.id} />
        </section>
      </main>

      <PublicFooter showDescription={false} reportPath={`/c/${uuid}`} />
    </div>
  );
}
