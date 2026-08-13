import { createDb } from "@clipnote/db";
import { purgeExpiredTrash } from "@/lib/trash";
// @ts-expect-error ビルド成果物（`opennextjs-cloudflare build`実行後にのみ
// 生成される）のため、型チェック時には存在しない。wrangler.jsonc の
// `main` をこのファイルに向けることで、Next.jsのfetchハンドラはそのまま
// 維持しつつscheduled()だけを追加する（docs/design-trash.md 6章）。
import handler from "../.open-next/worker.js";

const worker = {
  // Durable Object等、.open-next/worker.jsが追加でexportしている可能性の
  // あるプロパティ（現状の wrangler.jsonc では未使用）も含めてそのまま
  // 引き継ぎ、scheduled()だけをこのファイルで追加する。
  ...handler,

  async scheduled(_controller: ScheduledController, env: CloudflareEnv): Promise<void> {
    const db = createDb(env.DB);
    await purgeExpiredTrash(db);
  },
};

export default worker;
