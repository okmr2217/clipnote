import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb, type Database } from "@clipnote/db";

// D1バインディングはリクエスト時にしか取得できない（WorkerはトップレベルでB
// indingへアクセスできない）ため、getAuth()と同様にisolateの生存期間中だけ
// キャッシュする。d1バインディングそのものは安定した参照でリクエスト固有の
// 状態を持たないため、ラッパーをモジュールスコープでキャッシュしても安全。
let dbInstance: Database | undefined;

export async function getDb() {
  if (dbInstance) return dbInstance;

  const { env } = await getCloudflareContext({ async: true });
  dbInstance = createDb(env.DB);

  return dbInstance;
}
