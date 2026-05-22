import type { D2WeekSession } from './d2-week-games.ts';
import {
  GOODBYE_D2_CALENDAR_END_KEY,
  GOODBYE_D2_CALENDAR_START_KEY
} from './goodbye-d2.ts';

const LONDON = 'Europe/London';

export type D2WeekDay = {
  dateKey: string;
  label: string;
  weekday: string;
  sessions: D2WeekSession[];
};

function londonDateKey(instant: Date): string {
  return instant.toLocaleDateString('en-CA', { timeZone: LONDON });
}

function addLondonDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const noon = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return londonDateKey(noon);
}

function formatDayLabel(dateKey: string): { weekday: string; label: string } {
  const [y, m, d] = dateKey.split('-').map(Number);
  const noon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const weekday = noon.toLocaleDateString('en-GB', { weekday: 'short', timeZone: LONDON });
  const label = noon.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: LONDON });
  return { weekday, label };
}

/** Mon 9 – Sun 15 Jun 2026 (London dates). */
export function buildD2CalendarDays(sessions: D2WeekSession[]): D2WeekDay[] {
  const days: D2WeekDay[] = [];
  let key = GOODBYE_D2_CALENDAR_START_KEY;

  while (key <= GOODBYE_D2_CALENDAR_END_KEY) {
    const { weekday, label } = formatDayLabel(key);
    days.push({
      dateKey: key,
      label,
      weekday,
      sessions: sessions
        .filter((s) => londonDateKey(new Date(s.startsAt)) === key)
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    });
    key = addLondonDays(key, 1);
  }

  return days;
}

export const buildD2WeekDays = buildD2CalendarDays;

export function formatSessionTimes(iso: string): { local: string; gmt: string; datetime: string } {
  const date = new Date(iso);
  const local = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: LONDON
  });
  const gmt = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short'
  });
  return { local, gmt, datetime: iso };
}
