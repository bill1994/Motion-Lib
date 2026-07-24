import React, { useRef, useEffect } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import gsap from "gsap";

const C = {
  su: { cd: 0.6, sg: 0.05, es: "back.out(1.7)", sd: 0.5, se: "power4.out", sp: "-=0.3" },
  f3: { cd: 0.5, sg: 0.04, es: "back.out(1.7)", spd: 0.25, spe: "power2.out", per: 800 },
  pn: { bd: 0.6, be: "power3.inOut", cd: 0.5, sg: 0.06, ce: "power4.out", cs: 0.15 },
  py: 40, px: 60, gap: 20,   fs: 5,
  sc: { cd: 0.7, sg: 0.04, es: "power2.out" },
  dz: { cd: 1.0, sg: 0, es: "power3.out", blur: 20, scale: 2.5 },
  sh: { cd: 1.2, sg: 0, es: "power2.out", sweepDur: 0.8 },
  jw: { cd: 0.6, sg: 0.06, es: "elastic.out(1, 0.4)", squashDur: 0.12, squashEase: "power2.in" },
  ss: { cd: 0.7, sg: 0.05, es: "power3.inOut" },
} as const;

interface TitleRevealProps {
  text?: string;
  subText?: string;
  children?: React.ReactNode;
  mode: "slideUp" | "flip3d" | "panel" | "scramble" | "depthZoom" | "shimmer" | "jellyWave" | "splitSlide";
  staggerMode?: "sequential" | "random" | "center" | "edges";
  bgColor?: string;
  textColor?: string;
  textShadow?: string;
}

interface W { type: "w"; chars: string[] }
interface S { type: "s" }
type T = W | S;

function tokenize(t: string): T[] {
  const r: T[] = [];
  let cur = "";
  for (const ch of t) {
    if (ch === " ") {
      if (cur) { r.push({ type: "w", chars: [...cur] }); cur = ""; }
      r.push({ type: "s" });
    } else { cur += ch; }
  }
  if (cur) r.push({ type: "w", chars: [...cur] });
  return r;
}

