import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
};

// Placeholder only: better-auth owns the real `users` schema and will
// generate/manage it once the auth adapter is wired up (design.md 12-2).
// This stub exists solely so pages.user_id / collections.user_id have a
// real FK target for local D1 testing in this phase.
export const users = sqliteTable("users", {
  id: id(),
});

export const pages = sqliteTable(
  "pages",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    // Size upper bound (1MB / 1,048,576 bytes, UTF-8) is enforced by the
    // application layer, not the DB (design.md 5-2). D1's row size limit is
    // 2MB, so this leaves headroom for the other columns in the row.
    content: text("content").notNull(),
    contentType: text("content_type", { enum: ["html", "markdown"] }).notNull(),
    visibility: text("visibility", { enum: ["private", "public"] })
      .notNull()
      .default("private"),
    ...timestamps,
  },
  (table) => [
    index("pages_user_id_idx").on(table.userId),
    check("pages_content_type_check", sql`${table.contentType} in ('html', 'markdown')`),
    check("pages_visibility_check", sql`${table.visibility} in ('private', 'public')`),
  ],
);

export const collections = sqliteTable(
  "collections",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    description: text("description"),
    visibility: text("visibility", { enum: ["private", "public"] })
      .notNull()
      .default("private"),
    ...timestamps,
  },
  (table) => [
    index("collections_user_id_idx").on(table.userId),
    check("collections_visibility_check", sql`${table.visibility} in ('private', 'public')`),
  ],
);

export const collectionPages = sqliteTable(
  "collection_pages",
  {
    id: id(),
    collectionId: text("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("collection_pages_collection_id_idx").on(table.collectionId),
    index("collection_pages_page_id_idx").on(table.pageId),
    unique("collection_pages_collection_page_unique").on(table.collectionId, table.pageId),
  ],
);

export const pageVersions = sqliteTable(
  "page_versions",
  {
    id: id(),
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    contentType: text("content_type", { enum: ["html", "markdown"] }).notNull(),
    versionNumber: integer("version_number").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("page_versions_page_id_idx").on(table.pageId),
    unique("page_versions_page_id_version_number_unique").on(table.pageId, table.versionNumber),
    check(
      "page_versions_content_type_check",
      sql`${table.contentType} in ('html', 'markdown')`,
    ),
  ],
);
