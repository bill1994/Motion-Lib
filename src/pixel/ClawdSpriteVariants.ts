import type {
  PixelSpriteDef,
  FacialExpression,
} from './PixelSpriteDef';

const COMMON_PALETTE: Record<number, string> = { 1: '#CD6E58', 2: '#000000' };
const COMMON_WIDTH = 14;
const COMMON_HEIGHT = 8;

const COMMON_ANCHORS: Record<string, { x: number; y: number }> = {
  eyeLeft: { x: 4, y: 1 },
  eyeRight: { x: 9, y: 1 },
  hatTop: { x: 7, y: -1 },
  handLeft: { x: 0, y: 2 },
  handRight: { x: 13, y: 2 },
  sitBottom: { x: 7, y: 8 },
};

const IDLE_GRID: number[][] = [
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0],
];

const JUMP_GRID: number[][] = [
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
];

const IDLE_ACTIVE_GRID: number[][] = [
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
];

const RUN1_GRID: number[][] = [
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
];

const RUN2_GRID: number[][] = [
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0],
];

function makeVariant(
  name: string,
  grid: number[][],
): PixelSpriteDef {
  return {
    name,
    width: COMMON_WIDTH,
    height: COMMON_HEIGHT,
    palette: COMMON_PALETTE,
    grid,
    anchors: COMMON_ANCHORS,
  };
}

export const CLAWD_VARIANTS: Record<string, PixelSpriteDef> = {
  idle: makeVariant('idle', IDLE_GRID),
  jump: makeVariant('jump', JUMP_GRID),
  idleActive: makeVariant('idleActive', IDLE_ACTIVE_GRID),
  run1: makeVariant('run1', RUN1_GRID),
  run2: makeVariant('run2', RUN2_GRID),
};

export const CLAWD_EXPRESSIONS: FacialExpression[] = [
  {
    name: 'forward',
    features: [
      { anchor: 'eyeLeft', offset: { dx: 0, dy: 0 } },
      { anchor: 'eyeRight', offset: { dx: 0, dy: 0 } },
    ],
  },
  {
    name: 'look_right',
    features: [
      { anchor: 'eyeLeft', offset: { dx: 1, dy: 0 } },
      { anchor: 'eyeRight', offset: { dx: 1, dy: 0 } },
    ],
  },
  {
    name: 'look_left',
    features: [
      { anchor: 'eyeLeft', offset: { dx: -1, dy: 0 } },
      { anchor: 'eyeRight', offset: { dx: -1, dy: 0 } },
    ],
  },
  {
    name: 'look_down',
    features: [
      { anchor: 'eyeLeft', offset: { dx: 0, dy: 1 } },
      { anchor: 'eyeRight', offset: { dx: 0, dy: 1 } },
    ],
  },
  {
    name: 'blink',
    features: [
      { anchor: 'eyeLeft', hidden: true },
      { anchor: 'eyeRight', hidden: true },
    ],
  },
];
