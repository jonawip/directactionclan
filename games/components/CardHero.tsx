import { accentCssVar } from "@/lib/games/catalogue";
import type { AccentColour } from "@/types/domain";

type Props = {
  src: string;
  accent: AccentColour;
  variant?: "card" | "detail";
};

export function CardHero({ src, accent, variant = "card" }: Props) {
  return (
    <figure
      className={
        variant === "detail" ? "card-hero card-hero--detail" : "card-hero"
      }
    >
      <img src={src} alt="" />
      <span
        className="card-hero-accent"
        style={{ background: accentCssVar(accent) }}
        aria-hidden
      />
    </figure>
  );
}
