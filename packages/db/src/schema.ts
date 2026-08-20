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

// better-auth-managed schema (design.md 11章 `users`テーブル). Field/table
// names follow better-auth's default core schema (user/session/account/
// verification), with table names pluralized to match this file's naming
// convention; the mapping is configured via `modelName` in apps/web's
// betterAuth() call.
export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  ...timestamps,
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: id(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: id(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (table) => [index("accounts_user_id_idx").on(table.userId)],
);

export const verifications = sqliteTable("verifications", {
  id: id(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ...timestamps,
});

// better-authのrateLimitプラグイン設定（storage: "database"）用のテーブル
// （src/lib/auth.tsのbetterAuth()参照）。Cloudflare Workersはリクエストごと
// にisolateが再利用されるとは限らずstorage: "memory"（既定）ではカウントが
// 揮発するため、D1に永続化する必要がある（サインアップの悪用対策）。
export const rateLimits = sqliteTable("rate_limits", {
  id: id(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  // better-authのrate-limiterはlastRequestをDate.now()由来の生のミリ秒数値
  // として読み書きし、数値比較（now - data.lastRequest等）に使う。mode:
  // "timestamp_ms"にするとDrizzleがDateオブジェクトへ変換してしまい、
  // better-auth側の数値演算と型が噛み合わずリクエストのたびに例外になる
  // （/login含む全認証エンドポイントが500になる原因）。
  lastRequest: integer("last_request").notNull(),
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
    contentType: text("content_type", { enum: ["html", "markdown", "plaintext"] }).notNull(),
    visibility: text("visibility", { enum: ["private", "public"] })
      .notNull()
      .default("private"),
    pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
    archivedAt: integer("archived_at", { mode: "timestamp" }),
    // ゴミ箱機能（docs/design-trash.md）。非nullなら論理削除済み。物理削除
    // （page_versions・collection_pagesのカスケード削除含む）は30日後の自動
    // パージ、または「完全に削除」操作でのみ発生する。
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
    // 公開ページ（/p/[uuid]）の閲覧数（design-web.md 4-10節）。visibilityが
    // publicの間、所有者以外の閲覧のみカウントする。private時代の蓄積値は
    // 再公開後も引き継ぐ（履歴として扱う）。
    viewCount: integer("view_count").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("pages_user_id_idx").on(table.userId),
    check(
      "pages_content_type_check",
      sql`${table.contentType} in ('html', 'markdown', 'plaintext')`,
    ),
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
    // 公開コレクション（/c/[uuid]）の閲覧数（design-web.md 4-10節）。pages
    // と同じ方針：publicの間、所有者以外の閲覧のみカウントする。
    viewCount: integer("view_count").notNull().default(0),
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
    contentType: text("content_type", { enum: ["html", "markdown", "plaintext"] }).notNull(),
    versionNumber: integer("version_number").notNull(),
    // このスナップショットを退避させた更新操作の実行元（設計書v13 9章）。
    // 既存行（この列の追加以前に作られたもの）は実際の実行元が不明なため、
    // マイグレーションで一律'web'を補完している。
    source: text("source", { enum: ["web", "api_key", "oauth"] }).notNull().default("web"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("page_versions_page_id_idx").on(table.pageId),
    unique("page_versions_page_id_version_number_unique").on(table.pageId, table.versionNumber),
    check(
      "page_versions_content_type_check",
      sql`${table.contentType} in ('html', 'markdown', 'plaintext')`,
    ),
    check("page_versions_source_check", sql`${table.source} in ('web', 'api_key', 'oauth')`),
  ],
);

// MCPのOAuth 2.1認可サーバー機能（@better-auth/oauth-provider + jwtプラグイン、
// 設計書4-7節・13章）が管理する5テーブル。apps/webのbetterAuth()インスタンス
// のみが読み書きし、apps/mcpはJWKS経由でアクセストークン（JWT）を検証する
// だけなのでこれらのテーブルには一切触れない。フィールド構成・カラム型
// （created_at/updated_at等がミリ秒精度でNOT NULL制約を持たない点も含む）は
// 手書きではなく`@better-auth/cli generate`が1.6.26向けに出力したものをその
// まま採用している（プラグイン側の挿入コードが前提とする形と食い違うと
// 認可フローが壊れるため）。
export const jwks = sqliteTable("jwks", {
  id: id(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
});

export const oauthClients = sqliteTable(
  "oauth_clients",
  {
    id: id(),
    clientId: text("client_id").notNull().unique(),
    clientSecret: text("client_secret"),
    disabled: integer("disabled", { mode: "boolean" }).default(false),
    skipConsent: integer("skip_consent", { mode: "boolean" }),
    enableEndSession: integer("enable_end_session", { mode: "boolean" }),
    subjectType: text("subject_type"),
    // SQLiteに配列型がないため、text()のJSONモード（drizzle-orm/sqlite-core）
    // でJSON文字列として保持する。
    scopes: text("scopes", { mode: "json" }).$type<string[]>(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
    name: text("name"),
    uri: text("uri"),
    icon: text("icon"),
    contacts: text("contacts", { mode: "json" }).$type<string[]>(),
    tos: text("tos"),
    policy: text("policy"),
    softwareId: text("software_id"),
    softwareVersion: text("software_version"),
    softwareStatement: text("software_statement"),
    redirectUris: text("redirect_uris", { mode: "json" }).notNull().$type<string[]>(),
    postLogoutRedirectUris: text("post_logout_redirect_uris", { mode: "json" }).$type<
      string[]
    >(),
    tokenEndpointAuthMethod: text("token_endpoint_auth_method"),
    grantTypes: text("grant_types", { mode: "json" }).$type<string[]>(),
    responseTypes: text("response_types", { mode: "json" }).$type<string[]>(),
    public: integer("public", { mode: "boolean" }),
    type: text("type"),
    requirePKCE: integer("require_pkce", { mode: "boolean" }),
    referenceId: text("reference_id"),
    metadata: text("metadata", { mode: "json" }),
  },
  (table) => [index("oauth_clients_user_id_idx").on(table.userId)],
);

export const oauthRefreshTokens = sqliteTable(
  "oauth_refresh_tokens",
  {
    id: id(),
    token: text("token").notNull().unique(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClients.clientId, { onDelete: "cascade" }),
    sessionId: text("session_id").references(() => sessions.id, { onDelete: "set null" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }),
    revoked: integer("revoked", { mode: "timestamp_ms" }),
    authTime: integer("auth_time", { mode: "timestamp_ms" }),
    scopes: text("scopes", { mode: "json" }).notNull().$type<string[]>(),
  },
  (table) => [
    index("oauth_refresh_tokens_client_id_idx").on(table.clientId),
    index("oauth_refresh_tokens_session_id_idx").on(table.sessionId),
    index("oauth_refresh_tokens_user_id_idx").on(table.userId),
  ],
);

export const oauthAccessTokens = sqliteTable(
  "oauth_access_tokens",
  {
    id: id(),
    // JWTモードではアクセストークン自体はステートレスに検証されるため、
    // このカラムは主に監査・失効管理用（値が無いケースもある）。
    token: text("token").unique(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClients.clientId, { onDelete: "cascade" }),
    sessionId: text("session_id").references(() => sessions.id, { onDelete: "set null" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    refreshId: text("refresh_id").references(() => oauthRefreshTokens.id, {
      onDelete: "cascade",
    }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }),
    scopes: text("scopes", { mode: "json" }).notNull().$type<string[]>(),
  },
  (table) => [
    index("oauth_access_tokens_client_id_idx").on(table.clientId),
    index("oauth_access_tokens_session_id_idx").on(table.sessionId),
    index("oauth_access_tokens_user_id_idx").on(table.userId),
    index("oauth_access_tokens_refresh_id_idx").on(table.refreshId),
  ],
);

export const oauthConsents = sqliteTable(
  "oauth_consents",
  {
    id: id(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClients.clientId, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    scopes: text("scopes", { mode: "json" }).notNull().$type<string[]>(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    index("oauth_consents_client_id_idx").on(table.clientId),
    index("oauth_consents_user_id_idx").on(table.userId),
  ],
);

export const apiKeys = sqliteTable(
  "api_keys",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull().unique(),
    keyPrefix: text("key_prefix").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  },
  (table) => [index("api_keys_user_id_idx").on(table.userId)],
);
