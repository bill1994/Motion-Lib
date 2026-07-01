# Animation Catalog — remotion-hammer

All 14 Remotion compositions registered or available in the project, with props tables for storyboard reference syntax.

---

## @AnimeDrop

**Source:** `src/AnimeDrop.tsx`
**Animation:** Anime-style burst entrance (scale 0→1, CCW tilt) → clockwise gravity fall → restrained spring jiggle settle.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| targetSize | number | width * 0.3 | Square side length in px |
| anchorX | number | width/2 - targetSize/2 | Bottom-left anchor X |
| anchorY | number | height/2 + targetSize/2 | Bottom-left anchor Y |
| initialTiltAngle | number | -20 | Initial CCW tilt angle (degrees) |
| burstFrames | number | 15 | Burst phase frames @30fps |
| fallFrames | number | 20 | Fall phase frames @30fps |
| springStiffness | number | 250 | Spring stiffness (higher = stiffer) |
| springDamping | number | 20 | Spring damping (higher = faster decay) |
| springMass | number | 0.3 | Spring mass |
| maxBounceAngleRatio | number | 0.2 | Max rebound angle as ratio of initialTiltAngle |
| maxSquashRatio | number | 0.04 | Max vertical squash as ratio of targetSize |
| blurFactor | number | 45 | Motion blur intensity (velocity × factor) |

**Storyboard reference:** `@AnimeDrop(targetSize=300, initialTiltAngle=-15)`

---

## @PhysicsDrop

**Source:** `src/PhysicsDrop.tsx`
**Animation:** Three-phase physics drop: anticipation squash → pop launch upward → gravity free-fall → landing squash & stretch.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| startX | number | width / 2 | Start X position (px) |
| startY | number | height + 200 | Start Y position (px, below screen) |
| peekY | number | height * 0.25 | Peak Y position (px) |
| endX | number | width / 2 | End X position (px) |
| endY | number | height / 2 | End Y position (px) |
| targetSize | number | width * 0.3 | Object size (px) |

**Storyboard reference:** `@PhysicsDrop(endX=960, endY=540, targetSize=200)`

---

## @OrbitalRelaunch

**Source:** `src/OrbitalRelaunch.tsx`
**Animation:** Three-phase bullet-time trajectory: launch from bottom → slow-motion showcase with scale/rotation/sway effects → time-resume flyout.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| seed | string | "default" | Deterministic PRNG seed |
| durationInFrames | number | 150 | Total frame count |
| vxRange | [number, number] | [10, 18] | Horizontal velocity range [min, max] px/frame |
| vyRange | [number, number] | [50, 60] | Vertical velocity range [min, max] px/frame |
| gravity | number | 1.35 | Gravity px/frame² |
| bulletTimeScale | number | 0.05 | Bullet-time speed multiplier |
| scaleAmplitude | number | 0.12 | Scale oscillation amplitude |
| scaleDamping | number | 3 | Scale oscillation damping |
| scaleFrequency | number | 1.8 | Scale oscillation frequency (Hz) |
| rotationAmplitude | number | 8 | Rotation oscillation amplitude (degrees) |
| rotationDamping | number | 2.2 | Rotation oscillation damping |
| rotationFrequency | number | 1.6 | Rotation oscillation frequency (Hz) |
| swayAmplitude | number | 18 | Horizontal sway amplitude (px) |
| swayFrequency | number | 1.4 | Horizontal sway frequency (Hz) |
| targetSizeRatio | number | 0.3 | Object size as fraction of width |
| blurIntensity | number | 0.45 | Motion blur intensity (velocity × factor) |
| maxBlur | number | 4 | Maximum blur radius (px) |

**Storyboard reference:** `@OrbitalRelaunch(seed="variant-B", gravity=1.8, bulletTimeScale=0.08)`

---

## @HeroReveal

**Source:** `src/HeroReveal.tsx`
**Animation:** Object launched from bottom with gravity → cinematic bullet-time showcase (scale up, pendulum rotation, sway) → time-resume flyout.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| seed | string | "default" | Random seed for deterministic PRNG |
| durationInFrames | number | 180 | Total duration @60fps |
| phase1Ratio | number | 0.25 | Launch phase ratio |
| phase2Ratio | number | 0.5 | Showcase phase ratio |
| vxRange | [number, number] | [8, 16] | Horizontal speed range [min, max] px/frame |
| vyRange | [number, number] | [50, 65] | Vertical speed range [min, max] px/frame |
| gravity | number | 1.8 | Gravity px/frame² |
| launchEasingPower | number | 0.5 | Launch easing power (front-loaded curve) |
| bulletTimeScale | number | 0.05 | Bullet-time speed multiplier |
| sectionARatio | number | 0.2 | Section A (scale-up) ratio of Phase 2 |
| sectionBRatio | number | 0.6 | Section B (hold) ratio of Phase 2 |
| scaleUpTarget | number | 1.12 | Maximum scale multiplier |
| zDepthOffset | number | 20 | Fake Z-depth offset (px) |
| rotationAmplitudeA | number | 11.3 | Section A pendulum amplitude |
| rotationAmplitudeC | number | 8.5 | Section C pendulum amplitude |
| rotationDamping | number | 1.39 | Pendulum damping coefficient |
| swayAmplitude | number | 1.0 | Section B sway amplitude (degrees) |
| swayFrequency | number | 0.8 | Section B sway frequency (Hz) |
| targetSizeRatio | number | 0.3 | Object size as fraction of width |
| blurIntensity | number | 0.45 | Motion blur intensity |
| maxBlur | number | 16 | Maximum blur radius (px) |
| springSettleFrames | number | 0 | Spring settle frames (0 = off) |
| springStiffness | number | 150 | Settle spring stiffness |
| springDamping | number | 12 | Settle spring damping |

