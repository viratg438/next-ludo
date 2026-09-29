"use client";

import { useRef, useState } from "react";
import { cellFor, FINISH, PLAYERS, globalIndex } from "@/lib/ludo/board";
import {
  playCut,
  playDiceShake,
  playFinalPass,
  playStamp,
} from "@/lib/ludo/audio";
import {
  applyMove,
  applyRoll,
  initialGame,
  type GameState,
  type Move,
  type Token,
} from "@/lib/ludo/engine";
import { boardColor, type MatchConfig } from "@/lib/ludo/options";
import { BoardSvg } from "./board-svg";
import { SetupScreen } from "./setup-screen";

const RANK = ["1st", "2nd", "3rd", "4th"];
const STARS = new Set([8, 21, 34, 47]);

function playBoardSound(base: GameState, move: Move, next: GameState) {
  const captured = next.tokens.some((token) => {
    if (token.id === move.tokenId) return false;
    const previous = base.tokens.find((item) => item.id === token.id);
    return previous !== undefined && previous.pos >= 0 && token.pos < 0;
  });
  if (captured) {
    playCut();
    return;
  }
  if (move.to === FINISH) {
    playFinalPass();
    return;
  }
  const mover = base.tokens.find((item) => item.id === move.tokenId);
  if (mover && move.to < 51 && STARS.has(globalIndex(mover.player, move.to))) {
    playStamp();
  }
}

function wait(ms: number) {
  if (ms <= 0) return Promise.resolve();
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function rollDie() {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return (buffer[0] % 6) + 1;
}

function Pips({ value }: { value: number }) {
  const on = new Set<number>();
  if (value === 1) on.add(4);
  if (value === 2) [0, 8].forEach((n) => on.add(n));
  if (value === 3) [0, 4, 8].forEach((n) => on.add(n));
  if (value === 4) [0, 2, 6, 8].forEach((n) => on.add(n));
  if (value === 5) [0, 2, 4, 6, 8].forEach((n) => on.add(n));
  if (value === 6) [0, 2, 3, 5, 6, 8].forEach((n) => on.add(n));
  return (
    <span className="grid h-full w-full grid-cols-3 grid-rows-3 p-2">
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} className="flex items-center justify-center">
          {on.has(index) ? (
            <span className="size-2 rounded-full bg-[#1a1a1a]" />
          ) : null}
        </span>
      ))}
    </span>
  );
}

function statusText(game: GameState, spinning: boolean) {
  if (spinning) return "Rolling…";
  if (game.phase === "over") return "Game over";
  if (game.phase === "select") return "Tap a glowing token";
  if (game.notice) return game.notice;
  return `${PLAYERS[game.current].name}'s turn. Roll the dice.`;
}

function placedTokens(
  tokens: Token[],
  hop: { id: string; pos: number } | null,
) {
  const shown = tokens.map((token) => {
    const pos = hop?.id === token.id ? hop.pos : token.pos;
    const cell = cellFor(token.player, token.index, pos);
    return { token, pos, row: cell.row, col: cell.col };
  });
  const groups = new Map<string, number[]>();
  shown.forEach((item, index) => {
    if (item.pos < 0 || item.pos >= FINISH) return;
    const key = `${item.row},${item.col}`;
    const list = groups.get(key) ?? [];
    list.push(index);
    groups.set(key, list);
  });
  return shown.map((item, index) => {
    let dx = 0;
    let dy = 0;
    if (item.pos >= 0 && item.pos < FINISH) {
      const list = groups.get(`${item.row},${item.col}`) ?? [index];
      if (list.length > 1) {
        const order = list.indexOf(index);
        const angle = (Math.PI * 2 * order) / list.length - Math.PI / 2;
        dx = Math.cos(angle) * 0.22;
        dy = Math.sin(angle) * 0.22;
      }
    }
    return { ...item, x: item.col + dx, y: item.row + dy };
  });
}

