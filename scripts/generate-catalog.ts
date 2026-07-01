import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

interface ParamEntry {
  type: string;
  default?: string;
  desc?: string;
  values?: string[];
}

interface CatalogEntry {
  name: string;
  description: string;
  params: Record<string, ParamEntry>;
}

const SRC = join(__dirname, "..", "src");
const OUTPUT = join(__dirname, "..", ".omo", "animation-catalog.md");

const files = readdirSync(SRC).filter(
  (f) => f.endsWith(".tsx") && f !== "Root.tsx" && f !== "Composition.tsx"
);

const entries: CatalogEntry[] = [];

for (const file of files) {
  const content = readFileSync(join(SRC, file), "utf-8");
  const match = content.match(
    /export const catalogEntry\s*=\s*(\{[\s\S]*?\n\});/
  );
  if (!match) continue;

  try {
    const parsed = new Function(`"use strict"; return (${match[1]})`)();
    if (parsed && parsed.name) entries.push(parsed as CatalogEntry);
  } catch {
    // skip parse errors silently
  }
}

entries.sort((a, b) => a.name.localeCompare(b.name));

const md: string[] = [
  "# 🎪 动画组件目录",
  "",
  "> 此文件由 `npm run update-catalog` 自动生成。**请勿手写修改**。",
  `> 共 ${entries.length} 个组件 · 生成时间: ${new Date().toISOString().slice(0, 10)}`,
  "",
];

for (const entry of entries) {
  md.push(`## ${entry.name}`);
  md.push("");
  md.push(entry.description);
  md.push("");

  const paramNames = Object.keys(entry.params);
  if (paramNames.length > 0) {
    md.push("| 参数 | 类型 | 默认值 | 说明 |");
    md.push("|------|------|--------|------|");

    for (const key of paramNames) {
      const p = entry.params[key];
      const typeStr =
        p.type === "enum" && p.values
          ? `enum: ${p.values.join("\\|")}`
          : p.type;
      const defaultStr = p.default ?? "—";
      const descStr = p.desc ?? "—";
      md.push(`| \`${key}\` | ${typeStr} | ${defaultStr} | ${descStr} |`);
    }
  } else {
    md.push("*(固定效果，无配置参数)*");
  }

  md.push("");
}

md.push("---");
md.push("> 共 " + entries.length + " 个组件");

writeFileSync(OUTPUT, md.join("\n"), "utf-8");
console.log(`✅ Generated ${OUTPUT} with ${entries.length} entries`);