**Storyboard reference:** `@HeroReveal(seed="demo", gravity=2.0, durationInFrames=150)`

---

## @TextIntro

**Source:** `src/TextIntro.tsx`
**Animation:** Character-by-character elastic entrance (y: 100%→0, back.out easing) with optional subtitle. GSAP-driven.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| mainText | string | "ZhanWeiFu" | Primary text content |
| subText | string | "" | Secondary text (optional) |

**Storyboard reference:** `@TextIntro(mainText="Hello World", subText="Subtitle here")`

---

## @LiquidGlass

**Source:** `src/LiquidGlass.tsx`
**Animation:** 3D liquid glass panel (GLSL shader) with gooey SDF merge, chromatic-aberration refraction, Fresnel rim light, and split animation. Three.js via `@remotion/three`.

**Hardcoded — no adjustable params.** Fixed text: "液态玻璃" / "液态玻璃 2". Fixed colors and timing.

**Storyboard reference:** `@LiquidGlass`

---

## @WaterOrb

**Source:** `src/WaterOrb.tsx`
**Animation:** 3D water sphere with simplex-noise flow ripples, Fresnel rim lighting, and specular highlights. Three.js via `@remotion/three`.

**Hardcoded — no adjustable params.** Fixed uniforms: baseColor `#CBC0D3`, rimColor `#8B7FA3`, specularColor `#FFFFFF`.

**Storyboard reference:** `@WaterOrb`

---

## @TextScramble

**Source:** `src/TextScramble.tsx`
**Animation:** Character scramble reveal — each character cycles through a symbol pool before settling into final text, with a sweeping scan-line highlight.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| text | string | "ZhanWeiFu" | Final text to reveal |
| fontSize | number | 5 | Font size in rem |

**Storyboard reference:** `@TextScramble(text="Hello World")`

---

## @GridReveal

**Source:** `src/GridReveal.tsx`
**Animation:** Grid cells fade in via radial ripple from center, then title/subtitle content fades in.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| cols | number | 12 | Number of grid columns |
| rows | number | 8 | Number of grid rows |
| cellSize | number | 50 | Cell size in px |
| gap | number | 0 | Grid gap in px |
| title | string | "Rebooot" | Title text |
| subtitle | string | "Grid Reveal · Radial Ripple" | Subtitle text |

**Storyboard reference:** `@GridReveal(cols=16, rows=10, title="My Title")`

---

## @CurtainReveal

**Source:** `src/CurtainReveal.tsx`
**Animation:** Vertical curtain columns reveal/cover/cycle with staggered timing, proportional column widths, and cubic-bezier easing.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| direction | "reveal" \| "cover" \| "cycle" | "cycle" | Curtain animation direction |
| columnCount | number | 5 | Number of curtain columns |
| backgroundColor | string | "#000000" | Curtain color |

**Storyboard reference:** `@CurtainReveal(direction="reveal", columnCount=4)`

---

## @CircleGlow

**Source:** `src/CircleGlow.tsx`
**Animation:** SVG ellipse drawn/un-drawn/re-drawn around text, with neon glow color. Four-phase stroke animation.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| text | string | "creative" | Text to surround with glow |
| fontSize | number | 80 | Font size in px |
| glowColor | string | "#D3FD50" | Ellipse stroke color (hex) |
| strokeWidth | number | 2 | Ellipse stroke width |
| backgroundColor | string | "#1D1B20" | Background color |

**Storyboard reference:** `@CircleGlow(text="creative", glowColor="#FF6B6B")`

---

## @MediaTitle

**Source:** `src/MediaTitle.tsx`
**Animation:** Background panel scales in from left (scaleX 0→1) while title text characters stagger-enter from bottom. GSAP-driven.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| text | string | "media" | Title text |
| bgColor | string | "#00d3ff" | Background color |
| textColor | string | "#1D1B20" | Text color |
| fontSizeVw | number | 13 | Font size in vw |

**Storyboard reference:** `@MediaTitle(text="Chapter 1", bgColor="#CBC0D3")`

---

## @SceneTransition

**Source:** `src/SceneTransition.tsx`
**Animation:** SVG polygon mask rotation transition between two scenes. Octagon rotates 360° while scaling from 1.8× to 0, revealing Scene B beneath Scene A.

**Hardcoded — no adjustable params.** Fixed: 8-sided polygon, red → yellow scenes, 90-frame transition.

**Storyboard reference:** `@SceneTransition`

---

## @CharReveal

**Source:** `src/CharReveal.tsx`
**Animation:** 3D character-by-character flip reveal (rotationX 90→0, back.out easing). Supports sequential/random/center/edges stagger modes. GSAP-driven.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| text | string | "ZHanWeiFU" | Text to reveal |
| staggerMode | "sequential" \| "random" \| "center" \| "edges" | "sequential" | Character entry order |

**Storyboard reference:** `@CharReveal(text="Hello", staggerMode="center")`
