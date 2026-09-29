"use client";

import Link from "next/link";
import { useState } from "react";
import { PLAYERS, type PlayerId } from "@/lib/ludo/board";
import {
  playCut,
  playDiceShake,
  playFinalPass,
  playStamp,
  primeAudio,
} from "@/lib/ludo/audio";
import {
  BOARD_COLORS,
  defaultSeats,
  type BoardColorId,
  type MatchConfig,
} from "@/lib/ludo/options";

const COUNTS = [2, 3, 4] as const;

export function SetupScreen({
  onStart,
}: {
  onStart: (config: MatchConfig) => void;
}) {
  const [count, setCount] = useState<2 | 3 | 4>(4);
  const [seats, setSeats] = useState<PlayerId[]>(defaultSeats(4));
  const [boardId, setBoardId] = useState<BoardColorId>("ivory");
  const [sound, setSound] = useState(true);

  function chooseCount(next: 2 | 3 | 4) {
    setCount(next);
    setSeats(defaultSeats(next));
  }

  function toggleSeat(id: PlayerId) {
    if (count === 4) return;
    setSeats((current) => {
      if (current.includes(id)) return current.filter((seat) => seat !== id);
      if (current.length >= count) return current;
      return [...current, id];
    });
  }

  const ready = seats.length === count;
  const board =
    BOARD_COLORS.find((item) => item.id === boardId) ?? BOARD_COLORS[0];

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#04140f] text-white sm:p-4">
      <main className="flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#10281f] sm:h-[min(920px,100dvh)] sm:rounded-[28px] sm:border sm:border-white/10 sm:shadow-2xl">
        <div className="min-h-0 flex-1 overflow-auto px-4 pt-[max(16px,env(safe-area-inset-top))] pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[1.65rem] leading-none font-semibold tracking-tight">
                Ludo
              </h1>
              <p className="mt-1 text-xs text-white/65">
                Pass and play on one phone
              </p>
            </div>
            <Link
              href="/about"
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium"
            >
              About
            </Link>
          </div>

          <section className="mt-6">
            <h2 className="text-sm font-semibold">Players</h2>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {COUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => chooseCount(value)}
                  aria-pressed={count === value}
                  className={`h-11 rounded-2xl text-sm font-semibold ${count === value ? "bg-white text-[#10281f]" : "bg-white/10"}`}
                >
                  {value}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <h2 className="text-sm font-semibold">
              {count === 4 ? "Colors" : `Choose ${count} colors`}
            </h2>
            <p className="mt-1 text-xs text-white/60">
              {count === 2
                ? "Pick the two colors that will play. Empty yards stay on the board."
                : count === 3
                  ? "Pick three colors. The color you leave out does not play."
                  : "All four colors play, in clockwise order."}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {PLAYERS.map((player) => {
                const selected = seats.includes(player.id);
                return (
                  <button
                    key={player.id}
                    type="button"
                    disabled={count === 4}
                    onClick={() => toggleSeat(player.id)}
                    aria-pressed={selected}
                    className="flex h-12 items-center gap-2 rounded-2xl px-3 text-sm font-semibold disabled:opacity-100"
                    style={{
                      background: selected
                        ? player.color
                        : "rgba(255,255,255,.08)",
                      color: selected ? player.ink : "rgba(255,255,255,.85)",
                      boxShadow: selected
                        ? "inset 0 0 0 2px rgba(255,255,255,.7)"
                        : undefined,
                    }}
                  >
                    <span className="size-3 rounded-full bg-white/80" />
                    {player.name}
                  </button>
                );
              })}
            </div>
            {count < 4 && !ready ? (
              <p className="mt-2 text-xs text-[#f0b429]">
                Select {count - seats.length} more.
              </p>
            ) : null}
          </section>

          <section className="mt-5">
            <h2 className="text-sm font-semibold">Board color</h2>
            <p className="mt-1 text-xs text-white/60">
              Colors the track squares on the board.
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {BOARD_COLORS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBoardId(item.id)}
                  aria-pressed={boardId === item.id}
                  className="rounded-2xl p-1.5"
                  style={{
                    boxShadow:
                      boardId === item.id
                        ? "0 0 0 2px #ffe08a"
                        : "0 0 0 1px rgba(255,255,255,.12)",
                  }}
                >
                  <span
                    className="block h-10 rounded-xl"
                    style={{
                      background: item.cell,
                      boxShadow: `inset 0 0 0 3px ${item.surface}`,
                    }}
                  />
                  <span className="mt-1 block text-center text-[11px] font-medium">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <h2 className="text-sm font-semibold">Dice sound</h2>
            <button
              type="button"
              onClick={() => setSound((value) => !value)}
              aria-pressed={sound}
              className="mt-2 flex h-11 w-full items-center justify-between rounded-2xl bg-white/10 px-3 text-sm font-semibold"
            >
              <span>{sound ? "Sound on" : "Sound off"}</span>
              <span
                className={`h-6 w-11 rounded-full p-0.5 ${sound ? "bg-[#1c8a42]" : "bg-white/20"}`}
              >
                <span
                  className={`block size-5 rounded-full bg-white ${sound ? "ml-auto" : ""}`}
                />
              </span>
            </button>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(
                [
                  ["Dice", playDiceShake],
                  ["Cut", playCut],
                  ["Final", playFinalPass],
                  ["Stamp", playStamp],
                ] as const
              ).map(([label, play]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    primeAudio();
                    play();
                  }}
                  className="h-9 rounded-full bg-white/10 text-xs font-semibold"
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-white/50">
              Preview only. These are the sounds used in a match.
            </p>
          </section>
        </div>
        <div className="shrink-0 border-t border-white/10 bg-[#10281f] px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              if (sound) primeAudio();
              onStart({ seats, boardId, sound });
            }}
            className="h-12 w-full rounded-full text-sm font-semibold text-[#10281f] disabled:opacity-40"
            style={{ background: board.surface }}
          >
            Start game
          </button>
        </div>
      </main>
    </div>
  );
}
