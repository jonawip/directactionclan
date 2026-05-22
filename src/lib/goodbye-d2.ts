/**
 * Goodbye D2 homepage takeover.
 * Live on site from PREVIEW_START through 15.06.2026 (UTC); reverts 16.06.2026.
 * Calendar/API week window stays 09.06 – 15.06. Override: PUBLIC_GOODBYE_D2=on|off
 */

const LONDON = 'Europe/London';

/** When the homepage takeover first appears (marketing preview). */
export const GOODBYE_D2_PREVIEW_START = new Date('2026-05-22T00:00:00.000Z');

/** First day of the farewell week (sessions, calendar). */
export const GOODBYE_D2_TAKEOVER_START = new Date('2026-06-09T00:00:00.000Z');
export const GOODBYE_D2_TAKEOVER_END_EXCLUSIVE = new Date('2026-06-16T00:00:00.000Z');
export const GOODBYE_D2_MONUMENT_DATE = new Date('2026-06-09T00:00:00.000Z');

export const GOODBYE_D2_CALENDAR_START_KEY = '2026-06-09';
export const GOODBYE_D2_CALENDAR_END_KEY = '2026-06-15';

/** @deprecated */
export const GOODBYE_D2_WEEK_START = GOODBYE_D2_TAKEOVER_START;
/** @deprecated */
export const GOODBYE_D2_WEEK_END_EXCLUSIVE = GOODBYE_D2_TAKEOVER_END_EXCLUSIVE;

export type GoodbyeD2Override = 'on' | 'off' | undefined;

export function getGoodbyeD2Override(): GoodbyeD2Override {
  const raw = import.meta.env.PUBLIC_GOODBYE_D2;
  if (raw === 'on' || raw === 'off') return raw;
  return undefined;
}

export function isGoodbyeD2Active(at: Date = new Date()): boolean {
  const override = getGoodbyeD2Override();
  if (override === 'on') return true;
  if (override === 'off') return false;
  const t = at.getTime();
  return (
    t >= GOODBYE_D2_PREVIEW_START.getTime() &&
    t < GOODBYE_D2_TAKEOVER_END_EXCLUSIVE.getTime()
  );
}

export function formatGoodbyeD2DateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-');
  return `${d}.${m}.${y}`;
}

export function getGoodbyeD2RangeLabel(): string {
  return `${formatGoodbyeD2DateKey(GOODBYE_D2_CALENDAR_START_KEY)} - ${formatGoodbyeD2DateKey(GOODBYE_D2_CALENDAR_END_KEY)}`;
}

export function getGoodbyeD2RangeDatetime(): string {
  return `${GOODBYE_D2_CALENDAR_START_KEY}/${GOODBYE_D2_CALENDAR_END_KEY}`;
}

/** @deprecated */
export const GOODBYE_D2_WEEK_LABEL = getGoodbyeD2RangeLabel();

export const GOODBYE_D2_HERO = {
  desktopBase: '/goodbye-d2/hero-desktop',
  mobileBase: '/goodbye-d2/hero-mobile',
  alt: "A mosaic of years of Direct Action's Destiny 2 screenshots, overlaid with the words 'Thank you for all of the memories'."
} as const;
