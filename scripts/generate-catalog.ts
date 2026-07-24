import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

interface ParamEntry {
  type: string;
  default?: string;
  desc?: string;
  values?: string[];
}

interface CompositionVariant {
  id: string;
  props: Record<string, string>;
  desc?: string;
}

interface CatalogEntry {
  name: string;
  category: string;
  description: string;
  params?: Record<string, ParamEntry>;
  compositions?: CompositionVariant[];
}

interface DisplayEntry {
  title: string;
  description: string;
  sourceName?: string;
  fixedProps?: Record<string, string>;
  params?: Record<string, ParamEntry>;
  category: string;
  sortName: string;
  sortComp: string;
}

const SRC = join(__dirname, "..", "src");
const OUTPUT = join(__dirname, "..", ".omo", "animation-catalog.md");

const CATEGORY_ORDER: Record<string, number> = {
  typography: 0,
  card: 1,
  entrance: 2,
  transition: 3,
  vfx: 4,
  character: 5,
};

const CATEGORY_DISPLAY: Record<string, string> = {
  typography: "## 🅰️ Typography — 文字动画",
  card: "## 🃏 Card — 卡片动画",
  entrance: "## 🚀 Entrance — 入场展示",
  transition: "## 🔄 Transition — 场景转场",
  vfx: "## ✨ VFX — 视觉特效",
  character: "## 🎭 Character — 角色动画",
};

function findTsxFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTsxFiles(fullPath));
    } else if (
      entry.name.endsWith(".tsx") &&
      entry.name !== "Root.tsx" &&
      entry.name !== "Composition.tsx"
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = findTsxFiles(SRC);

const entries: CatalogEntry[] = [];

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const match = content.match(
    /export const catalogEntry\s*=\s*(\{[\s\S]*?\n\});/
  );
  if (!match) continue;

  try {
    const cleaned = match[1].replace(/\s+as\s+const\b/g, "");
    const parsed = new Function(`"use strict"; return (${cleaned})`)();
    if (parsed && parsed.name) entries.push(parsed as CatalogEntry);
  } catch {
    // skip parse errors silently
  }
}

const displayEntries: DisplayEntry[] = [];

for (const entry of entries) {
  if (entry.compositions && entry.compositions.length > 0) {
    for (const comp of entry.compositions) {
      const filteredParams: Record<string, ParamEntry> = {};
      if (entry.params) {
        for (const [key, val] of Object.entries(entry.params)) {
          if (!(key in comp.props)) {
            filteredParams[key] = val;
          }
        }
      }
      displayEntries.push({
        title: comp.id,
        description: comp.desc ?? entry.description,
        sourceName: entry.name,
        fixedProps: comp.props,
        params:
          Object.keys(filteredParams).length > 0 ? filteredParams : undefined,
        category: entry.category,
        sortName: entry.name,
        sortComp: comp.id,
      });
    }
  } else {
    displayEntries.push({
      title: entry.name,
      description: entry.description,
      params:
        entry.params && Object.keys(entry.params).length > 0
          ? entry.params
          : undefined,
      category: entry.category,
      sortName: entry.name,
      sortComp: "",
    });
  }
}

displayEntries.sort((a, b) => {
  const catA = CATEGORY_ORDER[a.category] ?? 99;
  const catB = CATEGORY_ORDER[b.category] ?? 99;
  if (catA !== catB) return catA - catB;
  if (a.sortName !== b.sortName) return a.sortName.localeCompare(b.sortName);
  return a.sortComp.localeCompare(b.sortComp);
});

const dateStr = new Date().toISOString().slice(0, 10);
const md: string[] = [
  "# 🎪 动画组件目录",
  "",
  "> 此文件由 `npm run update-catalog` 自动生成。**请勿手写修改**。",
  `> 共 ${displayEntries.length} 个 Studio 组合 · 生成时间: ${dateStr}`,
  "",
];

let currentCategory = "";
for (const de of displayEntries) {
  if (de.category !== currentCategory) {
    currentCategory = de.category;
    md.push(CATEGORY_DISPLAY[currentCategory] ?? `## ${currentCategory}`);
    md.push("");
  }

  md.push(`### ${de.title}`);
  md.push("");
  md.push(de.description);
  md.push("");

  if (de.sourceName) {
    const propsStr = Object.entries(de.fixedProps!)
      .map(([k, v]) => `${k}=${v}`)
      .join(", ");
    md.push(`*(来自 ${de.sourceName}, props: ${propsStr})*`);
    md.push("");
  }

  const paramNames = de.params ? Object.keys(de.params) : [];
  if (paramNames.length > 0) {
    md.push("| 参数 | 类型 | 默认值 | 说明 |");
    md.push("|------|------|--------|------|");

    for (const key of paramNames) {
      const p = de.params![key];
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
md.push("> 共 " + displayEntries.length + " 个组件");

writeFileSync(OUTPUT, md.join("\n"), "utf-8");
console.log(`✅ Generated ${OUTPUT} with ${displayEntries.length} entries`);
