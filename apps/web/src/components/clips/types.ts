export type ClipRow = {
  id: string;
  title: string;
  contentType: "html" | "markdown";
  visibility: "private" | "public";
  updatedAt: Date;
  collections: { id: string; name: string }[];
};

export type CollectionOption = {
  id: string;
  name: string;
  visibility: "private" | "public";
};
