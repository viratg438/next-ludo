import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Ludo — Pass and Play Rules",
  description:
    "How this browser Ludo game works: two, three, or four players on one phone, classic capture rules, board colors, and no account or download.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Ludo — Pass and Play Rules",
    description:
      "A local Ludo game for one phone. Choose 2, 3, or 4 players, pick colors, and pass the phone each turn.",
    url: "/about",
    type: "article",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-[#04140f] text-[#f6edd9]">
      <article className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#f0b429] uppercase">
          Next Ludo
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
          About this game
        </h1>
        <p className="mt-4 text-lg leading-8 text-white/80">
          This is a pass-and-play Ludo board for the browser. Everyone sits
          together and uses one phone. There is no lobby, no sign-in, and no
          download. Open the page, choose who is playing, and pass the phone
          when the turn changes.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-white">
          Who can play
        </h2>
        <p className="mt-3 leading-7 text-white/75">
          A match can be two, three, or four players. Four players use every
          color: red, green, yellow, and blue. With two or three players, you
          choose which colors sit at the board. Yards you leave out stay
          visible, but those colors do not roll or move. Turns follow the board
          clockwise, starting with the first selected color in that order.
        </p>
        <p className="mt-3 leading-7 text-white/75">
          You can also pick the board color before the first roll: ivory, sky,
          rose, or mint. The dice can shake with sound, and that sound can be
          switched off before the game or from the match screen.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-white">
          How a turn works
        </h2>
        <p className="mt-3 leading-7 text-white/75">
          Each player has four tokens in a colored yard. Roll a six to bring a
          token onto the arrow at the start of your path. The six is used to
          come out; the token does not walk six steps on that same roll. After a
          six you roll again. Three sixes in a row cancel the third roll and the
          turn passes.
        </p>
        <p className="mt-3 leading-7 text-white/75">
          On the track, a token moves the exact number you rolled. If it lands
          on one opponent token, that token goes back to its yard and you roll
          again. Star squares and the colored start arrows are safe. Two tokens
          of the same color on one square cannot be captured, and another player
          cannot land on them. You may pass through a square without stopping.
        </p>
        <p className="mt-3 leading-7 text-white/75">
          After a full loop, a token enters its own colored home column. Only an
          exact roll can move it into the center. Reaching the center also earns
          another roll, unless that token was your fourth and you have finished.
          The match ends when every player but one has brought all four tokens
          home. The remaining player is last, and the result lists 1st through
          last.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-white">
          Play on one screen
        </h2>
        <p className="mt-3 leading-7 text-white/75">
          The board is drawn for a phone. On a computer it sits in a narrow
          frame so the same layout stays readable. Nothing is stored on a
          server. Refreshing the page starts you back at the setup screen.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-[#f6edd9] px-6 text-sm font-semibold text-[#10281f]"
        >
          Play Ludo
        </Link>

        <section className="mt-14 border-t border-white/10 pt-10">
          <h2 className="text-sm font-semibold text-white">About Me</h2>
          <p className="mt-4 text-2xl font-semibold text-white">Vivek Gupta</p>
          <p className="mt-1 text-sm font-medium tracking-wide text-[#f0b429]">
            Senior Frontend Developer
          </p>
          <p className="mt-4 leading-7 text-white/75">
            I&apos;m a Senior Frontend Developer focused on building fast,
            scalable, and intuitive web experiences with React, Next.js, and
            TypeScript.
          </p>
          <p className="mt-3 leading-7 text-white/75">
            I enjoy turning complex ideas into clean, production-ready
            interfaces with a strong focus on performance, accessibility, and
            user experience.
          </p>
          <p className="mt-3 leading-7 text-white/75">
            Currently exploring how AI can make modern SaaS products smarter,
            more efficient, and easier to use.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li>
              <a
                className="text-white underline decoration-white/30 underline-offset-4"
                href="mailto:viratg438@gmail.com"
              >
                viratg438@gmail.com
              </a>
            </li>
            <li>
              <a
                className="text-white underline decoration-white/30 underline-offset-4"
                href="tel:+917042303747"
              >
                +91 7042 30 3747
              </a>
            </li>
          </ul>
        </section>
      </article>
    </div>
  );
}
