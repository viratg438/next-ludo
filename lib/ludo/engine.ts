import {
  FINISH,
  HOME_START,
  PLAYERS,
  SAFE,
  globalIndex,
  type PlayerId,
} from "./board";

export type Token = {
  id: string;
  player: PlayerId;
  index: number;
  pos: number;
};

export type Move = {
  tokenId: string;
  from: number;
  to: number;
};

export type Phase = "roll" | "select" | "over";

export type GameState = {
  tokens: Token[];
  active: PlayerId[];
  current: PlayerId;
  phase: Phase;
  dice: number | null;
  streak: number;
  winners: PlayerId[];
  legal: Move[];
  notice: string | null;
};

const RANK = ["1st", "2nd", "3rd", "4th"];

export function initialGame(seats: readonly PlayerId[]): GameState {
  const active = ([0, 1, 2, 3] as PlayerId[]).filter((id) => seats.includes(id));
  const tokens: Token[] = [];
  for (const player of active) {
    for (let index = 0; index < 4; index++) {
      tokens.push({ id: `${player}-${index}`, player, index, pos: -1 });
    }
  }
  return {
    tokens,
    active,
    current: active[0] ?? 0,
    phase: "roll",
    dice: null,
    streak: 0,
    winners: [],
    legal: [],
    notice: null,
  };
}

function foesOn(tokens: Token[], player: number, trackPos: number) {
  if (trackPos < 0 || trackPos >= HOME_START) return [];
  const cell = globalIndex(player, trackPos);
  return tokens.filter(
    (token) =>
      token.player !== player &&
      token.pos >= 0 &&
      token.pos < HOME_START &&
      globalIndex(token.player, token.pos) === cell,
  );
}

function landingBlocked(tokens: Token[], player: number, trackPos: number) {
  const foes = foesOn(tokens, player, trackPos);
  if (foes.length === 0) return false;
  if (SAFE.has(globalIndex(player, trackPos))) return true;
  const counts = new Map<number, number>();
  for (const foe of foes) counts.set(foe.player, (counts.get(foe.player) ?? 0) + 1);
  for (const count of counts.values()) {
    if (count >= 2) return true;
  }
  return false;
}

export function legalMoves(tokens: Token[], player: PlayerId, dice: number): Move[] {
  const moves: Move[] = [];
  for (const token of tokens) {
    if (token.player !== player || token.pos === FINISH) continue;
    if (token.pos < 0) {
      if (dice !== 6 || landingBlocked(tokens, player, 0)) continue;
      moves.push({ tokenId: token.id, from: -1, to: 0 });
      continue;
    }
    const to = token.pos + dice;
    if (to > FINISH || landingBlocked(tokens, player, to)) continue;
    moves.push({ tokenId: token.id, from: token.pos, to });
  }
  return moves;
}

function nextPlayer(active: readonly PlayerId[], winners: readonly PlayerId[], from: PlayerId): PlayerId {
  const start = active.indexOf(from);
  for (let step = 1; step <= active.length; step++) {
    const id = active[(start + step) % active.length];
    if (!winners.includes(id)) return id;
  }
  return from;
}

function passTurn(state: GameState, dice: number, notice: string): GameState {
  return {
    ...state,
    dice,
    legal: [],
    streak: 0,
    phase: "roll",
    current: nextPlayer(state.active, state.winners, state.current),
    notice,
  };
}

export function applyRoll(state: GameState, value: number): GameState {
  if (state.phase !== "roll" || value < 1 || value > 6) return state;
  const streak = value === 6 ? state.streak + 1 : 0;
  if (value === 6 && streak >= 3) {
    const next = nextPlayer(state.active, state.winners, state.current);
    return passTurn(
      state,
      value,
      `Three sixes. Turn cancelled. ${PLAYERS[next].name}'s turn.`,
    );
  }
  const legal = legalMoves(state.tokens, state.current, value);
  if (legal.length === 0) {
    const next = nextPlayer(state.active, state.winners, state.current);
    return passTurn(state, value, `No legal move. ${PLAYERS[next].name}'s turn.`);
  }
  return { ...state, dice: value, streak, legal, phase: "select", notice: null };
}

function capturedIds(tokens: Token[], mover: Token) {
  if (mover.pos < 0 || mover.pos >= HOME_START) return [];
  if (SAFE.has(globalIndex(mover.player, mover.pos))) return [];
  const foes = foesOn(tokens, mover.player, mover.pos);
  const counts = new Map<number, number>();
  for (const foe of foes) counts.set(foe.player, (counts.get(foe.player) ?? 0) + 1);
  return foes.filter((foe) => (counts.get(foe.player) ?? 0) === 1).map((foe) => foe.id);
}

export function applyMove(state: GameState, tokenId: string): GameState {
  const move = state.legal.find((item) => item.tokenId === tokenId);
  if (!move || state.phase !== "select" || state.dice == null) return state;

  let tokens = state.tokens.map((token) =>
    token.id === tokenId ? { ...token, pos: move.to } : token,
  );
  const mover = tokens.find((token) => token.id === tokenId)!;
  const caught = new Set(capturedIds(tokens, mover));
  if (caught.size > 0) {
    tokens = tokens.map((token) => (caught.has(token.id) ? { ...token, pos: -1 } : token));
  }

  const justWon =
    !state.winners.includes(mover.player) &&
    tokens.every((token) => token.player !== mover.player || token.pos === FINISH);

  let winners = state.winners;
  let place = 0;
  if (justWon) {
    winners = [...winners, mover.player];
    place = winners.length;
  }

  const placesNeeded = state.active.length - 1;
  const gameOver = winners.length >= placesNeeded;
  if (gameOver && winners.length === placesNeeded) {
    const last = state.active.find((id) => !winners.includes(id));
    if (last !== undefined) winners = [...winners, last];
  }

  const extra =
    !gameOver && !justWon && (state.dice === 6 || caught.size > 0 || move.to === FINISH);

  const current = (
    gameOver ? state.current : extra ? state.current : nextPlayer(state.active, winners, state.current)
  ) as PlayerId;

  let notice: string | null = null;
  if (!gameOver && justWon) {
    notice = `${PLAYERS[mover.player].name} takes ${RANK[place - 1]}. ${PLAYERS[current].name}'s turn.`;
  } else if (extra && caught.size > 0) {
    notice = "Captured. Roll again.";
  } else if (extra && move.to === FINISH) {
    notice = "Token home. Roll again.";
  } else if (extra) {
    notice = "Six. Roll again.";
  } else if (!gameOver) {
    notice = `${PLAYERS[current].name}'s turn. Pass the phone.`;
  }

  return {
    tokens,
    active: state.active,
    current,
    phase: gameOver ? "over" : "roll",
    dice: state.dice,
    streak: extra ? state.streak : 0,
    winners,
    legal: [],
    notice,
  };
}
