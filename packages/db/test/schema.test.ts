import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createDb } from "../src/index";
import { collectionPages, collections, pages, pageVersions, users } from "../src/schema";

// Each test creates its own user rather than sharing fixture state, since
// storage isolation between `it()` blocks in the same file isn't guaranteed.
async function createTestUser(db: ReturnType<typeof createDb>) {
  const userId = crypto.randomUUID();
  await db.insert(users).values({ id: userId, name: "Test User", email: `${userId}@example.com` });
  return userId;
}

describe("clipnote schema", () => {
  const db = createDb(env.DB);

  it("inserts and selects a page", async () => {
    const userId = await createTestUser(db);

    await db.insert(pages).values({
      id: "page-1",
      userId,
      title: "議事録まとめ",
      content: "<p>hi</p>",
      contentType: "html",
      visibility: "private",
    });

    const [page] = await db.select().from(pages).where(eq(pages.id, "page-1"));

    expect(page?.title).toBe("議事録まとめ");
    expect(page?.visibility).toBe("private");
    expect(page?.createdAt).toBeInstanceOf(Date);
  });

  it("inserts and selects a collection with a page in it", async () => {
    const userId = await createTestUser(db);

    await db.insert(pages).values({
      id: "page-2",
      userId,
      title: "T2",
      content: "c",
      contentType: "markdown",
      visibility: "public",
    });
    await db.insert(collections).values({
      id: "collection-1",
      userId,
      name: "議事録",
      visibility: "public",
    });
    await db.insert(collectionPages).values({
      id: "cp-1",
      collectionId: "collection-1",
      pageId: "page-2",
      sortOrder: 0,
    });

    const rows = await db
      .select({ title: pages.title, sortOrder: collectionPages.sortOrder })
      .from(collectionPages)
      .innerJoin(pages, eq(pages.id, collectionPages.pageId))
      .where(eq(collectionPages.collectionId, "collection-1"));

    expect(rows).toEqual([{ title: "T2", sortOrder: 0 }]);
  });

  it("deleting a page cascades to collection_pages and page_versions but leaves the collection intact", async () => {
    const userId = await createTestUser(db);

    await db.insert(pages).values({
      id: "page-3",
      userId,
      title: "T3",
      content: "c",
      contentType: "html",
      visibility: "private",
    });
    await db.insert(collections).values({
      id: "collection-2",
      userId,
      name: "Collection 2",
      visibility: "private",
    });
    await db.insert(collectionPages).values({
      id: "cp-2",
      collectionId: "collection-2",
      pageId: "page-3",
      sortOrder: 0,
    });
    await db.insert(pageVersions).values({
      id: "version-1",
      pageId: "page-3",
      content: "old content",
      contentType: "html",
      versionNumber: 1,
    });

    await db.delete(pages).where(eq(pages.id, "page-3"));

    const remainingLinks = await db
      .select()
      .from(collectionPages)
      .where(eq(collectionPages.pageId, "page-3"));
    const remainingVersions = await db
      .select()
      .from(pageVersions)
      .where(eq(pageVersions.pageId, "page-3"));
    const [collection] = await db
      .select()
      .from(collections)
      .where(eq(collections.id, "collection-2"));

    expect(remainingLinks).toHaveLength(0);
    expect(remainingVersions).toHaveLength(0);
    expect(collection).toBeDefined();
  });

  it("deleting a collection removes collection_pages but leaves the page intact", async () => {
    const userId = await createTestUser(db);

    await db.insert(pages).values({
      id: "page-4",
      userId,
      title: "T4",
      content: "c",
      contentType: "html",
      visibility: "private",
    });
    await db.insert(collections).values({
      id: "collection-3",
      userId,
      name: "Collection 3",
      visibility: "private",
    });
    await db.insert(collectionPages).values({
      id: "cp-3",
      collectionId: "collection-3",
      pageId: "page-4",
      sortOrder: 0,
    });

    await db.delete(collections).where(eq(collections.id, "collection-3"));

    const remainingLinks = await db
      .select()
      .from(collectionPages)
      .where(eq(collectionPages.collectionId, "collection-3"));
    const [page] = await db.select().from(pages).where(eq(pages.id, "page-4"));

    expect(remainingLinks).toHaveLength(0);
    expect(page).toBeDefined();
  });

  it("soft-deleting a page (setting deleted_at) leaves collection_pages and page_versions untouched", async () => {
    const userId = await createTestUser(db);

    await db.insert(pages).values({
      id: "page-trash-1",
      userId,
      title: "T-trash",
      content: "c",
      contentType: "html",
      visibility: "private",
    });
    await db.insert(collections).values({
      id: "collection-trash-1",
      userId,
      name: "Collection Trash",
      visibility: "private",
    });
    await db.insert(collectionPages).values({
      id: "cp-trash-1",
      collectionId: "collection-trash-1",
      pageId: "page-trash-1",
      sortOrder: 0,
    });
    await db.insert(pageVersions).values({
      id: "version-trash-1",
      pageId: "page-trash-1",
      content: "old content",
      contentType: "html",
      versionNumber: 1,
    });

    const deletedAt = new Date();
    await db.update(pages).set({ deletedAt }).where(eq(pages.id, "page-trash-1"));

    const [page] = await db.select().from(pages).where(eq(pages.id, "page-trash-1"));
    const remainingLinks = await db
      .select()
      .from(collectionPages)
      .where(eq(collectionPages.pageId, "page-trash-1"));
    const remainingVersions = await db
      .select()
      .from(pageVersions)
      .where(eq(pageVersions.pageId, "page-trash-1"));

    expect(page?.deletedAt).toBeInstanceOf(Date);
    expect(remainingLinks).toHaveLength(1);
    expect(remainingVersions).toHaveLength(1);

    // 復元（deleted_atをnullに戻す）でも所属・履歴に影響しない。
    await db.update(pages).set({ deletedAt: null }).where(eq(pages.id, "page-trash-1"));
    const [restored] = await db.select().from(pages).where(eq(pages.id, "page-trash-1"));
    expect(restored?.deletedAt).toBeNull();
  });

  it("a new page defaults to deleted_at null (not in trash)", async () => {
    const userId = await createTestUser(db);

    await db.insert(pages).values({
      id: "page-trash-2",
      userId,
      title: "T-not-trashed",
      content: "c",
      contentType: "html",
      visibility: "private",
    });

    const [page] = await db.select().from(pages).where(eq(pages.id, "page-trash-2"));
    expect(page?.deletedAt).toBeNull();
  });

  it("inserts and selects a page with content_type plaintext", async () => {
    const userId = await createTestUser(db);

    await db.insert(pages).values({
      id: "page-5",
      userId,
      title: "会議メモ",
      content: "そのままのメモ",
      contentType: "plaintext",
      visibility: "private",
    });

    const [page] = await db.select().from(pages).where(eq(pages.id, "page-5"));

    expect(page?.contentType).toBe("plaintext");
  });

  it("defaults page_versions.source to 'web' and rejects an invalid value via the CHECK constraint", async () => {
    const userId = await createTestUser(db);

    await db.insert(pages).values({
      id: "page-6",
      userId,
      title: "T6",
      content: "c",
      contentType: "html",
      visibility: "private",
    });
    await db.insert(pageVersions).values({
      id: "version-2",
      pageId: "page-6",
      content: "old content",
      contentType: "html",
      versionNumber: 1,
    });

    const [version] = await db.select().from(pageVersions).where(eq(pageVersions.id, "version-2"));
    expect(version?.source).toBe("web");

    // Raw SQL bypasses Drizzle's TS enum typing, exercising the actual
    // CHECK constraint that guards source in SQLite.
    await expect(
      env.DB.prepare(
        "INSERT INTO page_versions (id, page_id, content, content_type, version_number, source) VALUES (?, ?, ?, ?, ?, ?)",
      )
        .bind("version-invalid", "page-6", "c", "html", 2, "cli")
        .run(),
    ).rejects.toThrow();
  });

  it("rejects an invalid content_type value at the DB level via the CHECK constraint", async () => {
    const userId = await createTestUser(db);

    // Raw SQL bypasses Drizzle's TS enum typing, exercising the actual
    // CHECK constraint that guards content_type in SQLite.
    await expect(
      env.DB.prepare(
        "INSERT INTO pages (id, user_id, title, content, content_type, visibility) VALUES (?, ?, ?, ?, ?, ?)",
      )
        .bind("page-invalid", userId, "T", "c", "pdf", "private")
        .run(),
    ).rejects.toThrow();
  });
});
