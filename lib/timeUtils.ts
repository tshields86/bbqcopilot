import type { TimelineStep } from './types';

/**
 * Parse a time string (e.g., "5:00 AM", "17:00", "5:00 PM") into hours and minutes
 */
export function parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
  // Try 12-hour format first (e.g., "5:00 AM", "11:30 PM")
  const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return { hours, minutes };
  }

  // Try 24-hour format (e.g., "17:00", "05:30")
  const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return { hours, minutes };
  }

  return null;
}

/**
 * Format hours and minutes to 12-hour time string (e.g., "5:00 AM")
 */
export function formatTime12Hour(hours: number, minutes: number): string {
  // Round to avoid floating point precision issues
  hours = Math.round(hours);
  minutes = Math.round(minutes);

  // Handle day overflow/underflow
  while (hours < 0) hours += 24;
  hours = hours % 24;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Convert time to total minutes from midnight
 */
export function timeToMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}

/**
 * Convert total minutes to hours and minutes
 */
export function minutesToTime(totalMinutes: number): { hours: number; minutes: number } {
  // Round to avoid floating point precision issues
  totalMinutes = Math.round(totalMinutes);

  // Handle negative values (previous day)
  while (totalMinutes < 0) totalMinutes += 24 * 60;
  totalMinutes = totalMinutes % (24 * 60);

  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

/**
 * Calculate absolute time from eating time and relative hours offset
 * relativeHours: negative = before eating time, positive = after
 */
export function calculateAbsoluteTime(
  eatingTimeHours: number,
  eatingTimeMinutes: number,
  relativeHours: number
): string {
  const eatingMinutes = timeToMinutes(eatingTimeHours, eatingTimeMinutes);
  const stepMinutes = eatingMinutes + relativeHours * 60;
  const { hours, minutes } = minutesToTime(stepMinutes);
  return formatTime12Hour(hours, minutes);
}

/**
 * Recalculate all timeline step times based on a new target eating time
 */
export function recalculateTimeline(
  timeline: TimelineStep[],
  newEatingTime: string
): TimelineStep[] {
  const parsed = parseTimeString(newEatingTime);
  if (!parsed) return timeline;

  return timeline.map((step) => ({
    ...step,
    time: calculateAbsoluteTime(parsed.hours, parsed.minutes, step.relativeHours),
  }));
}

/**
 * Get the start time (earliest step) from a timeline
 */
export function getStartTime(timeline: TimelineStep[]): string | null {
  if (timeline.length === 0) return null;

  // Find the step with the lowest (most negative) relativeHours
  const earliestStep = timeline.reduce(
    (earliest, step) => (step.relativeHours < earliest.relativeHours ? step : earliest),
    timeline[0]
  );

  return earliestStep.time;
}

/**
 * Calculate how long until cooking should start
 * Returns null if start time is in the past
 */
export function getTimeUntilStart(
  eatingTime: string,
  timeline: TimelineStep[]
): { hours: number; minutes: number; isPast: boolean } | null {
  if (timeline.length === 0) return null;

  const parsedEating = parseTimeString(eatingTime);
  if (!parsedEating) return null;

  // Find earliest step
  const earliestRelativeHours = Math.min(...timeline.map((s) => s.relativeHours));

  // Get current time
  const now = new Date();
  const currentMinutes = timeToMinutes(now.getHours(), now.getMinutes());

  // Calculate start time in minutes from midnight
  const eatingMinutes = timeToMinutes(parsedEating.hours, parsedEating.minutes);
  const startMinutes = eatingMinutes + earliestRelativeHours * 60;

  // Calculate difference
  let diffMinutes = startMinutes - currentMinutes;

  // Handle day boundary (if start time appears to be in the past but eating time is tomorrow)
  const isPast = diffMinutes < 0;

  if (diffMinutes < 0) {
    diffMinutes = Math.abs(diffMinutes);
  }

  return {
    hours: Math.floor(diffMinutes / 60),
    minutes: diffMinutes % 60,
    isPast,
  };
}

/**
 * Get default eating time (6:00 PM)
 */
export function getDefaultEatingTime(): string {
  return '6:00 PM';
}

/**
 * Validate that eating time makes sense with the cook timeline
 * Returns error message if invalid, null if valid
 */
export function validateEatingTime(eatingTime: string, timeline: TimelineStep[]): string | null {
  if (timeline.length === 0) return null;

  const parsed = parseTimeString(eatingTime);
  if (!parsed) return 'Invalid time format';

  // Currently just validates format - could add more validation later
  // (e.g., warning if start time is very early or in the past)

  return null;
}

/**
 * Format relative hours as human-readable string
 * e.g., -12 -> "12 hours before serving", 0 -> "Serving time", 0.5 -> "30 minutes after serving"
 */
export function formatRelativeTime(relativeHours: number): string {
  if (relativeHours === 0) return 'Serving time';

  const absHours = Math.abs(relativeHours);
  const isAfter = relativeHours > 0;

  let timeStr: string;
  if (absHours < 1) {
    const minutes = Math.round(absHours * 60);
    timeStr = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (absHours % 1 === 0) {
    timeStr = `${absHours} hour${absHours !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(absHours);
    const minutes = Math.round((absHours % 1) * 60);
    timeStr = `${hours}h ${minutes}m`;
  }

  return `${timeStr} ${isAfter ? 'after' : 'before'} serving`;
}
