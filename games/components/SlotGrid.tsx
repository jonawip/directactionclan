import { uiCopy } from "@/lib/ui/copy";
import type { RsvpWithProfile } from "@/types/domain";

type Props = {
  maxPlayers: number;
  rsvps: RsvpWithProfile[];
  variant?: "default" | "card";
};

export function SlotGrid({ maxPlayers, rsvps, variant = "default" }: Props) {
  const slots = Array.from({ length: maxPlayers }, (_, i) => {
    const rsvp = rsvps[i];
    return rsvp ?? null;
  });

  const gridClass =
    variant === "card"
      ? "slot-grid slot-grid--card grid grid-cols-3 list-none m-0 p-0 sm:grid-cols-4"
      : "slot-grid grid grid-cols-3 list-none m-0 p-0 sm:grid-cols-4";

  return (
    <ul
      className={gridClass}
      aria-label={`${rsvps.length} of ${maxPlayers} slots filled`}
    >
      {slots.map((rsvp, index) => (
        <li
          key={rsvp?.user_id ?? `empty-${index}`}
          className={
            rsvp
              ? "slot-grid-item slot-grid-item--filled flex items-center gap-3"
              : "slot-grid-item slot-grid-item--empty flex items-center gap-2"
          }
        >
          {rsvp ? (
            <>
              {rsvp.profiles.avatar_url ? (
                <img
                  src={rsvp.profiles.avatar_url}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <span
                  className="slot-grid-avatar flex h-6 w-6 items-center justify-center rounded-full"
                  aria-hidden
                >
                  {(rsvp.profiles.display_name[0] ?? "?").toUpperCase()}
                </span>
              )}
              <span className="truncate">
                {rsvp.profiles.handle
                  ? `@${rsvp.profiles.handle}`
                  : rsvp.profiles.display_name}
              </span>
            </>
          ) : (
            <>
              <span className="slot-grid-empty-icon" aria-hidden>
                +
              </span>
              <span className="slot-grid-empty-label font-label">
                {uiCopy.sessionCard.slotAvailable}
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
