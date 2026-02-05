import {
  parseTimeString,
  formatTime12Hour,
  timeToMinutes,
  minutesToTime,
  calculateAbsoluteTime,
  recalculateTimeline,
  getStartTime,
  getTimeUntilStart,
  getDefaultEatingTime,
  validateEatingTime,
  formatRelativeTime,
} from '@/lib/timeUtils';
import { mockTimelineSteps } from '../helpers/testFixtures';
import type { TimelineStep } from '@/lib/types';

// ─── parseTimeString ─────────────────────────────────────

describe('parseTimeString', () => {
  it('parses 12-hour AM format', () => {
    expect(parseTimeString('5:00 AM')).toEqual({ hours: 5, minutes: 0 });
  });

  it('parses 12-hour PM format', () => {
    expect(parseTimeString('5:00 PM')).toEqual({ hours: 17, minutes: 0 });
  });

  it('parses 12:00 PM as noon (12)', () => {
    expect(parseTimeString('12:00 PM')).toEqual({ hours: 12, minutes: 0 });
  });

  it('parses 12:00 AM as midnight (0)', () => {
    expect(parseTimeString('12:00 AM')).toEqual({ hours: 0, minutes: 0 });
  });

  it('parses with minutes', () => {
    expect(parseTimeString('11:30 PM')).toEqual({ hours: 23, minutes: 30 });
  });

  it('parses lowercase am/pm', () => {
    expect(parseTimeString('3:15 pm')).toEqual({ hours: 15, minutes: 15 });
  });

  it('parses 24-hour format', () => {
    expect(parseTimeString('17:00')).toEqual({ hours: 17, minutes: 0 });
  });

  it('parses 24-hour midnight', () => {
    expect(parseTimeString('00:00')).toEqual({ hours: 0, minutes: 0 });
  });

  it('parses 24-hour with minutes', () => {
    expect(parseTimeString('05:30')).toEqual({ hours: 5, minutes: 30 });
  });

  it('returns null for invalid input', () => {
    expect(parseTimeString('invalid')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseTimeString('')).toBeNull();
  });

  it('returns null for time without colon', () => {
    expect(parseTimeString('5 PM')).toBeNull();
  });
});

// ─── formatTime12Hour ────────────────────────────────────

describe('formatTime12Hour', () => {
  it('formats midnight as 12:00 AM', () => {
    expect(formatTime12Hour(0, 0)).toBe('12:00 AM');
  });

  it('formats noon as 12:00 PM', () => {
    expect(formatTime12Hour(12, 0)).toBe('12:00 PM');
  });

  it('formats morning time', () => {
    expect(formatTime12Hour(5, 30)).toBe('5:30 AM');
  });

  it('formats evening time', () => {
    expect(formatTime12Hour(18, 0)).toBe('6:00 PM');
  });

  it('formats 23:59', () => {
    expect(formatTime12Hour(23, 59)).toBe('11:59 PM');
  });

  it('handles overflow wrapping (25 hours)', () => {
    expect(formatTime12Hour(25, 0)).toBe('1:00 AM');
  });

  it('handles negative hours', () => {
    expect(formatTime12Hour(-1, 0)).toBe('11:00 PM');
  });

  it('pads single-digit minutes', () => {
    expect(formatTime12Hour(9, 5)).toBe('9:05 AM');
  });
});

// ─── timeToMinutes ───────────────────────────────────────

describe('timeToMinutes', () => {
  it('converts midnight to 0', () => {
    expect(timeToMinutes(0, 0)).toBe(0);
  });

  it('converts noon to 720', () => {
    expect(timeToMinutes(12, 0)).toBe(720);
  });

  it('converts with minutes', () => {
    expect(timeToMinutes(5, 30)).toBe(330);
  });
});

// ─── minutesToTime ───────────────────────────────────────

describe('minutesToTime', () => {
  it('converts 0 to midnight', () => {
    expect(minutesToTime(0)).toEqual({ hours: 0, minutes: 0 });
  });

  it('converts 720 to noon', () => {
    expect(minutesToTime(720)).toEqual({ hours: 12, minutes: 0 });
  });

  it('converts 330 to 5:30', () => {
    expect(minutesToTime(330)).toEqual({ hours: 5, minutes: 30 });
  });

  it('handles negative wrapping', () => {
    // -60 minutes → 23:00 (wraps around)
    expect(minutesToTime(-60)).toEqual({ hours: 23, minutes: 0 });
  });

  it('handles >24h wrapping', () => {
    // 25*60 = 1500 → wraps to 1:00
    expect(minutesToTime(25 * 60)).toEqual({ hours: 1, minutes: 0 });
  });

  it('round-trips with timeToMinutes', () => {
    const original = { hours: 14, minutes: 45 };
    const minutes = timeToMinutes(original.hours, original.minutes);
    expect(minutesToTime(minutes)).toEqual(original);
  });
});

// ─── calculateAbsoluteTime ───────────────────────────────

