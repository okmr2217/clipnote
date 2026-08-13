import type { ContentType, UpdateSource } from "@clipnote/pages/validation";

export type ClipRow = {
  id: string;
  title: string;
  contentType: ContentType;
  visibility: "private" | "public";
  pinned: boolean;
  archivedAt: Date | null;
  updatedAt: Date;
  collections: { id: string; name: string }[];
};

export type CollectionOption = {
  id: string;
  name: string;
  visibility: "private" | "public";
};

export type ClipDetail = {
  id: string;
  title: string;
  content: string;
  contentType: ContentType;
  visibility: "private" | "public";
  updatedAt: Date;
  // page_versionsに退避済みの最大version_number + 1（設計書6-5節のモック
  // アップ「現在のバージョン (v5)」の番号）。
  currentVersionNumber: number;
};

export type PageVersionRow = {
  id: string;
  versionNumber: number;
  contentType: ContentType;
  content: string;
  createdAt: Date;
  source: UpdateSource;
};
