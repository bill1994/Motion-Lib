# 🎪 动画组件目录

> 此文件由 `npm run update-catalog` 自动生成。**请勿手写修改**。
> 共 22 个 Studio 组合 · 生成时间: 2026-07-24

## 🅰️ Typography — 文字动画

### TextScramble

字符乱码翻滚→逐步稳定为目标文字

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | "ZhanWeiFu" | 显示的目标文字 |
| `fontSize` | number | 48 | 字号（px） |
| `fontFamily` | string | — | 字体名称 |

### TitleRevealDepthZoom

景深推镜缩放+模糊消散

*(来自 TitleReveal, props: mode=depthZoom)*

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | "ZhanWeiFu" | 显示文字 |
| `subText` | string | "" | 副标题（仅 slideUp 模式） |
| `staggerMode` | enum | "sequential" | 字符出场顺序（仅 flip3d 模式） |
| `bgColor` | string | "#00d3ff" | 背景面板颜色（仅 panel 模式） |
| `textColor` | string | "#ffffff" | 文字颜色 |

### TitleRevealFlip3d

字符从底部 3D 翻转显现（rotationX:90→0）

*(来自 TitleReveal, props: mode=flip3d, staggerMode=sequential)*

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | "ZhanWeiFu" | 显示文字 |
| `subText` | string | "" | 副标题（仅 slideUp 模式） |
| `bgColor` | string | "#00d3ff" | 背景面板颜色（仅 panel 模式） |
| `textColor` | string | "#ffffff" | 文字颜色 |

### TitleRevealJellyWave

字符果冻弹性形变弹入

*(来自 TitleReveal, props: mode=jellyWave)*

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | "ZhanWeiFu" | 显示文字 |
| `subText` | string | "" | 副标题（仅 slideUp 模式） |
| `staggerMode` | enum | "sequential" | 字符出场顺序（仅 flip3d 模式） |
| `bgColor` | string | "#00d3ff" | 背景面板颜色（仅 panel 模式） |
| `textColor` | string | "#ffffff" | 文字颜色 |

### TitleRevealPanel

背景面板从左展开 + 字符从底部滑入

