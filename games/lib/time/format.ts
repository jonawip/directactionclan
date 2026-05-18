import {
  addDays,
  formatDistanceToNow,
  isSameDay,
  isValid,
} from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

export type FormattedGameTime = {
  label: string;
  relative: string;
};

function parseGameDate(iso: string): Date | null {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  return isValid(date) ? date : null;
}

/** Stable label for SSR and first paint — no “today”/relative wording that depends on `now`. */
export function formatGameTimeStable(
  iso: string,
  timezone: string,
): Pick<FormattedGameTime, "label"> {
  const date = parseGameDate(iso);
  if (!date) {
    return { label: "Time not set" };
  }

  try {
    return {
      label: formatInTimeZone(date, timezone, "EEE d MMM yyyy, HH:mm zzz"),
    };
  } catch {
    return { label: "Time not set" };
  }
}

export function formatGameTime(
  iso: string,
  timezone: string,
): FormattedGameTime {
  const date = parseGameDate(iso);
  if (!date) {
    return { label: "Time not set", relative: "" };
  }

  try {
    const nowInTz = toZonedTime(new Date(), timezone);
    const dateInTz = toZonedTime(date, timezone);
    const timeStr = formatInTimeZone(date, timezone, "HH:mm zzz");

    let dayLabel: string;
    if (isSameDay(dateInTz, nowInTz)) {
      dayLabel = "Today";
    } else if (isSameDay(dateInTz, addDays(nowInTz, 1))) {
      dayLabel = "Tomorrow";
    } else {
      dayLabel = formatInTimeZone(date, timezone, "EEE d MMM");
    }

    const relative = formatDistanceToNow(date, { addSuffix: true });

    return {
      label: `${dayLabel} ${timeStr}`,
      relative,
    };
  } catch {
    return {
      label: formatInTimeZone(date, timezone, "EEE d MMM HH:mm zzz"),
      relative: "",
    };
  }
}

export function discordTimestamp(iso: string): string {
  const date = parseGameDate(iso);
  if (!date) {
    return "Time not set";
  }
  const unix = Math.floor(date.getTime() / 1000);
  return `<t:${unix}:F> (<t:${unix}:R>)`;
}
