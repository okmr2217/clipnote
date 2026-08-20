import { pages, users } from "@clipnote/db/schema";
import { and, asc, count, desc, eq, isNotNull, isNull } from "drizzle-orm";
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
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  archivedAt: Date | null;
};

export const OPS_PUBLIC_CLIPS_STATUSES = ["active", "archived", "all"] as const;
export type OpsPublicClipsStatus = (typeof OPS_PUBLIC_CLIPS_STATUSES)[number];
export const OPS_PUBLIC_CLIPS_DEFAULT_STATUS: OpsPublicClipsStatus = "active";

const OPS_PUBLIC_CLIPS_STATUS_CONDITION = {
  active: isNull(pages.archivedAt),
  archived: isNotNull(pages.archivedAt),
  all: undefined,
} as const;

export const OPS_PUBLIC_CLIPS_SORTS = [
  "created_desc",
  "created_asc",
  "updated_desc",
  "updated_asc",
  "views_desc",
  "views_asc",
] as const;
export type OpsPublicClipsSort = (typeof OPS_PUBLIC_CLIPS_SORTS)[number];
// デフォルトは作成日時が新しい順。
export const OPS_PUBLIC_CLIPS_DEFAULT_SORT: OpsPublicClipsSort = "created_desc";

const OPS_PUBLIC_CLIPS_ORDER_BY = {
  created_desc: desc(pages.createdAt),
  created_asc: asc(pages.createdAt),
  updated_desc: desc(pages.updatedAt),
  updated_asc: asc(pages.updatedAt),
  views_desc: desc(pages.viewCount),
  views_asc: asc(pages.viewCount),
} as const;

// 運営向け内部管理画面の「公開クリップ一覧」（design-web.md 4-10節）。全ユーザー
// を横断して公開中（visibility='public'、ゴミ箱内を除く）のクリップとその
// プレビュー数（pages.view_count）を並び替え可能な一覧として返す。既定は
// 作成日時が新しい順。ownerIdを指定すると、その所有者のクリップのみに絞り込む。
// statusはアーカイブ状態での絞り込み（既定：active＝未アーカイブのみ）。
export async function loadOpsPublicClips(
  sort: OpsPublicClipsSort = OPS_PUBLIC_CLIPS_DEFAULT_SORT,
  ownerId?: string,
  status: OpsPublicClipsStatus = OPS_PUBLIC_CLIPS_DEFAULT_STATUS,
): Promise<OpsPublicClipRow[]> {
  const db = await getDb();

  return db
    .select({
      id: pages.id,
      title: pages.title,
      ownerEmail: users.email,
      createdAt: pages.createdAt,
      updatedAt: pages.updatedAt,
      viewCount: pages.viewCount,
      archivedAt: pages.archivedAt,
    })
    .from(pages)
    .innerJoin(users, eq(pages.userId, users.id))
    .where(
      and(
        eq(pages.visibility, "public"),
        isNull(pages.deletedAt),
        ownerId ? eq(pages.userId, ownerId) : undefined,
        OPS_PUBLIC_CLIPS_STATUS_CONDITION[status],
      ),
    )
    .orderBy(OPS_PUBLIC_CLIPS_ORDER_BY[sort]);
}

export type OpsPublicClipOwner = {
  id: string;
  email: string;
};

// 所有者フィルターの選択肢。公開クリップを1件以上持つ所有者のみを列挙する
// （フィルターしても0件になる選択肢を出さないため）。
export async function loadOpsPublicClipOwners(): Promise<OpsPublicClipOwner[]> {
  const db = await getDb();

  return db
    .selectDistinct({ id: users.id, email: users.email })
    .from(pages)
    .innerJoin(users, eq(pages.userId, users.id))
    .where(and(eq(pages.visibility, "public"), isNull(pages.deletedAt)))
    .orderBy(asc(users.email));
}
