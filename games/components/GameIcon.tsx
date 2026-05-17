import { accentCssVar } from "@/lib/games/catalogue";
import type { AccentColour } from "@/types/domain";

type Props = {
  src: string;
  accent: AccentColour;
  size: number;
  className?: string;
  /** Use on filled accent buttons (e.g. selected filter) */
  tone?: "accent" | "contrast";
};

function isSvgSrc(src: string): boolean {
  return src.toLowerCase().endsWith(".svg");
}

export function GameIcon({
  src,
  accent,
  size,
  className = "",
  tone = "accent",
}: Props) {
  const dimension = { width: size, height: size };
  const colour =
    tone === "contrast" ? "var(--bg)" : accentCssVar(accent);

  if (!isSvgSrc(src)) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 object-contain ${className}`.trim()}
        style={dimension}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 ${className}`.trim()}
      style={{
        ...dimension,
        backgroundColor: colour,
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
