import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";

// =============================================================================
//  ███████ 可调参数区块
// =============================================================================

// -- 文字 --
const MAIN_TEXT = "液态玻璃";
const SUB_TEXT = "液态玻璃 2";
const FONT_FAMILY = "'MapleMono-NF-CN','PingFang SC','Microsoft YaHei',sans-serif";
const FONT_SIZE = 56;
const FONT_COLOR = "#ffffff";

// -- 背景 --
const BG_COLOR = "#0a0c14";
const GRID_COLOR = "rgba(255,255,255,0.04)";
const GRID_SPACING = 60;
const WATERMARK_LINE1 = "我是小菜鸟";
const WATERMARK_LINE2 = "i'm little chicken";
const WATERMARK_COLOR = "rgba(255,255,255,1)";
const WATERMARK_FONT_SIZE = 54;
const WATERMARK_TILE = 300;
const WATERMARK_ANGLE = -45;

// -- 玻璃面板 --
const GLASS_W = 320;
const GLASS_H = 160;

// -- 模糊背景 --
const BLUR_RADIUS = 12;

// -- 分离动画 (用 interpolate 驱动, 无 GSAP) --
const SPLIT_START = 1.5;
const MAIN_OFFSET = 30;
const SUB_OFFSET = 230;
const MAIN_DURATION = 1.0;
const SUB_DURATION = 1.5;
const BOUNCE_AMPLITUDE = 8;
const BOUNCE_DAMPING = 10;
const BOUNCE_FREQ = 14;

// =============================================================================
//  GLSL Shader (Three.js ShaderMaterial, GLSL ES 1.0)
// =============================================================================

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2  u_resolution;
uniform float u_g1y;
uniform float u_g2y;
uniform float u_frame;
uniform float u_fps;
uniform sampler2D u_bg;
uniform sampler2D u_bgBlur;
uniform sampler2D u_text1;
uniform sampler2D u_text2;

varying vec2 vUv;

const float GLASS_W       = 320.0;
const float GLASS_H       = 160.0;
const float CORNER_R      = 20.0;
const float GOOEY_K       = 180.0;
const float EDGE_SOFTNESS = 1.5;
const float REFRACT_STR   = 5.0;
const float CURVATURE     = 0.4;
const float BEVEL_W       = 25.0;
const float SPLIT_TIME    = 1.5;
const float SUB_FADE      = 0.3;
const float FRESNEL_POW   = 2.0;
const float FRESNEL_INT   = 0.4;
const float TINT_A        = 40.0 / 255.0;
const vec3  TINT_COL      = vec3(1.0);
const vec3  FRESNEL_COL   = vec3(0.6, 0.8, 1.0);
const float AO_STRENGTH   = 0.08;
const float AO_DARK       = 0.92;
const vec2  SPEC_LIGHT    = vec2(-0.6, -0.8);
const float SHADOW_DX     = 6.0;
const float SHADOW_DY     = 10.0;
const float SHADOW_RAD    = 16.0;
const float SHADOW_OP     = 0.12;

float sdRoundedRect(vec2 p, vec2 c, vec2 size, float r) {
  vec2 q = abs(p - c) - size * 0.5 + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * h * k / 6.0;
}

float glassSDF(vec2 p, float g1y, float g2y) {
  float cx = u_resolution.x * 0.5;
  float d1 = sdRoundedRect(p, vec2(cx, g1y), vec2(GLASS_W, GLASS_H), CORNER_R);
  float d2 = sdRoundedRect(p, vec2(cx, g2y), vec2(GLASS_W, GLASS_H), CORNER_R);
  return smin(d1, d2, GOOEY_K);
}

