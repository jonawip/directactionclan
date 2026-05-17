import type { WebhookEvent } from "@/types/domain";

/** Half-width of the start-time window (minutes). Cron runs every 5 minutes. */
export const REMINDER_WINDOW_HALF_MINUTES = 3;

export type GameReminderSchedule = {
  event: WebhookEvent;
  minutesBefore: number;
  lead: string;
  titleSuffix: string;
};

export const GAME_START_REMINDERS: GameReminderSchedule[] = [
  {
    event: "game.reminder_60m",
    minutesBefore: 60,
    lead: "Starts in about **1 hour**.",
    titleSuffix: "1 hour",
  },
  {
    event: "game.reminder_30m",
    minutesBefore: 30,
    lead: "Starts in about **30 minutes**.",
    titleSuffix: "30 minutes",
  },
];

export function reminderWindow(
  now: Date,
  minutesBefore: number,
): { start: string; end: string } {
  const start = new Date(now);
  start.setMinutes(
    start.getMinutes() + minutesBefore - REMINDER_WINDOW_HALF_MINUTES,
  );
  const end = new Date(now);
  end.setMinutes(
    end.getMinutes() + minutesBefore + REMINDER_WINDOW_HALF_MINUTES,
  );
  return { start: start.toISOString(), end: end.toISOString() };
}