function MatchScreen({
  config,
  onExit,
}: {
  config: MatchConfig;
  onExit: () => void;
}) {
  const [game, setGame] = useState(() => initialGame(config.seats));
  const [spinning, setSpinning] = useState(false);
  const [hop, setHop] = useState<{ id: string; pos: number } | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [sound, setSound] = useState(config.sound);
  const soundRef = useRef(config.sound);
  const busyRef = useRef(false);
  const gen = useRef(0);
  const colors = boardColor(config.boardId);

  function setBusy(value: boolean) {
    busyRef.current = value;
  }

  function leave() {
    gen.current += 1;
    setBusy(false);
    setSpinning(false);
    setHop(null);
    setConfirmReset(false);
    onExit();
  }

  async function animateAndMove(base: GameState, move: Move, ticket: number) {
    setBusy(true);
    const token = base.tokens.find((item) => item.id === move.tokenId)!;
    const steps: number[] = [];
    if (token.pos < 0) steps.push(move.to);
    else for (let pos = token.pos + 1; pos <= move.to; pos++) steps.push(pos);
    const hopMs = prefersReducedMotion() ? 0 : 140;
    for (const pos of steps) {
      if (gen.current !== ticket) return;
      setHop({ id: token.id, pos });
      await wait(hopMs);
    }
    if (gen.current !== ticket) return;
    const next = applyMove(base, move.tokenId);
    if (soundRef.current) playBoardSound(base, move, next);
    setGame(next);
    setHop(null);
    setBusy(false);
  }

  async function roll() {
    if (busyRef.current || game.phase !== "roll") return;
    const ticket = gen.current;
    setBusy(true);
    setSpinning(true);
    if (soundRef.current) playDiceShake();
    const value = rollDie();
    await wait(prefersReducedMotion() ? 0 : 520);
    if (gen.current !== ticket) return;
    setSpinning(false);
    const next = applyRoll(game, value);
    setGame(next);
    if (next.phase === "select" && next.legal.length === 1) {
      await wait(prefersReducedMotion() ? 0 : 180);
      if (gen.current !== ticket) return;
      await animateAndMove(next, next.legal[0], ticket);
      return;
    }
    setBusy(false);
  }

  function pick(id: string) {
    if (busyRef.current) return;
    const move = game.legal.find((item) => item.tokenId === id);
    if (!move || game.phase !== "select") return;
    void animateAndMove(game, move, gen.current);
  }

  function askReset() {
    const started =
      game.tokens.some((token) => token.pos >= 0) ||
      game.dice !== null ||
      game.winners.length > 0;
    if (!started || game.phase === "over") {
      leave();
      return;
    }
    setConfirmReset(true);
  }

  const legalIds = new Set(game.legal.map((move) => move.tokenId));
  const pieces = placedTokens(game.tokens, hop);
  const player = PLAYERS[game.current];
  const canRoll = game.phase === "roll" && !spinning;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#04140f] text-white sm:p-4">
      <main className="relative flex h-dvh w-full max-w-[430px] select-none flex-col overflow-hidden bg-[#10281f] sm:h-[min(920px,100dvh)] sm:rounded-[28px] sm:border sm:border-white/10 sm:shadow-2xl">
        <header className="flex shrink-0 items-start justify-between gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))]">
          <div>
            <h1 className="text-[1.65rem] leading-none font-semibold tracking-tight">
              Ludo
            </h1>
            <p className="mt-1 text-xs text-white/65">
              {game.active.length} players · one phone · pass and play
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                soundRef.current = !soundRef.current;
                setSound(soundRef.current);
              }}
              aria-pressed={sound}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium"
            >
              {sound ? "Sound" : "Muted"}
            </button>
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium"
            >
              Rules
            </button>
            <button
              type="button"
              onClick={askReset}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium"
            >
              New
            </button>
          </div>
        </header>

        <div className="mt-3 flex shrink-0 gap-1.5 px-4">
          {game.active.map((id) => {
            const item = PLAYERS[id];
            const place = game.winners.indexOf(item.id);
            const active = game.phase !== "over" && item.id === game.current;
            return (
              <div
                key={item.id}
                className="flex h-8 min-w-0 flex-1 items-center justify-center gap-1 rounded-full text-[11px] font-semibold"
                style={{
                  background: active ? item.color : "rgba(255,255,255,.08)",
                  color: active ? item.ink : "rgba(255,255,255,.8)",
                  boxShadow: active
                    ? `inset 0 0 0 1px rgba(255,255,255,.35)`
                    : undefined,
                }}
              >
                <span className="truncate">{item.name}</span>
                {place >= 0 ? <span>{RANK[place]}</span> : null}
              </div>
            );
          })}
        </div>

        <p
          className="mx-4 mt-2 flex h-10 shrink-0 items-center justify-center overflow-hidden text-center text-sm leading-5 text-white/85"
          aria-live="polite"
        >
          {statusText(game, spinning)}
        </p>

        <div className="flex min-h-0 flex-1 px-3 py-1">
          <div className="grid min-h-0 w-full flex-1 place-items-center [container-type:size]">
            <div className="relative aspect-square w-[min(100cqw,100cqh)]">
              <BoardSvg
                turn={game.phase === "over" ? -1 : game.current}
                playing={game.active}
                surface={colors.surface}
                cellColor={colors.cell}
              />
              {pieces.map(({ token, pos, x, y }) => {
                const color = PLAYERS[token.player];
                const selectable =
                  legalIds.has(token.id) && game.phase === "select";
                return (
                  <div
                    key={token.id}
                    className="absolute top-0 left-0 size-[calc(100%/15)]"
                    style={{
                      transform: `translate3d(${x * 100}%, ${y * 100}%, 0)`,
                      transition: "transform 140ms linear",
                      zIndex: selectable
                        ? 30
                        : hop?.id === token.id
                          ? 25
                          : 10 + token.player,
                    }}
                  >
                    <button
                      type="button"
                      disabled={!selectable}
                      onClick={() => pick(token.id)}
                      aria-label={`${color.name} token ${token.index + 1}${selectable ? ", tap to move" : ""}`}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span
                        className={`flex size-[68%] items-center justify-center rounded-full text-[11px] font-bold shadow-[0_1px_2px_rgba(0,0,0,.45)] ${selectable ? "ludo-token-live" : ""} ${pos === FINISH ? "opacity-95" : ""}`}
                        style={{
                          background: color.color,
                          color: color.ink,
                          boxShadow: selectable
                            ? "0 0 0 2px #fff, 0 0 0 4px #ffe08a"
                            : "0 1px 2px rgba(0,0,0,.45), inset 0 0 0 2px rgba(255,255,255,.85)",
                        }}
                      >
                        {token.index + 1}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="shrink-0 px-4 pb-[max(14px,env(safe-area-inset-bottom))]">
          <div className="flex h-11 items-center justify-center gap-2 mb-2">
            {game.phase === "select" && game.legal.length > 1
              ? game.legal.map((move) => {
                  const token = game.tokens.find(
                    (item) => item.id === move.tokenId,
                  )!;
                  return (
                    <button
                      key={move.tokenId}
                      type="button"
                      onClick={() => pick(move.tokenId)}
                      className="h-9 min-w-9 rounded-full px-3 text-sm font-bold"
                      style={{ background: player.color, color: player.ink }}
                    >
                      {token.index + 1}
                    </button>
                  );
                })
              : null}
          </div>
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => void roll()}
              disabled={!canRoll}
              aria-label={
                game.dice && !spinning
                  ? `Dice shows ${game.dice}. ${canRoll ? `${player.name}, roll again` : `${player.name}'s dice`}`
                  : `${player.name}, roll the dice`
              }
              className={`flex size-[72px] items-center justify-center rounded-2xl bg-[#fffdf8] text-[#1a1a1a] disabled:opacity-80 ${spinning ? "ludo-dice-spin" : ""}`}
              style={{
                boxShadow: `0 8px 18px rgba(0,0,0,.28), 0 0 0 4px ${player.color}`,
              }}
            >
              {game.dice && !spinning ? (
                <Pips value={game.dice} />
              ) : (
                <span className="text-sm font-bold">Roll</span>
              )}
            </button>
          </div>
        </div>

        <section className="sr-only">
          <h2>How to play Ludo</h2>
          <p>
            Local Ludo for one phone, with two, three, or four players. There is
            no online lobby. Pass the phone each turn. Roll a 6 to leave the
            yard. A 6, a capture, or reaching the center earns another roll.
            Three sixes in a row cancels the turn. Stars and start arrows are
            safe. Two tokens of the same color on one square cannot be captured.
            An exact roll is required to finish. The game ends when only one
            player still has tokens left.
          </p>
        </section>

        {rulesOpen ? (
          <div className="absolute inset-0 z-40 flex items-end bg-black/55 p-3 sm:items-center">
            <div className="max-h-[80%] w-full overflow-auto rounded-3xl bg-[#f6edd9] p-5 text-[#1c1914]">
              <h2 className="text-lg font-semibold">How to play</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                <li>
                  Two, three, or four players on one phone. Pass it when the
                  turn changes.
                </li>
                <li>
                  Roll a 6 to move a token out of the yard onto your arrow.
                </li>
                <li>
                  A 6, a capture, or reaching the center gives another roll.
                </li>
                <li>Three sixes in a row cancels that roll.</li>
                <li>
                  Land on a single opponent to send them back. Stars and arrows
                  are safe.
                </li>
                <li>Two of your tokens on one square cannot be captured.</li>
                <li>You need the exact number to enter the center.</li>
                <li>
                  First to bring all four home is 1st. The game ends when one
                  player is left.
                </li>
              </ul>
              <button
                type="button"
                onClick={() => setRulesOpen(false)}
                className="mt-4 h-11 w-full rounded-full bg-[#10281f] text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}

        {confirmReset ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 p-6">
            <div className="w-full rounded-3xl bg-[#f6edd9] p-5 text-[#1c1914]">
              <h2 className="text-lg font-semibold">Start a new game?</h2>
              <p className="mt-2 text-sm">This board will be cleared.</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="h-11 flex-1 rounded-full bg-black/10 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={leave}
                  className="h-11 flex-1 rounded-full bg-[#10281f] text-sm font-semibold text-white"
                >
                  New game
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {game.phase === "over" ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 p-6">
            <div className="w-full rounded-3xl bg-[#f6edd9] p-5 text-[#1c1914]">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#8a5a12] uppercase">
                Result
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                {PLAYERS[game.winners[0]].name} wins
              </h2>
              <ol className="mt-4 space-y-2">
                {game.winners.map((id, index) => (
                  <li
                    key={id}
                    className="flex items-center gap-3 text-sm font-semibold"
                  >
                    <span className="w-8 text-[#6b6458]">{RANK[index]}</span>
                    <span
                      className="size-3 rounded-full"
                      style={{ background: PLAYERS[id].color }}
                    />
                    {PLAYERS[id].name}
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={leave}
                className="mt-5 h-11 w-full rounded-full bg-[#10281f] text-sm font-semibold text-white"
              >
                Play again
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export function Game() {
  const [match, setMatch] = useState<MatchConfig | null>(null);
  if (!match) return <SetupScreen onStart={setMatch} />;
  return <MatchScreen config={match} onExit={() => setMatch(null)} />;
}
