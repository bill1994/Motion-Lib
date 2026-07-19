import { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";

const WATER_ORB_UNIFORMS = {
  u_time: { value: 0 },
  u_debugMode: { value: 5 },
  u_baseColor: { value: new THREE.Color("#CBC0D3") },
  u_rimColor: { value: new THREE.Color("#8B7FA3") },
  u_specularColor: { value: new THREE.Color("#FFFFFF") },
};

const VERT = `
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vModelPosition;
void main() {
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPos.xyz;
  vNormal = normalize(normalMatrix * normal);
  vModelPosition = position;
  gl_Position = projectionMatrix * mvPos;
}
`;

const FRAG = `
precision highp float;
uniform float u_time;
uniform float u_debugMode;
uniform vec3 u_baseColor;
uniform vec3 u_rimColor;
uniform vec3 u_specularColor;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vModelPosition;

// --- 3D Simplex Noise ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * 7.0 * (1.0 / 49.0));
  vec4 x_ = floor(j * 7.0);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// 2-octave flow noise
float flowNoise(vec3 p) {
  float sum = 0.5 * snoise(p);
  sum += 0.25 * snoise(p * 2.0 + vec3(u_time * 0.5));
  return sum * 0.5 + 0.5;
}

void main() {
  vec3 viewDir = normalize(vViewPosition);
  vec3 normal = normalize(vNormal);

  // Fresnel
  float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
  fresnel = pow(fresnel, 2.5);

  // Flow noise in model-space + time
  float ripple = flowNoise(vModelPosition * 3.0 + vec3(0.0, u_time * 1.2, 0.0));

  // Light / spec
  vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
  vec3 halfVec = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfVec), 0.0), 45.0);

  // Colour — ripple modulates both base and rim
  vec3 base = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0), ripple);
  vec3 rim = u_rimColor * fresnel * (0.6 + ripple * 0.8);
  vec3 specular = u_specularColor * spec * 0.8;

  vec3 finalColor = base + rim + specular;

  // ── DEBUG MODE ──
  // 0 = normal, 1 = viewDir, 2 = fresnel, 3 = ripple, 4 = raw baseColor, 5 = base with ripple
  if (u_debugMode < 0.5) {
    gl_FragColor = vec4(finalColor, 1.0);
  } else if (u_debugMode < 1.5) {
    gl_FragColor = vec4(viewDir * 0.5 + 0.5, 1.0);
  } else if (u_debugMode < 2.5) {
    gl_FragColor = vec4(vec3(fresnel), 1.0);
  } else if (u_debugMode < 3.5) {
    gl_FragColor = vec4(vec3(ripple), 1.0);
  } else if (u_debugMode < 4.5) {
    gl_FragColor = vec4(u_baseColor, 1.0);
  } else {
    gl_FragColor = vec4(base, 1.0);
  }
}
`;

export const WaterOrb: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const matRef = useRef<THREE.ShaderMaterial>(null!);

  useEffect(() => {
    const mat = matRef.current;
    if (!mat) return;
    mat.uniforms.u_time.value = frame / fps;
    mat.needsUpdate = true;

    if (frame % 30 === 0) {
      console.log(`WaterOrb | frame=${frame} u_time=${(frame / fps).toFixed(3)}`);
    }
  }, [frame, fps]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <ThreeCanvas
        width={width}
        height={height}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#1D1B20",
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
          stencil: false,
          depth: true,
        }}
        camera={{ position: [0, 0, 2.8], fov: 45, near: 0.1, far: 10 }}
        onCreated={({ gl }) => {
          console.log(
            `WaterOrb | info.render.calls=${gl.info.render.calls}`,
            `canvas=${gl.domElement.width}x${gl.domElement.height}`,
          );
        }}
      >
        <mesh>
          <sphereGeometry args={[1, 128, 128]} />
          <shaderMaterial
            ref={matRef}
            uniforms={WATER_ORB_UNIFORMS}
            vertexShader={VERT}
            fragmentShader={FRAG}
          />
        </mesh>
      </ThreeCanvas>
    </div>
  );
};

export const catalogEntry = {
  name: 'WaterOrb',
  category: 'vfx',
  description: '3D 水球流动噪波效果',
  params: {},
};
