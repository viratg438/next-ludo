import type { PlayerId } from "./board";

export const BOARD_COLORS = [
  { id: "ivory", name: "Ivory", surface: "#efe2c4", cell: "#fff3d6" },
  { id: "sky", name: "Sky", surface: "#8ecff2", cell: "#c5e9fb" },
  { id: "rose", name: "Rose", surface: "#f3a3b2", cell: "#ffd0d8" },
  { id: "mint", name: "Mint", surface: "#7dceaa", cell: "#c8f3de" },
] as const;

export type BoardColorId = (typeof BOARD_COLORS)[number]["id"];

export type MatchConfig = {
  seats: PlayerId[];
  boardId: BoardColorId;
  sound: boolean;
};

export function boardColor(id: BoardColorId) {
  return BOARD_COLORS.find((item) => item.id === id) ?? BOARD_COLORS[0];
}

export function defaultSeats(count: 2 | 3 | 4): PlayerId[] {
  if (count === 2) return [0, 2];
  if (count === 3) return [0, 1, 2];
  return [0, 1, 2, 3];
}
