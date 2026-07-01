import type { PixelSpriteDef, FacialExpression } from './PixelSpriteDef';

export const CLAWD_SPRITE: PixelSpriteDef = {
  name: 'clawd',
  width: 14,
  height: 8,
  palette: { 1: '#CD6E58', 2: '#000000' },
  grid: [
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0],
  ],
  anchors: {
    eyeLeft: { x: 4, y: 1 },
    eyeRight: { x: 9, y: 1 },
    hatTop: { x: 7, y: -1 },
    handLeft: { x: 0, y: 2 },
    handRight: { x: 13, y: 2 },
    sitBottom: { x: 7, y: 8 },
  },
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
