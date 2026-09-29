import { memo } from "react";
import { BASE, HOME, PATH, PLAYERS, SAFE, SLOTS, STARTS } from "@/lib/ludo/board";

const START_DIR = ["right", "down", "left", "up"] as const;
const START_PLAYER = new Map<number, number>(STARTS.map((cell, player) => [cell, player]));

function Arrow({
  row,
  col,
  dir,
}: {
  row: number;
  col: number;
  dir: (typeof START_DIR)[number];
}) {
  const rot = { right: 0, down: 90, left: 180, up: -90 }[dir];
  return (
    <polygon
      points="-1.5,-2 2.1,0 -1.5,2"
      fill="rgba(255,255,255,.92)"
      transform={`translate(${col * 10 + 5} ${row * 10 + 5}) rotate(${rot})`}
    />
  );
}

function Star({ row, col }: { row: number; col: number }) {
  return (
    <polygon
      points="0,-2.15 .55,-.62 2.15,-.62 .9,.28 1.35,1.9 0,.95 -1.35,1.9 -.9,.28 -2.15,-.62 -.55,-.62"
      fill="#c9842a"
      transform={`translate(${col * 10 + 5} ${row * 10 + 5})`}
    />
  );
}

function BoardSvgBase({
  turn,
  playing,
  surface,
  cellColor,
}: {
  turn: number;
  playing: readonly number[];
  surface: string;
  cellColor: string;
}) {
  const inGame = (id: number) => playing.includes(id);
  const colorOf = (id: number) => (inGame(id) ? PLAYERS[id].color : "#c4baac");
  const yardOf = (id: number) => (inGame(id) ? PLAYERS[id].yard : "#ddd4c6");
  return (
    <svg viewBox="0 0 150 150" className="absolute inset-0 h-full w-full" aria-hidden>
      <rect width="150" height="150" rx="7" fill={surface} />
      {PLAYERS.map((player) => {
        const base = BASE[player.id];
        const x = base.col * 10;
        const y = base.row * 10;
        return (
          <g key={player.id}>
            <rect x={x} y={y} width="60" height="60" fill={yardOf(player.id)} />
            <rect x={x + 7} y={y + 7} width="46" height="46" rx="8" fill={colorOf(player.id)} />
            {SLOTS.map((slot) => (
              <circle
                key={`${slot.row}-${slot.col}`}
                cx={x + slot.col * 10 + 5}
                cy={y + slot.row * 10 + 5}
                r="3.35"
                fill="rgba(0,0,0,.18)"
              />
            ))}
            {turn === player.id && (
              <rect
                x={x + 1.2}
                y={y + 1.2}
                width="57.6"
                height="57.6"
                rx="2"
                fill="none"
                stroke="#ffe08a"
                strokeWidth="1.7"
              />
            )}
          </g>
        );
      })}
      {PATH.map((cell, index) => {
        const start = START_PLAYER.get(index);
        const fill = start === undefined ? cellColor : colorOf(start);
        return (
          <rect
            key={`${cell.row}-${cell.col}`}
            x={cell.col * 10 + 0.55}
            y={cell.row * 10 + 0.55}
            width="8.9"
            height="8.9"
            rx="1.3"
            fill={fill}
          />
        );
      })}
      {HOME.map((lane, player) =>
        lane.map((cell) => (
          <rect
            key={`${player}-${cell.row}-${cell.col}`}
            x={cell.col * 10 + 0.55}
            y={cell.row * 10 + 0.55}
            width="8.9"
            height="8.9"
            rx="1.3"
            fill={colorOf(player)}
          />
        )),
      )}
      <polygon points="60,60 60,90 75,75" fill={colorOf(0)} />
      <polygon points="60,60 90,60 75,75" fill={colorOf(1)} />
      <polygon points="90,60 90,90 75,75" fill={colorOf(2)} />
      <polygon points="60,90 90,90 75,75" fill={colorOf(3)} />
      {PATH.map((cell, index) =>
        SAFE.has(index) && !START_PLAYER.has(index) ? (
          <Star key={`star-${index}`} row={cell.row} col={cell.col} />
        ) : null,
      )}
      {STARTS.map((index, player) => (
        <Arrow
          key={`arrow-${player}`}
          row={PATH[index].row}
          col={PATH[index].col}
          dir={START_DIR[player]}
        />
      ))}
    </svg>
  );
}

export const BoardSvg = memo(BoardSvgBase);
