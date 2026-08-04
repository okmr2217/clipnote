"use client";

import { Link2Icon } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

export function CopyUrlButton({
  uuid,
  path = "p",
  className,
}: {
  uuid: string;
  path?: "p" | "c";
  className?: string;
}) {
  return (
    <CopyButton
      getValue={() => `${window.location.origin}/${path}/${uuid}`}
      label="公開URLをコピー"
      icon={<Link2Icon />}
      className={className}
    />
  );
}
