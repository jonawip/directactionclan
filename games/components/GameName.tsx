import { findGame } from "@/lib/games/catalogue";
import { GameIcon } from "@/components/GameIcon";

type Props = {
  gameSlug: string;
  iconOnly?: boolean;
  size?: number;
  className?: string;
  iconTone?: "accent" | "contrast";
};

export function GameName({
  gameSlug,
  iconOnly = false,
  size = 20,
  className = "",
  iconTone = "accent",
}: Props) {
  const game = findGame(gameSlug);
  if (!game) {
    return <span className={className}>{gameSlug}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <GameIcon
        src={game.iconSrc}
        accent={game.accent}
        size={size}
        tone={iconTone}
      />
      {!iconOnly && <span>{game.name}</span>}
    </span>
  );
}
