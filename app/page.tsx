import { Game } from "@/components/ludo/game";
import { siteDescription, siteUrl } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Ludo",
  url: siteUrl,
  description: siteDescription,
  applicationCategory: "Game",
  operatingSystem: "Web",
  playMode: "MultiPlayer",
  numberOfPlayers: {
    "@type": "QuantitativeValue",
    minValue: 2,
    maxValue: 4,
  },
  gamePlatform: "Web browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Game />
    </>
  );
}
