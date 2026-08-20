import { pages, users } from "@clipnote/db/schema";
import { and, asc, count, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";

export type OpsUserRow = {
  id: string;
  email: string;
  createdAt: Date;
  clipCount: number;
};

// クリップ数はゴミ箱内（deleted_at IS NOT NULL）を除いた件数。/adminの一覧
// （@/lib/clips.ts）と同じ除外方針。
export async function loadOpsUsers(): Promise<OpsUserRow[]> {
  const db = await getDb();

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      clipCount: count(pages.id),
    })
    .from(users)
    .leftJoin(pages, and(eq(pages.userId, users.id), isNull(pages.deletedAt)))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  return rows;
}

export type OpsPublicClipRow = {
  id: string;
  title: string;
  ownerEmail: string;
  updatedAt: Date;
  viewCount: number;
};

export const OPS_PUBLIC_CLIPS_SORTS = [
  "updated_desc",
  "updated_asc",
  "views_desc",
  "views_asc",
] as const;
export type OpsPublicClipsSort = (typeof OPS_PUBLIC_CLIPS_SORTS)[number];
export const OPS_PUBLIC_CLIPS_DEFAULT_SORT: OpsPublicClipsSort = "updated_desc";

const OPS_PUBLIC_CLIPS_ORDER_BY = {
  updated_desc: desc(pages.updatedAt),
  updated_asc: asc(pages.updatedAt),
  views_desc: desc(pages.viewCount),
  views_asc: asc(pages.viewCount),
} as const;

// 運営向け内部管理画面の「公開クリップ一覧」（design-web.md 4-10節）。全ユーザー
// を横断して公開中（visibility='public'、ゴミ箱内を除く）のクリップとその
// プレビュー数（pages.view_count）を並び替え可能な一覧として返す。既定は
// 更新日時が新しい順。
export async function loadOpsPublicClips(
  sort: OpsPublicClipsSort = OPS_PUBLIC_CLIPS_DEFAULT_SORT,
): Promise<OpsPublicClipRow[]> {
  const db = await getDb();

  return db
    .select({
      id: pages.id,
      title: pages.title,
      ownerEmail: users.email,
      updatedAt: pages.updatedAt,
      viewCount: pages.viewCount,
    })
    .from(pages)
    .innerJoin(users, eq(pages.userId, users.id))
    .where(and(eq(pages.visibility, "public"), isNull(pages.deletedAt)))
    .orderBy(OPS_PUBLIC_CLIPS_ORDER_BY[sort]);
}