void main() {
  vec2 px = vUv * u_resolution;
  vec2 uv = vUv;
  float cx = u_resolution.x * 0.5;

  // ── SDF ──
  float d1 = sdRoundedRect(px, vec2(cx, u_g1y), vec2(GLASS_W, GLASS_H), CORNER_R);
  float d2 = sdRoundedRect(px, vec2(cx, u_g2y), vec2(GLASS_W, GLASS_H), CORNER_R);
  float d  = smin(d1, d2, GOOEY_K);

  vec4 bgColor = texture2D(u_bg, uv);

  if (d > EDGE_SOFTNESS) {
    gl_FragColor = bgColor;
    return;
  }

  // ── subAlpha ──
  float subAlpha = 1.0;
  {
    float splitF = SPLIT_TIME * u_fps;
    subAlpha = u_frame >= splitF ? clamp((u_frame - splitF) / (SUB_FADE * u_fps), 0.0, 1.0) : 0.0;
  }

  // ── 法线：对合并 SDF 做中央差分 + 内部抹平，彻底消灭对角线 seam ──
  float eps = 1.0;
  float dX = glassSDF(px + vec2(eps, 0.0), u_g1y, u_g2y)
           - glassSDF(px - vec2(eps, 0.0), u_g1y, u_g2y);
  float dY = glassSDF(px + vec2(0.0, eps), u_g1y, u_g2y)
           - glassSDF(px - vec2(0.0, eps), u_g1y, u_g2y);
  vec2 grad = vec2(dX, dY) / (2.0 * eps);

  float edgeFactor = smoothstep(-BEVEL_W, 0.0, d);
  vec3 N = normalize(vec3(grad * edgeFactor * CURVATURE * 8.0, 1.0));

  // ── 3 步色散折射 (基于模糊背景) ──
  vec2 baseOffset = N.xy * REFRACT_STR / u_resolution;
  float r = texture2D(u_bgBlur, uv + baseOffset * 1.0).r;
  float g = texture2D(u_bgBlur, uv + baseOffset * 0.5).g;
  float b = texture2D(u_bgBlur, uv - baseOffset * 0.5).b;
  vec3 bgRefracted = vec3(r, g, b);

  // ── 文字：UV 裁剪 + h 守卫（merge 期仅 t1，分离期按面板归属） ──
  vec2 tUv1 = (px - vec2(cx, u_g1y) + vec2(GLASS_W * 0.5, GLASS_H * 0.5)) / vec2(GLASS_W, GLASS_H);
  vec2 tUv2 = (px - vec2(cx, u_g2y) + vec2(GLASS_W * 0.5, GLASS_H * 0.5)) / vec2(GLASS_W, GLASS_H);
  float out1 = step(0.0, tUv1.x) * step(tUv1.x, 1.0) * step(0.0, tUv1.y) * step(tUv1.y, 1.0);
  float out2 = step(0.0, tUv2.x) * step(tUv2.x, 1.0) * step(0.0, tUv2.y) * step(tUv2.y, 1.0);
  vec4 t1 = texture2D(u_text1, tUv1);
  vec4 t2 = texture2D(u_text2, tUv2);
  t1.a *= out1;
  t2.a *= out2 * subAlpha;
  float textBlend = smoothstep(0.0, 0.0, d2 - d1);
  vec4 textColor = mix(t1, t2, textBlend);

  // ── 合成 ──
  vec3 color = mix(bgRefracted, textColor.rgb, textColor.a);
  color = mix(color, TINT_COL, TINT_A);

  // ── Fresnel ──
  float fresnel = pow(1.0 - max(N.z, 0.0), FRESNEL_POW) * FRESNEL_INT;
  color += FRESNEL_COL * fresnel;

  // ── Specular ──
  float spec = pow(max(dot(N.xy, normalize(SPEC_LIGHT)), 0.0), 32.0);
  color += vec3(spec) * 0.25;

  // ── 投影 ──
  float shadowDist = glassSDF(px - vec2(SHADOW_DX, SHADOW_DY), u_g1y, u_g2y);
  if (shadowDist < SHADOW_RAD) {
    float si = clamp(-shadowDist / SHADOW_RAD, 0.0, 1.0) * SHADOW_OP;
    color *= (1.0 - si);
  }

  // ── AO ──
  float ao = exp(-max(d, 0.0) * AO_STRENGTH);
  color *= mix(AO_DARK, 1.0, ao);

  color = min(color, 1.0);
  gl_FragColor = vec4(color, 1.0);
}
`;

// =============================================================================
//  背景渲染 (Canvas 2D)
// =============================================================================

function renderBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 1;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate((45 * Math.PI) / 180);
  const halfDiag = Math.ceil(Math.sqrt(w * w + h * h) / 2);
  for (let d = -halfDiag; d < halfDiag; d += GRID_SPACING) {
    ctx.beginPath();
    ctx.moveTo(d, -halfDiag);
    ctx.lineTo(d, halfDiag);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = WATERMARK_COLOR;
  ctx.font = `${WATERMARK_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lineGap = WATERMARK_FONT_SIZE * 0.7;
  for (let ty = 0; ty < h + WATERMARK_TILE; ty += WATERMARK_TILE) {
    for (let tx = 0; tx < w + WATERMARK_TILE; tx += WATERMARK_TILE) {
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate((WATERMARK_ANGLE * Math.PI) / 180);
      ctx.fillText(WATERMARK_LINE1, 0, -lineGap);
      ctx.fillText(WATERMARK_LINE2, 0, lineGap);
      ctx.restore();
    }
  }
}

