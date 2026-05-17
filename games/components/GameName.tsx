import { findGame } from "@/lib/games/catalogue";
import { GameIcon } from "@/components/GameIcon";

type Props = {
  gameSlug: string;
  iconOnly?: boolean;
  size?: number;
  className?: string;
  labelClassName?: string;
  iconTone?: "accent" | "contrast";
};

export function GameName({
  gameSlug,
  iconOnly = false,
  size = 20,
  className = "",
  labelClassName = "",
  iconTone = "accent",
}: Props) {
  const game = findGame(gameSlug);
  if (!game) {
    return <span className={className}>{gameSlug}</span>;
  }

  return (
    <span
      className={`inline-flex min-w-0 max-w-full items-center gap-2 ${className}`.trim()}
    >
      <GameIcon
        src={game.iconSrc}
        accent={game.accent}
        size={size}
        tone={iconTone}
      />
      {!iconOnly && (
        <span className={`min-w-0 ${labelClassName}`.trim()}>{game.name}</span>
      )}
    </span>
  );
}
