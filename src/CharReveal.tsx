import React, { useRef, useEffect } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import gsap from "gsap";

// ================================================================
// 动画参数配置 —— 所有动效参数集中在此，方便后期微调
// ================================================================
const CONFIG = {
  /** 每个字符翻转动画时长（秒） */
  charDuration: 0.5,
  /** 字符间延迟（秒），产生 wave 逐字效果 */
  stagger: 0.04,
  /** 缓动函数 —— back.out 产生微幅过冲弹性感 */
  ease: "back.out(1.7)",
  /** 3D perspective 值（px），控制翻转时的纵深透视强度 */
  perspective: 800,
  /** 文字字号（rem） */
  fontSize: 5,
  /** 行高 */
  lineHeight: 1.2,
  /** 单词间距占用的相对宽度（em） */
  wordSpacing: 0.3,
} as const;

// ================================================================
// Props
// ================================================================
interface CharRevealProps {
  /** 要显示的文本（支持多词，自动逐字拆分） */
  text?: string;
  /** 字符出场顺序: "sequential" (默认, 从左到右) | "random" | "center" | "edges" */
  staggerMode?: "sequential" | "random" | "center" | "edges";
}

// ================================================================
// 工具类型
// ================================================================
interface WordToken {
  type: "word";
  chars: string[];
}

interface SpaceToken {
  type: "space";
}

type Token = WordToken | SpaceToken;

/**
 * 将文本拆分为字符级 tokens
 * - 每段连续文字 → WordToken（含 char 数组）
 * - 每个空格 → SpaceToken
 * - 连续多个空格各自独立，保持精确间距
 */
function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let current = "";

  for (const ch of text) {
    if (ch === " ") {
      if (current) {
        tokens.push({ type: "word", chars: [...current] });
        current = "";
      }
      tokens.push({ type: "space" });
    } else {
      current += ch;
    }
  }

  if (current) {
    tokens.push({ type: "word", chars: [...current] });
  }

  return tokens;
}

// ================================================================
// CharReveal — 逐字符底部翻转显现动画
//
// 【GSAP + Remotion 帧同步方案】
//   1. gsap.timeline({ paused: true }) —— 禁止自动播放
//   2. 嵌套在 gsap.context(() => { ... }, containerRef) 内
//      防止 Puppeteer 渲染时内存泄漏和多实例冲突
//   3. 通过 useEffect 每一帧调用 tl.seek(frame / fps)
//      将 GSAP 时间线严格锁定到 Remotion 的当前帧
//   4. 所有字符使用 rotationX + transformOrigin: bottom center
//      实现从底部翻转直立的 3D 效果
//   5. 空格字符不做 rotationX 动画，仅通过 opacity 淡入
// ================================================================
export const CharReveal: React.FC<CharRevealProps> = ({
  text = "ZHanWeiFU",
  staggerMode = "sequential",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const spaceRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const tokens = tokenize(text);

  // ---- 统计 word char 数量和 space 数量 ----
  let charCount = 0;
  let spaceCount = 0;

  for (const t of tokens) {
    if (t.type === "word") {
      charCount += t.chars.length;
    } else {
      spaceCount++;
    }
  }

  charRefs.current = charRefs.current.slice(0, charCount);
  spaceRefs.current = spaceRefs.current.slice(0, spaceCount);

  // ================================================================
  // ① 初始化 GSAP 时间线（仅执行一次）
  // ================================================================
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      // ---- 字符翻转动画 ----
      const validChars = charRefs.current.filter(
        (el): el is HTMLSpanElement => el !== null,
      );

      if (validChars.length > 0) {
        const staggerConfig =
          staggerMode === "sequential"
            ? CONFIG.stagger
            : { each: CONFIG.stagger, from: staggerMode };

        tl.fromTo(
          validChars,
          { rotationX: 90, opacity: 0 },
          {
            rotationX: 0,
            opacity: 1,
            duration: CONFIG.charDuration,
            stagger: staggerConfig,
            ease: CONFIG.ease,
          },
          0,
        );
      }

      // ---- 空格淡入动画（在字符动画完成后淡入）----
      const validSpaces = spaceRefs.current.filter(
        (el): el is HTMLSpanElement => el !== null,
      );

      if (validSpaces.length > 0) {
        tl.fromTo(
          validSpaces,
          { opacity: 0 },
          {
            opacity: 1,
            duration: CONFIG.charDuration * 0.5,
            stagger: CONFIG.stagger,
            ease: "power2.out",
          },
          0,
        );
      }

      tlRef.current = tl;
    }, containerRef);

    return () => {
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================================================================
  // ② 每一帧驱动 GSAP 时间线
  // ================================================================
  useEffect(() => {
    if (tlRef.current) {
      tlRef.current.seek(frame / fps);
    }
  }, [frame, fps]);

  // ================================================================
  // ③ 渲染
  // ================================================================
  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        fontFamily: '"MapleMono-NF-CN", sans-serif',
        color: "#ffffff",
        perspective: CONFIG.perspective,
      }}
    >
      {/* ---- 屏幕阅读器专用文本 ---- */}
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {text}
      </span>

      {/* ---- 视觉可见文本 ---- */}
      <span
        aria-hidden="true"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          fontSize: `${CONFIG.fontSize}rem`,
          lineHeight: CONFIG.lineHeight,
          fontWeight: "bold",
        }}
      >
        {(() => {
          let charIdx = 0;
          let spaceIdx = 0;

          return tokens.map((token, tokenIdx) => {
            if (token.type === "space") {
              const idx = spaceIdx++;
              return (
                <span
                  key={`space-${tokenIdx}`}
                  ref={(el) => {
                    spaceRefs.current[idx] = el;
                  }}
                  style={{
                    display: "inline-block",
                    width: `${CONFIG.wordSpacing}em`,
                  }}
                >
                  {"\u00A0"}
                </span>
              );
            }

            const chars = token.chars;
            const localCharIdx = charIdx;
            charIdx += chars.length;

            return (
              <span
                key={`word-${tokenIdx}`}
                style={{ display: "inline-block", whiteSpace: "nowrap" }}
              >
                {chars.map((ch, i) => {
                  const globalIdx = localCharIdx + i;
                  return (
                    <span
                      key={`char-${globalIdx}`}
                      ref={(el) => {
                        charRefs.current[globalIdx] = el;
                      }}
                      style={{
                        display: "inline-block",
                        transformOrigin: "bottom center",
                      }}
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
            );
          });
        })()}
      </span>
    </div>
  );
};

export const catalogEntry = {
  name: 'CharReveal',
  description: '字符从底部 3D 翻转显现（rotationX:90→0）',
  params: {
    text: { type: 'string', default: '"ZHanWeiFU"', desc: '显示的文字' },
    staggerMode: { type: 'enum', default: 'sequential', values: ['sequential', 'random', 'center', 'edges'], desc: '字符出场顺序' },
  },
};
