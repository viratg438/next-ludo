export type PlayerId = 0 | 1 | 2 | 3;

export type Cell = { row: number; col: number };

export const PLAYERS: {
  id: PlayerId;
  name: string;
  color: string;
  ink: string;
  yard: string;
}[] = [
  { id: 0, name: "Red", color: "#d62828", ink: "#ffffff", yard: "#c41f1f" },
  { id: 1, name: "Green", color: "#1c8a42", ink: "#ffffff", yard: "#167538" },
  { id: 2, name: "Yellow", color: "#f0b429", ink: "#3d2a00", yard: "#e2a20b" },
  { id: 3, name: "Blue", color: "#2463e0", ink: "#ffffff", yard: "#1d56c9" },
];

/** 52 shared squares, clockwise. Index 0, 13, 26, 39 are the four starts. */
export const PATH: Cell[] = [
  { row: 6, col: 1 },
  { row: 6, col: 2 },
  { row: 6, col: 3 },
  { row: 6, col: 4 },
  { row: 6, col: 5 },
  { row: 5, col: 6 },
  { row: 4, col: 6 },
  { row: 3, col: 6 },
  { row: 2, col: 6 },
  { row: 1, col: 6 },
  { row: 0, col: 6 },
  { row: 0, col: 7 },
  { row: 0, col: 8 },
  { row: 1, col: 8 },
  { row: 2, col: 8 },
  { row: 3, col: 8 },
  { row: 4, col: 8 },
  { row: 5, col: 8 },
  { row: 6, col: 9 },
  { row: 6, col: 10 },
  { row: 6, col: 11 },
  { row: 6, col: 12 },
  { row: 6, col: 13 },
  { row: 6, col: 14 },
  { row: 7, col: 14 },
  { row: 8, col: 14 },
  { row: 8, col: 13 },
  { row: 8, col: 12 },
  { row: 8, col: 11 },
  { row: 8, col: 10 },
  { row: 8, col: 9 },
  { row: 9, col: 8 },
  { row: 10, col: 8 },
  { row: 11, col: 8 },
  { row: 12, col: 8 },
  { row: 13, col: 8 },
  { row: 14, col: 8 },
  { row: 14, col: 7 },
  { row: 14, col: 6 },
  { row: 13, col: 6 },
  { row: 12, col: 6 },
  { row: 11, col: 6 },
  { row: 10, col: 6 },
  { row: 9, col: 6 },
  { row: 8, col: 5 },
  { row: 8, col: 4 },
  { row: 8, col: 3 },
  { row: 8, col: 2 },
  { row: 8, col: 1 },
  { row: 8, col: 0 },
  { row: 7, col: 0 },
  { row: 6, col: 0 },
];

export const STARTS = [0, 13, 26, 39] as const;

/** Start squares plus one star on each arm. */
export const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export const HOME: Cell[][] = [
  [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
  ],
  [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
  ],
  [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
  ],
  [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
  ],
];

export const BASE: Cell[] = [
  { row: 0, col: 0 },
  { row: 0, col: 9 },
  { row: 9, col: 9 },
  { row: 9, col: 0 },
];

export const SLOTS: Cell[] = [
  { row: 1, col: 1 },
  { row: 1, col: 4 },
  { row: 4, col: 1 },
  { row: 4, col: 4 },
];

/** Top-left of the token box inside the center, one slot per token. */
export const FINISH_AT: Cell[][] = [
  [
    { row: 6.15, col: 6.05 },
    { row: 6.15, col: 6.55 },
    { row: 6.7, col: 6.05 },
    { row: 6.7, col: 6.55 },
  ],
  [
    { row: 6.05, col: 6.15 },
    { row: 6.05, col: 6.7 },
    { row: 6.55, col: 6.15 },
    { row: 6.55, col: 6.7 },
  ],
  [
    { row: 6.15, col: 7.45 },
    { row: 6.15, col: 7.95 },
    { row: 6.7, col: 7.45 },
    { row: 6.7, col: 7.95 },
  ],
  [
    { row: 7.45, col: 6.15 },
    { row: 7.45, col: 6.7 },
    { row: 7.95, col: 6.15 },
    { row: 7.95, col: 6.7 },
  ],
];

export const FINISH = 56;
export const HOME_START = 51;

export function globalIndex(player: number, trackPos: number) {
  return (STARTS[player] + trackPos) % PATH.length;
}

export function cellFor(player: number, index: number, pos: number): Cell {
  if (pos < 0) {
    const base = BASE[player];
    const slot = SLOTS[index];
    return { row: base.row + slot.row, col: base.col + slot.col };
  }
  if (pos >= FINISH) return FINISH_AT[player][index];
  if (pos >= HOME_START) return HOME[player][pos - HOME_START];
  return PATH[globalIndex(player, pos)];
}
