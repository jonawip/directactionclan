"use client";

import { useEffect, useState } from "react";
import {
  formatGameTime,
  type FormattedGameTime,
} from "@/lib/time/format";

type Props = {
  iso: string;
  timezone: string;
  className?: string;
  variant?: "stacked" | "inline";
};

function formatSafe(iso: string, timezone: string): FormattedGameTime {
  return formatGameTime(iso, timezone);
}

export function LocalTime({
  iso,
  timezone,
  className,
  variant = "stacked",
}: Props) {
  const [formatted, setFormatted] = useState(() =>
    formatSafe(iso, timezone),
  );

  useEffect(() => {
    setFormatted(formatSafe(iso, timezone));
  }, [iso, timezone]);

  if (variant === "inline") {
    return (
      <time dateTime={iso} className={className} suppressHydrationWarning>
        <span>{formatted.label}</span>
        {formatted.relative ? (
          <>
            <span className="text-[var(--fg-faint)]" aria-hidden>
              {" "}
              ·{" "}
            </span>
            <span className="text-[var(--fg-dim)] text-[0.9em]">
              {formatted.relative}
            </span>
          </>
        ) : null}
      </time>
    );
  }

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      <span className="block">{formatted.label}</span>
      {formatted.relative ? (
        <span className="text-[var(--fg-dim)] text-xs">{formatted.relative}</span>
      ) : null}
    </time>
  );
}