export const TitleReveal: React.FC<TitleRevealProps> = ({
  text = "ZhanWeiFu",
  subText = "",
  children,
  mode,
  staggerMode = "sequential",
  bgColor = "#00d3ff",
  textColor = "#1D1B20",
  textShadow = "0 2px 8px rgba(0,0,0,0.25)",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cr = useRef<HTMLDivElement>(null);
  const tr = useRef<gsap.core.Timeline | null>(null);
  const br = useRef<HTMLDivElement>(null);
  const chrs = useRef<(HTMLSpanElement | null)[]>([]);
  const sprs = useRef<(HTMLSpanElement | null)[]>([]);
  const sir = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const tph = useRef<(HTMLSpanElement | null)[]>([]);
  const bth = useRef<(HTMLSpanElement | null)[]>([]);

  const mref = useRef(mode);
  const sref = useRef(staggerMode);
  const suref = useRef(subText);
  mref.current = mode;
  sref.current = staggerMode;
  suref.current = subText;

  const isFlip = mode === "flip3d";
  const isSplit = mode === "splitSlide";
  const chars = isFlip || isSplit ? [] : [...text];
  const tokens = isFlip ? tokenize(text) : [];
  let cc = isFlip || isSplit ? 0 : chars.length;
  let sc = 0;
  if (isFlip) {
    for (const t of tokens) {
      if (t.type === "w") cc += t.chars.length;
      else sc++;
    }
  }
  chrs.current = chrs.current.slice(0, cc);
  if (isFlip) sprs.current = sprs.current.slice(0, sc);
  const splitCC = [...text].length;
  tph.current = tph.current.slice(0, splitCC);
  bth.current = bth.current.slice(0, splitCC);

  useEffect(() => {
    const m = mref.current;
    const sm = sref.current;
    const st = suref.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      if (m === "panel" && br.current) {
        tl.fromTo(br.current, { scaleX: 0 }, { scaleX: 1, duration: C.pn.bd, ease: C.pn.be }, 0);
      }
      const vc = chrs.current.filter((e): e is HTMLSpanElement => e !== null);
      if (m === "flip3d") {
        if (vc.length > 0) {
          const scfg = sm === "sequential" ? C.f3.sg : { each: C.f3.sg, from: sm };
          tl.fromTo(vc, { rotationX: 90, opacity: 0 }, { rotationX: 0, opacity: 1, duration: C.f3.cd, stagger: scfg, ease: C.f3.es }, 0);
        }
        const vs = sprs.current.filter((e): e is HTMLSpanElement => e !== null);
        if (vs.length > 0) {
          tl.fromTo(vs, { opacity: 0 }, { opacity: 1, duration: C.f3.spd, stagger: C.f3.sg, ease: C.f3.spe }, 0);
        }
      } else if (m === "slideUp" || m === "panel") {
        const cd = m === "slideUp" ? C.su.cd : C.pn.cd;
        const sg = m === "slideUp" ? C.su.sg : C.pn.sg;
        const es = m === "slideUp" ? C.su.es : C.pn.ce;
        const off = m === "slideUp" ? 0 : C.pn.cs;
        if (vc.length > 0) {
          const scfg = sm === "sequential" ? sg : { each: sg, from: sm };
          tl.fromTo(vc, { y: "100%", opacity: 0 }, { y: 0, opacity: 1, duration: cd, stagger: scfg, ease: es }, off);
        }
        if (m === "slideUp" && st && sir.current) {
          tl.fromTo(sir.current, { y: "100%", opacity: 0 }, { y: 0, opacity: 1, duration: C.su.sd, ease: C.su.se }, C.su.sp);
        }
      }
      if (m === "scramble" && vc.length > 0) {
        const scfg = sm === "sequential" ? C.sc.sg : { each: C.sc.sg, from: sm };
        tl.fromTo(vc, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: C.sc.cd, stagger: scfg, ease: C.sc.es }, 0);
      }
      if (m === "depthZoom" && cr.current) {
        tl.fromTo(cr.current, { scale: C.dz.scale, filter: `blur(${C.dz.blur}px)`, opacity: 0 }, { scale: 1, filter: "blur(0px)", opacity: 1, duration: C.dz.cd, ease: C.dz.es }, 0);
      }
      if (m === "shimmer") {
        const tc = shimmerRef.current;
        if (tc) {
          tl.fromTo(tc, { backgroundPosition: "200% 0", color: "transparent" }, { backgroundPosition: "-100% 0", color: textColor, duration: C.sh.sweepDur, ease: "power2.inOut" }, 0);
        }
      }
      if (m === "jellyWave" && vc.length > 0) {
        const scfg = sm === "sequential" ? C.jw.sg : { each: C.jw.sg, from: sm };
        tl.to(vc, { scaleY: 1.6, scaleX: 0.7, duration: C.jw.squashDur, ease: C.jw.squashEase, stagger: scfg }, 0);
        tl.to(vc, { scaleY: 1, scaleX: 1, duration: C.jw.cd, ease: C.jw.es, stagger: scfg }, C.jw.squashDur);
      }
      if (m === "splitSlide") {
        const top = tph.current.filter((e): e is HTMLSpanElement => e !== null);
        const bot = bth.current.filter((e): e is HTMLSpanElement => e !== null);
        if (top.length > 0) {
          const scfg = sm === "sequential" ? C.ss.sg : { each: C.ss.sg, from: sm };
          tl.fromTo(top, { x: "-100%" }, { x: "0%", duration: C.ss.cd, stagger: scfg, ease: C.ss.es }, 0);
          tl.fromTo(bot, { x: "100%" }, { x: "0%", duration: C.ss.cd, stagger: scfg, ease: C.ss.es }, 0);
        }
      }
      tr.current = tl;
    }, cr);
    return () => {
      if (tr.current) { tr.current.kill(); tr.current = null; }
      ctx.revert();
    };
  }, [mode, staggerMode, text, subText, textColor]);

  useEffect(() => {
    if (tr.current) tr.current.seek(frame / fps);
  }, [frame, fps]);

  if (mode === "flip3d") {
    let ci = 0, si = 0;
    return (
      <div ref={cr} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "transparent", fontFamily: '"MapleMono-NF-CN", sans-serif', color: textColor, textShadow: textShadow, perspective: C.f3.per }}>
        <span aria-hidden="true" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", fontSize: `${C.fs}rem`, lineHeight: 1.2, fontWeight: "bold" }}>
          {tokens.map((t, ti) => {
            if (t.type === "s") {
              const idx = si++;
              return <span key={`s-${ti}`} ref={(el) => { sprs.current[idx] = el; }} style={{ display: "inline-block", width: "0.3em" }}>{"\u00A0"}</span>;
            }
            const li = ci;
            ci += t.chars.length;
            return (
              <span key={`w-${ti}`} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                {t.chars.map((ch, i) => {
                  const gi = li + i;
                  return <span key={`c-${gi}`} ref={(el) => { chrs.current[gi] = el; }} style={{ display: "inline-block", transformOrigin: "bottom center" }}>{ch}</span>;
                })}
              </span>
            );
          })}
        </span>
      </div>
    );
  }

  if (mode === "panel") {
    return (
      <div ref={cr} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "transparent", textShadow: textShadow, overflow: "hidden" }}>
        <div ref={br} style={{ position: "absolute", inset: 0, backgroundColor: bgColor, transformOrigin: "left center", transform: "scaleX(0)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: "0 2rem" }}>
          <div style={{ overflow: "hidden", padding: "0.05em 0" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", fontSize: "13vw", lineHeight: 1.15, fontWeight: 700, color: textColor, fontFamily: '"MapleMono-NF-CN", sans-serif' }}>
              {[...text].map((ch, i) => (
                <span key={`${i}-${ch}`} ref={(el) => { chrs.current[i] = el; }} style={{ display: "inline-block", willChange: "transform, opacity" }}>{ch === " " ? "\u00A0" : ch}</span>
              ))}
            </div>
          </div>
          {children && <div style={{ marginTop: "1.5rem", textAlign: "center", color: textColor, fontSize: "1.8rem", opacity: 0.8 }}>{children}</div>}
        </div>
      </div>
    );
  }

  if (mode === "splitSlide") {
    return (
      <div ref={cr} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "transparent", fontFamily: '"MapleMono-NF-CN", sans-serif', color: textColor, textShadow: textShadow, overflow: "visible" }}>
        <div style={{ overflow: "visible", padding: `${C.py}px ${C.px}px` }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", fontSize: `${C.fs}rem`, lineHeight: 1.2, fontWeight: "bold" }}>
            {[...text].map((ch, i) => (
              <span key={`ss-${i}`} style={{ position: "relative", display: "inline-block" }}>
                <span style={{ visibility: "hidden" }}>{ch === " " ? "\u00A0" : ch}</span>
                <span ref={(el) => { tph.current[i] = el; }} style={{ position: "absolute", left: 0, top: 0, clipPath: "inset(0 0 50% 0)", willChange: "transform" }}>{ch === " " ? "\u00A0" : ch}</span>
                <span ref={(el) => { bth.current[i] = el; }} style={{ position: "absolute", left: 0, top: 0, clipPath: "inset(50% 0 0 0)", willChange: "transform" }}>{ch === " " ? "\u00A0" : ch}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isScramble = mode === "scramble";
  const isShimmer = mode === "shimmer";
  const isDepthZoom = mode === "depthZoom";
  const isJellyWave = mode === "jellyWave";

  const POOL = "!<>-_\\/[]{}—=+*^?#%$&";
  const STAGGER = 4;
  const SCRAMBLE = 28;

  return (
    <div ref={cr} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "transparent", fontFamily: '"MapleMono-NF-CN", sans-serif', color: textColor, textShadow: textShadow }}>
      <div style={{ ...(isDepthZoom ? { perspective: "800px" } : {}) }}>
        <div
          ref={shimmerRef}
          style={{
            overflow: "hidden",
            padding: `${C.py}px ${C.px}px`,
            ...(isShimmer ? {
              background: `linear-gradient(135deg, ${textColor} 15%, rgba(255,255,255,0.85) 50%, ${textColor} 85%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              backgroundSize: "200% 100%",
              backgroundPosition: "100% 0",
            } : {}),
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", fontSize: `${C.fs}rem`, lineHeight: 1.2, fontWeight: "bold" }}>
            {[...text].map((ch, i) => {
              let displayChar = ch === " " ? "\u00A0" : ch;
              let charOpacity = 1;
              let charFontFamily: string | undefined;

              if (isScramble && ch !== " ") {
                const startFr = i * STAGGER;
                const settleFr = startFr + SCRAMBLE;
                if (frame < settleFr) {
                  const poolIdx = ((i * 7 + Math.floor(frame / 2)) * 13) % POOL.length;
                  displayChar = POOL[poolIdx];
                  charFontFamily = '"MapleMono-NF-CN", "Courier New", monospace';
                  if (frame < startFr) {
                    charOpacity = 0.15;
                  } else {
                    charOpacity = 0.15 + 0.85 * ((frame - startFr) / SCRAMBLE);
                  }
                }
              }

              return (
                <span
                  key={`${i}-${ch}`}
                  ref={(el) => { chrs.current[i] = el; }}
                  style={{
                    display: "inline-block",
                    ...(charOpacity !== 1 ? { opacity: charOpacity } : {}),
                    ...(charFontFamily ? { fontFamily: charFontFamily } : {}),
                    ...(isJellyWave ? { transformOrigin: "center bottom" } : {}),
                  }}
                >
                  {displayChar}
                </span>
              );
            })}
          </div>
        </div>
        {subText && (
          <div style={{ overflow: "hidden", padding: `0 ${C.px}px`, marginTop: C.gap }}>
            <div ref={sir} style={{ fontSize: "1.5rem", lineHeight: 1.4, fontWeight: "normal", whiteSpace: "nowrap" }}>{subText}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const catalogEntry = {
  name: "TitleReveal",
  category: "typography" as const,
  description: "统一文字揭示动画 — 支持 slideUp / flip3d / panel 三种模式",
  compositions: [
    {
      id: "TitleRevealSlideUp",
      props: { mode: "slideUp" },
      desc: "字符逐字弹性弹入（y:100%→0, back.out）",
    },
    {
      id: "TitleRevealPanel",
      props: { mode: "panel", bgColor: "#00d3ff", textColor: "#ffffff" },
      desc: "背景面板从左展开 + 字符从底部滑入",
    },
    {
      id: "TitleRevealFlip3d",
      props: { mode: "flip3d", staggerMode: "sequential" },
      desc: "字符从底部 3D 翻转显现（rotationX:90→0）",
    },
    {
      id: "TitleRevealScramble",
      props: { mode: "scramble" },
      desc: "字符黑客解密乱码→逐步稳定",
    },
    {
      id: "TitleRevealDepthZoom",
      props: { mode: "depthZoom" },
      desc: "景深推镜缩放+模糊消散",
    },
    {
      id: "TitleRevealShimmer",
      props: { mode: "shimmer" },
      desc: "流光扫影渐变揭示（Apple风格）",
    },
    {
      id: "TitleRevealJellyWave",
      props: { mode: "jellyWave" },
      desc: "字符果冻弹性形变弹入",
    },
    {
      id: "TitleRevealSplitSlide",
      props: { mode: "splitSlide" },
      desc: "字符上下对切错位滑入拼接",
    },
  ],
  params: {
    text: { type: "string", default: '"ZhanWeiFu"', desc: "显示文字" },
    subText: { type: "string", default: '""', desc: "副标题（仅 slideUp 模式）" },
    mode: { type: "enum", default: '"slideUp"', desc: "动画模式: slideUp | flip3d | panel | scramble | depthZoom | shimmer | jellyWave | splitSlide" },
    staggerMode: { type: "enum", default: '"sequential"', desc: "字符出场顺序（仅 flip3d 模式）" },
    bgColor: { type: "string", default: '"#00d3ff"', desc: "背景面板颜色（仅 panel 模式）" },
    textColor: { type: "string", default: '"#1D1B20"', desc: "文字颜色" },
    textShadow: { type: "string", default: '"0 2px 8px rgba(0,0,0,0.25)"', desc: "文字阴影 (CSS text-shadow)" },
  },
};
