# 🎪 动画组件目录

> 按类别分组 · 共 19 个组件

## 🅰️ Typography — 文字动画

### TextIntro
字符逐字弹性弹入（y:100%→0, back.out）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mainText` | string | `"ZhanWeiFu"` | 主标题文字 |
| `subText` | string | `""` | 副标题文字 |
| `fontSize` | number | `48` | 主标题字号（px） |
| `color` | string | `"#1D1B20"` | 文字颜色 |

### TextScramble
字符乱码翻滚→逐步稳定为目标文字

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | `"ZhanWeiFu"` | 显示的目标文字 |
| `fontSize` | number | `48` | 字号（px） |
| `fontFamily` | string | — | 字体名称 |

### WordReveal
单词逐字从左至右展开揭示

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | `"Crafting Motion"` | 显示文字 |

### MediaTitle
背景面板从左展开 + 字符从底部滑入

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | `"media"` | 标题文字 |
| `bgColor` | string | `"#1D1B20"` | 背景面板颜色 |
| `textColor` | string | `"#CBC0D3"` | 文字颜色 |
| `fontSizeVw` | number | `3.5` | 字号（vw 单位） |

### GlassTitleCard
霓虹玻璃质感片头标题卡 — Neo surface 风格，tilt 入场 + glow 脉冲

*(固定效果，无配置参数)*

### CharReveal
字符从底部 3D 翻转显现（rotationX:90→0）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | `"ZHanWeiFU"` | 显示的文字 |
| `staggerMode` | enum | `sequential` | 字符出场顺序（sequential \| random \| center \| edges） |

## 🃏 Card — 卡片动画

### CardFlyUp
卡片从下方旋转升入 — 复现 incredibles.dev s__usp-wrapper 动效

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `cardWidth` | number | `320` | 卡片宽度 (px) |
| `cardHeight` | number | `420` | 卡片高度 (px) |
| `durationInFrames` | number | `90` | 动画总帧数 @60fps |

### AnimatedCardScene
3D 卡片弹出 + 粒子爆发动效 — 三段式（出场/悬停呼吸/退场）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `seed` | string | `"default"` | 随机种子，确保粒子确定性生成 |
| `title` | string | `"Card Title"` | 卡片标题 |
| `subtitle` | string | `"Subtitle"` | 卡片副标题 |
| `startX` | number | `300` | 卡片起始 X 坐标（px） |
| `startY` | number | `height/2` | 卡片起始 Y 坐标（px） |
| `cardWidth` | number | `320` | 卡片宽度（px） |
| `cardHeight` | number | `420` | 卡片高度（px） |
| `boxShadow` | string | `"0 4px 16px rgba(0,0,0,0.15)"` | 卡片阴影（CSS box-shadow 值） |

### GlassShowcaseStack
4 张霓虹玻璃卡层叠堆叠 — 从中心扇面展开，staggered 入场

*(固定效果，无配置参数)*

## 🚀 Entrance — 入场展示

### AnimeDrop
动漫式爆发弹入 + 重力下落 + 弹簧归位

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `targetSize` | number | — | 主体正方形边长（px），默认画面宽度 30% |
| `initialTiltAngle` | number | `-20` | 初始逆时针倾斜角度（度） |
| `seed` | string | — | 随机种子，用于确定性动画变体 |

### HeroReveal
物理弹道发射 + 慢动作展示

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `seed` | string | `"default"` | 随机种子，确保轨迹可复现 |
| `gravity` | number | `1.8` | 重力加速度（px/frame²） |
| `durationInFrames` | number | `180` | 总帧数 @60fps |

### GridReveal
网格细胞径向波纹展开 + 标题淡入

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `cols` | number | `6` | 网格列数 |
| `rows` | number | `4` | 网格行数 |
| `title` | string | `"Rebooot"` | 标题文字 |
| `subtitle` | string | `"Grid Reveal · Radial Ripple"` | 副标题文字 |

### CurtainReveal
竖向帘幕柱 reveal / cover / cycle

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `direction` | enum | `horizontal` | 帘幕方向（horizontal \| vertical） |
| `columnCount` | number | `8` | 帘幕列数 |
| `backgroundColor` | string | `"#1D1B20"` | 帘幕颜色 |

## 🔄 Transition — 场景转场

### MovieScreen
百叶窗 (Venetian Blind) Track Matte 转场 — 21列纵向叶片 + CRT弧面屏幕 + zoom in 至全屏

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `columnCount` | number | `21` | 叶片列数（奇数） |
| `curtainColor` | string | `"#1D1B20"` | 屏幕边框颜色 |
| `screenWidth` | number | `85` | 电影屏幕宽度（视口百分比） |
| `screenHeight` | number | `75` | 电影屏幕高度（视口百分比） |
| `screenInitialScale` | number | `0.65` | 屏幕初始缩放 |

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

### ClawdDrop
像素 Clawd 角色从左侧滑入 + 弹跳 + 表情互动 + 爱心粒子系统

*(固定效果，无配置参数)*

### ClawdAction
像素 Clawd 三段式动作序列 — 弹跳入场 → 空闲摇摆 → 旋转跑出屏幕

*(固定效果，无配置参数)*
