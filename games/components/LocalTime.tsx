"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatGameTime,
  formatGameTimeStable,
  type FormattedGameTime,
} from "@/lib/time/format";

type Props = {
  iso: string;
  timezone: string;
  className?: string;
  variant?: "stacked" | "inline";
};

export function LocalTime({
  iso,
  timezone,
  className,
  variant = "stacked",
}: Props) {
  const stable = useMemo(
    () => formatGameTimeStable(iso, timezone),
    [iso, timezone],
  );
  const [formatted, setFormatted] = useState<FormattedGameTime | null>(null);

  useEffect(() => {
    setFormatted(formatGameTime(iso, timezone));
  }, [iso, timezone]);

  const label = formatted?.label ?? stable.label;
  const relative = formatted?.relative ?? "";

  if (variant === "inline") {
    return (
      <time dateTime={iso} className={className}>
        <span>{label}</span>
        {relative ? (
          <>
            <span className="text-[var(--fg-faint)]" aria-hidden>
              {" "}
              ·{" "}
            </span>
            <span className="text-[var(--fg-dim)] text-[0.9em]">{relative}</span>
          </>
        ) : null}
      </time>
    );
  }

  return (
    <time dateTime={iso} className={className}>
      <span className="block">{label}</span>
      {relative ? (
        <span className="text-[var(--fg-dim)] text-xs">{relative}</span>
      ) : null}
    </time>
  );
}
