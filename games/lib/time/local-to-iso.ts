/** Combine profile-local date + time strings into UTC ISO (for timestamptz storage). */
export function localDateTimeToIso(
  datePart: string,
  timePart: string,
  timezone: string,
): string {
  return localToIso(`${datePart}T${timePart}`, timezone);
}

export function isoToLocalParts(
  iso: string,
  timezone: string,
): { date: string; time: string } {
  const formatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(iso));

  const [date, timeWithSeconds] = formatted.split(" ");
  return {
    date: date ?? "",
    time: (timeWithSeconds ?? "12:00:00").slice(0, 5),
  };
}

/** Start of calendar day in the given IANA timezone, as UTC ISO. */
export function dateInTimezoneToUtcStart(
  datePart: string,
  timezone: string,
): string {
  return localDateTimeToIso(datePart, "00:00", timezone);
}

/** End of calendar day in the given IANA timezone, as UTC ISO. */
export function dateInTimezoneToUtcEnd(
  datePart: string,
  timezone: string,
): string {
  return localDateTimeToIso(datePart, "23:59", timezone);
}

export function defaultStartParts(timezone: string): { date: string; time: string } {
  const d = new Date();
  d.setHours(d.getHours() + 2, 0, 0, 0);

  const formatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);

  const [date, timeWithSeconds] = formatted.split(" ");
  return {
    date: date ?? "",
    time: (timeWithSeconds ?? "12:00:00").slice(0, 5),
  };
}

function localToIso(local: string, timezone: string): string {
  const [datePart, timePart] = local.split("T");
  if (!datePart || !timePart) {
    return new Date().toISOString();
  }
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(new Date(Date.UTC(y!, m! - 1, d!, hh!, mm!)));
  const tzPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const offsetMatch = tzPart.match(/GMT([+-]?\d+)?/);
  let offsetMinutes = 0;
  if (offsetMatch?.[1]) {
    offsetMinutes = -Number(offsetMatch[1]) * 60;
  }
  const utc = Date.UTC(y!, m! - 1, d!, hh!, mm!) + offsetMinutes * 60 * 1000;
  return new Date(utc).toISOString();
}
