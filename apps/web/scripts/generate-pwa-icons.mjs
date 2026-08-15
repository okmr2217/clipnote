// PWA用アイコンの生成スクリプト。
// 現状は仮アイコン（正式デザインができ次第 public/icons 配下を差し替える）。
// 実行: node scripts/generate-pwa-icons.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ImageResponse } = require("next/og");
const React = require("react");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
const outDir = path.join(webRoot, "public", "icons");
const appDir = path.join(webRoot, "src", "app");

const BG = "#2B2320";
const ACCENT = "#C1503A";
const FG = "#E4C4B4";

const h = React.createElement;

function mark({ size, padding = 0 }) {
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BG,
      },
    },
    h(
      "div",
      {
        style: {
          width: `${100 - padding * 2}%`,
          height: `${100 - padding * 2}%`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: size * 0.18,
          background: ACCENT,
        },
      },
      h(
        "span",
        {
          style: {
            fontSize: size * (1 - padding / 100) * 0.5,
            fontWeight: 700,
            color: FG,
            fontFamily: "sans-serif",
            lineHeight: 1,
          },
        },
        "C",
      ),
    ),
  );
}

const targets = [
  // Web App Manifest（manifest.ts）から参照するアイコン
  { dir: outDir, name: "icon-192.png", size: 192, padding: 0 },
  { dir: outDir, name: "icon-512.png", size: 512, padding: 0 },
  // maskableはOS側で外周を切り抜くため、セーフゾーン（中心80%）に収まるよう余白を持たせる
  { dir: outDir, name: "maskable-icon-512.png", size: 512, padding: 12 },
  // Next.jsの`apple-icon`ファイル規約（app直下）。<link rel="apple-touch-icon">を自動生成する
  { dir: appDir, name: "apple-icon.png", size: 180, padding: 0 },
];

await mkdir(outDir, { recursive: true });

for (const { dir, name, size, padding } of targets) {
  const element = mark({ size, padding });
  const response = new ImageResponse(element, { width: size, height: size });
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(dir, name), buffer);
  console.log(`wrote ${path.join(path.basename(dir), name)}`);
}