*(来自 TitleReveal, props: mode=panel, bgColor=#00d3ff, textColor=#ffffff)*

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | "ZhanWeiFu" | 显示文字 |
| `subText` | string | "" | 副标题（仅 slideUp 模式） |
| `staggerMode` | enum | "sequential" | 字符出场顺序（仅 flip3d 模式） |

### TitleRevealScramble

字符黑客解密乱码→逐步稳定

*(来自 TitleReveal, props: mode=scramble)*

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | "ZhanWeiFu" | 显示文字 |
| `subText` | string | "" | 副标题（仅 slideUp 模式） |
| `staggerMode` | enum | "sequential" | 字符出场顺序（仅 flip3d 模式） |
| `bgColor` | string | "#00d3ff" | 背景面板颜色（仅 panel 模式） |
| `textColor` | string | "#ffffff" | 文字颜色 |

### TitleRevealShimmer

流光扫影渐变揭示（Apple风格）

*(来自 TitleReveal, props: mode=shimmer)*

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | "ZhanWeiFu" | 显示文字 |
| `subText` | string | "" | 副标题（仅 slideUp 模式） |
| `staggerMode` | enum | "sequential" | 字符出场顺序（仅 flip3d 模式） |
| `bgColor` | string | "#00d3ff" | 背景面板颜色（仅 panel 模式） |
| `textColor` | string | "#ffffff" | 文字颜色 |

### TitleRevealSlideUp

字符逐字弹性弹入（y:100%→0, back.out）

*(来自 TitleReveal, props: mode=slideUp)*

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | "ZhanWeiFu" | 显示文字 |
| `subText` | string | "" | 副标题（仅 slideUp 模式） |
| `staggerMode` | enum | "sequential" | 字符出场顺序（仅 flip3d 模式） |
| `bgColor` | string | "#00d3ff" | 背景面板颜色（仅 panel 模式） |
| `textColor` | string | "#ffffff" | 文字颜色 |

### TitleRevealSplitSlide

字符上下对切错位滑入拼接

*(来自 TitleReveal, props: mode=splitSlide)*

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | "ZhanWeiFu" | 显示文字 |
| `subText` | string | "" | 副标题（仅 slideUp 模式） |
| `staggerMode` | enum | "sequential" | 字符出场顺序（仅 flip3d 模式） |
| `bgColor` | string | "#00d3ff" | 背景面板颜色（仅 panel 模式） |
| `textColor` | string | "#ffffff" | 文字颜色 |

### WordReveal

单词逐字从左至右展开揭示

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | "Crafting Motion" | 显示文字 |

## 🃏 Card — 卡片动画

### AnimatedCardScene

3D 卡片弹出 + 粒子爆发动效 — 三段式（出场/悬停呼吸/退场）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `seed` | string | "default" | 随机种子，确保粒子确定性生成 |
| `title` | string | "Card Title" | 卡片标题 |
| `subtitle` | string | "Subtitle" | 卡片副标题 |
| `startX` | number | 300 | 卡片起始 X 坐标（px） |
| `startY` | number | height/2 | 卡片起始 Y 坐标（px） |
| `cardWidth` | number | 672 | 卡片宽度（px） |
| `cardHeight` | number | — | 卡片高度（px，默认等于宽度） |
| `boxShadow` | string | "0 8px 32px rgba(0,0,0,0.08)" | 卡片阴影（CSS box-shadow 值） |

## 🚀 Entrance — 入场展示

### AnimeDrop

动漫式爆发弹入 + 重力下落 + 弹簧归位

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `targetSize` | number | — | 主体正方形边长（px），默认画面宽度 30% |
| `initialTiltAngle` | number | -20 | 初始逆时针倾斜角度（度） |
| `seed` | string | — | 随机种子，用于确定性动画变体 |

### CurtainReveal

竖向帘幕柱 reveal / cover / cycle

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `direction` | enum: horizontal\|vertical | horizontal | 帘幕方向 |
| `columnCount` | number | 8 | 帘幕列数 |
| `backgroundColor` | string | "#1D1B20" | 帘幕颜色 |

### DominoCascade

3D domino cascade — six-faced CSS 3D blocks with entry + fall animation

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `count` | number | 4 | Number of domino blocks |
| `blockWidth` | number | 20 | Block width (px) |
| `blockHeight` | number | 150 | Block height (px) |
| `blockDepth` | number | 100 | Block depth (px) |
| `entryStagger` | number | 12 | Entry stagger (frames = 0.2s @60fps) |
| `dominoStagger` | number | 3 | Domino fall stagger (frames) |
| `baseColor` | string | "#CBC0D3" | Primary face color |
| `accentColor` | string | "#4E4D5C" | Side face color |

### GridReveal

网格细胞径向波纹展开 + 标题淡入

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `cols` | number | 6 | 网格列数 |
| `rows` | number | 4 | 网格行数 |
| `title` | string | "Rebooot" | 标题文字 |
| `subtitle` | string | "Grid Reveal · Radial Ripple" | 副标题文字 |

### HeroReveal

物理弹道发射 + 慢动作展示

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `seed` | string | "default" | 随机种子，确保轨迹可复现 |
| `gravity` | number | 1.8 | 重力加速度（px/frame²） |
| `durationInFrames` | number | 180 | 总帧数 @60fps |

## 🔄 Transition — 场景转场

### MovieScreen

百叶窗 (Venetian Blind) Track Matte 转场 — 21列纵向叶片 + CRT弧面屏幕 + zoom in 至全屏

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `columnCount` | number | 21 | 叶片列数（奇数） |
| `curtainColor` | string | "#1D1B20" | 屏幕边框颜色 |
| `screenWidth` | number | 85 | 电影屏幕宽度（视口百分比） |
| `screenHeight` | number | 75 | 电影屏幕高度（视口百分比） |
| `screenInitialScale` | number | 0.65 | 屏幕初始缩放 |

### SceneTransition

SVG 多边形旋转缩放转场

*(固定效果，无配置参数)*

## ✨ VFX — 视觉特效

### LiquidGlass

3D 液体玻璃质感面板

*(固定效果，无配置参数)*

### WaterOrb

3D 水球流动噪波效果

*(固定效果，无配置参数)*

## 🎭 Character — 角色动画

### ClawdSceneAction

像素 Clawd 三段式动作序列 — 弹跳入场 → 空闲摇摆 → 旋转跑出屏幕

*(来自 ClawdScene, props: routine=action)*

*(固定效果，无配置参数)*

### ClawdSceneDrop

像素 Clawd 角色从左侧滑入 + 弹跳 + 表情互动 + 爱心粒子系统

*(来自 ClawdScene, props: routine=drop)*

*(固定效果，无配置参数)*

---
> 共 22 个组件