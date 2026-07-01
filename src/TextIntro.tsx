import React, { useRef, useEffect } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import gsap from "gsap";

// ================================================================
// 动画参数配置 —— 所有动效参数集中在此，方便后期微调
// ================================================================
const CONFIG = {
  mainCharDuration: 0.6,
  mainStagger: 0.05,
  mainEase: "back.out(1.7)",

  subDuration: 0.5,
  subEase: "power4.out",
  subInsertPos: "-=0.3",

  maskPaddingY: 40,
  maskPaddingX: 60,

  mainFontSize: 5,
  subFontSize: 1.5,
  gap: 20,
} as const;

// ================================================================
// Props
// ================================================================
interface TextIntroProps {
  mainText?: string;
  subText?: string;
}

// ================================================================
// 工具函数：将字符串拆分为独立字符，保留空格
// ================================================================
function splitChars(text: string): string[] {
  return [...text].map((c) => (c === " " ? "\u00A0" : c));
}

// ================================================================
// TextIntro — 高品质文字片头动画
//
// 【GSAP + Remotion 帧同步方案】
//   1. gsap.timeline({ paused: true }) —— 禁止自动播放
//   2. 嵌套在 gsap.context(() => { ... }, containerRef) 内
//      防止 Puppeteer 渲染时内存泄漏和多实例冲突
//   3. 通过 useEffect 每一帧调用 tl.seek(frame / fps)
//      将 GSAP 时间线严格锁定到 Remotion 的当前帧
//   4. 禁止使用 tl.progress() 或百分比驱动 seek
// ================================================================
export const TextIntro: React.FC<TextIntroProps> = ({
  mainText = "ZhanWeiFu",
  subText = "",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const subInnerRef = useRef<HTMLDivElement>(null);

  const chars = splitChars(mainText);

  charRefs.current = charRefs.current.slice(0, chars.length);

  // ================================================================
  // ① 初始化 GSAP 时间线（仅执行一次）
  // ================================================================
  useEffect(() => {
    const tl = gsap.timeline({ paused: true });

    const validChars = charRefs.current.filter(
      (el): el is HTMLSpanElement => el !== null,
    );

    tl.fromTo(
      validChars,
      { y: "100%", opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: CONFIG.mainCharDuration,
        stagger: CONFIG.mainStagger,
        ease: CONFIG.mainEase,
      },
      0,
    );

    if (subText && subInnerRef.current) {
      tl.fromTo(
        subInnerRef.current,
        { y: "100%", opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: CONFIG.subDuration,
          ease: CONFIG.subEase,
        },
        CONFIG.subInsertPos,
      );
    }

    tlRef.current = tl;

    return () => {
      tl.kill();
      tlRef.current = null;
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

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        fontFamily: '"MapleMono-NF-CN", sans-serif',
        color: "#ffffff",
      }}
    >
      <div
        style={{
          overflow: "hidden",
          padding: `${CONFIG.maskPaddingY}px ${CONFIG.maskPaddingX}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            fontSize: `${CONFIG.mainFontSize}rem`,
            lineHeight: 1.2,
            fontWeight: "bold",
          }}
        >
          {chars.map((char, i) => (
            <span
              key={`${i}-${char}`}
              ref={(el) => {
                charRefs.current[i] = el;
              }}
              style={{ display: "inline-block" }}
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      {subText && (
        <div
          style={{
            overflow: "hidden",
            padding: `0 ${CONFIG.maskPaddingX}px`,
            marginTop: CONFIG.gap,
          }}
        >
          <div
            ref={subInnerRef}
            style={{
              fontSize: `${CONFIG.subFontSize}rem`,
              lineHeight: 1.4,
              fontWeight: "normal",
              whiteSpace: "nowrap",
            }}
          >
            {subText}
          </div>
        </div>
      )}
    </div>
  );
};

export const catalogEntry = {
  name: 'TextIntro',
  description: '字符逐字弹性弹入（y:100%→0, back.out）',
  params: {
    mainText: { type: 'string', default: '"ZhanWeiFu"', desc: '主标题文字' },
    subText: { type: 'string', default: '""', desc: '副标题文字' },
    fontSize: { type: 'number', default: '48', desc: '主标题字号（px）' },
    color: { type: 'string', default: '"#1D1B20"', desc: '文字颜色' },
  },
};