// =============================================================================
//  LiquidGlass 组件
// =============================================================================

interface LiquidGlassProps {
  children?: React.ReactNode;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ------------------------------------------------------------------
  //  使用 interpolate 驱动玻璃位置 (代替 GSAP)
  // ------------------------------------------------------------------
  const splitFrame = SPLIT_START * fps;

  const g1y = frame < splitFrame
    ? height / 2
    : interpolate(frame, [splitFrame, splitFrame + MAIN_DURATION * fps], [height / 2, height / 2 - MAIN_OFFSET], {
        easing: Easing.quad,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  function dampedBounce(tSec: number): number {
    if (tSec <= 0) return 0;
    return BOUNCE_AMPLITUDE * Math.exp(-BOUNCE_DAMPING * tSec) * Math.sin(BOUNCE_FREQ * tSec);
  }

  const g2ySplitEndFrame = splitFrame + SUB_DURATION * fps;

  const g2yBase = frame < splitFrame
    ? height / 2
    : interpolate(frame, [splitFrame, g2ySplitEndFrame], [height / 2, height / 2 + SUB_OFFSET], {
        easing: Easing.ease,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  const bounceT = (frame - g2ySplitEndFrame) / fps;
  const g2y = g2yBase + dampedBounce(bounceT);

  // ------------------------------------------------------------------
  //  纹理 (一次性创建, 后续只更新 uniform 数值)
  // ------------------------------------------------------------------
  const bgTexture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    renderBackground(c.getContext("2d")!, width, height);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [width, height]);

  const bgBlurTexture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d")!;
    ctx.filter = `blur(${BLUR_RADIUS}px)`;
    renderBackground(ctx, width, height);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [width, height]);

  const text1Texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = GLASS_W;
    c.height = GLASS_H;
    const ctx = c.getContext("2d")!;
    ctx.font = `bold ${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = FONT_COLOR;
    ctx.fillText(MAIN_TEXT, GLASS_W / 2, GLASS_H / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  const text2Texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = GLASS_W;
    c.height = GLASS_H;
    const ctx = c.getContext("2d")!;
    ctx.font = `bold ${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = FONT_COLOR;
    ctx.fillText(SUB_TEXT, GLASS_W / 2, GLASS_H / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  // ------------------------------------------------------------------
  //  ShaderMaterial reference for per-frame uniform updates
  // ------------------------------------------------------------------
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.u_g1y.value = g1y;
    mat.uniforms.u_g2y.value = g2y;
    mat.uniforms.u_frame.value = frame;
  }, [frame, g1y, g2y]);

  // ------------------------------------------------------------------
  //  JSX
  // ------------------------------------------------------------------
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "transparent" }}>
      <ThreeCanvas
        orthographic
        camera={{
          left: -width / 2,
          right: width / 2,
          top: height / 2,
          bottom: -height / 2,
          near: -1,
          far: 1,
          position: [0, 0, 1],
        }}
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, backgroundColor: "transparent" }}
      >
        <mesh>
          <planeGeometry args={[width, height]} />
          <shaderMaterial
            ref={materialRef}
            uniforms={{
              u_resolution: { value: new THREE.Vector2(width, height) },
              u_g1y: { value: g1y },
              u_g2y: { value: g2y },
              u_frame: { value: frame },
              u_fps: { value: fps },
              u_bg: { value: bgTexture },
              u_bgBlur: { value: bgBlurTexture },
              u_text1: { value: text1Texture },
              u_text2: { value: text2Texture },
            }}
            vertexShader={VERTEX_SHADER}
            fragmentShader={FRAGMENT_SHADER}
            transparent
          />
        </mesh>
      </ThreeCanvas>
      {children}
    </div>
  );
};

export const catalogEntry = {
  name: 'LiquidGlass',
  description: '3D 液体玻璃质感面板',
  params: {},
};