describe('calculateAbsoluteTime', () => {
  it('calculates time at serving (relativeHours=0)', () => {
    expect(calculateAbsoluteTime(18, 0, 0)).toBe('6:00 PM');
  });

  it('calculates time before serving', () => {
    expect(calculateAbsoluteTime(18, 0, -12)).toBe('6:00 AM');
  });

  it('calculates fractional hours', () => {
    expect(calculateAbsoluteTime(18, 0, -0.5)).toBe('5:30 PM');
  });

  it('handles day boundary crossing', () => {
    // 6 AM eating time, 8 hours before → 10 PM previous day
    expect(calculateAbsoluteTime(6, 0, -8)).toBe('10:00 PM');
  });

  it('handles positive relative hours (after serving)', () => {
    expect(calculateAbsoluteTime(18, 0, 1)).toBe('7:00 PM');
  });
});

// ─── recalculateTimeline ─────────────────────────────────

describe('recalculateTimeline', () => {
  it('recalculates all step times based on new eating time', () => {
    const result = recalculateTimeline(mockTimelineSteps, '7:00 PM');

    // Eating time moved 1 hour later, so all times shift by 1 hour
    expect(result[0].time).toBe('7:00 AM'); // Was 6:00 AM
    expect(result[4].time).toBe('7:00 PM'); // Serving time
    expect(result[4].relativeHours).toBe(0);
  });

  it('preserves non-time step properties', () => {
    const result = recalculateTimeline(mockTimelineSteps, '7:00 PM');
    expect(result[0].action).toBe('Start the fire');
    expect(result[0].relativeHours).toBe(-12);
    expect(result[0].temperature).toBe('225°F');
  });

  it('returns timeline unchanged for invalid time string', () => {
    const result = recalculateTimeline(mockTimelineSteps, 'invalid');
    expect(result).toEqual(mockTimelineSteps);
  });

  it('handles empty timeline', () => {
    expect(recalculateTimeline([], '6:00 PM')).toEqual([]);
  });
});

// ─── getStartTime ────────────────────────────────────────

describe('getStartTime', () => {
  it('returns null for empty timeline', () => {
    expect(getStartTime([])).toBeNull();
  });

  it('finds the earliest step time', () => {
    expect(getStartTime(mockTimelineSteps)).toBe('6:00 AM');
  });

  it('works with single-step timeline', () => {
    const single: TimelineStep[] = [
      { time: '5:00 PM', relativeHours: -1, action: 'Start', details: 'Begin cooking' },
    ];
    expect(getStartTime(single)).toBe('5:00 PM');
  });
});

// ─── getTimeUntilStart ───────────────────────────────────

describe('getTimeUntilStart', () => {
  it('returns null for empty timeline', () => {
    expect(getTimeUntilStart('6:00 PM', [])).toBeNull();
  });

  it('returns null for invalid eating time', () => {
    expect(getTimeUntilStart('invalid', mockTimelineSteps)).toBeNull();
  });

  it('returns hours and minutes until start', () => {
    const result = getTimeUntilStart('6:00 PM', mockTimelineSteps);
    expect(result).not.toBeNull();
    expect(typeof result!.hours).toBe('number');
    expect(typeof result!.minutes).toBe('number');
    expect(typeof result!.isPast).toBe('boolean');
  });
});

// ─── getDefaultEatingTime ────────────────────────────────

describe('getDefaultEatingTime', () => {
  it('returns 6:00 PM', () => {
    expect(getDefaultEatingTime()).toBe('6:00 PM');
  });
});

// ─── validateEatingTime ──────────────────────────────────

describe('validateEatingTime', () => {
  it('returns null (valid) for correct format', () => {
    expect(validateEatingTime('6:00 PM', mockTimelineSteps)).toBeNull();
  });

  it('returns null for empty timeline', () => {
    expect(validateEatingTime('6:00 PM', [])).toBeNull();
  });

  it('returns error for invalid format', () => {
    expect(validateEatingTime('invalid', mockTimelineSteps)).toBe('Invalid time format');
  });
});

// ─── formatRelativeTime ──────────────────────────────────

describe('formatRelativeTime', () => {
  it('formats serving time (0)', () => {
    expect(formatRelativeTime(0)).toBe('Serving time');
  });

  it('formats whole hours before', () => {
    expect(formatRelativeTime(-12)).toBe('12 hours before serving');
  });

  it('formats 1 hour before (singular)', () => {
    expect(formatRelativeTime(-1)).toBe('1 hour before serving');
  });

  it('formats minutes before (less than 1 hour)', () => {
    expect(formatRelativeTime(-0.5)).toBe('30 minutes before serving');
  });

  it('formats 1 minute (singular)', () => {
    // 1/60 ≈ 0.0167 hours
    expect(formatRelativeTime(-1 / 60)).toBe('1 minute before serving');
  });

  it('formats fractional hours (hours + minutes)', () => {
    expect(formatRelativeTime(-3.5)).toBe('3h 30m before serving');
  });

  it('formats positive hours (after serving)', () => {
    expect(formatRelativeTime(0.5)).toBe('30 minutes after serving');
  });
});
