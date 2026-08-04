export type CollectionSummary = {
  id: string;
  name: string;
  description: string | null;
  visibility: "private" | "public";
  updatedAt: Date;
  pageCount: number;
};

export type CollectionDetail = {
  id: string;
  name: string;
  description: string | null;
  visibility: "private" | "public";
  updatedAt: Date;
};

export type CollectionMemberClip = {
  id: string;
  title: string;
  contentType: "html" | "markdown";
  visibility: "private" | "public";
  sortOrder: number;
};

export type ClipOption = {
  id: string;
  title: string;
  contentType: "html" | "markdown";
};
