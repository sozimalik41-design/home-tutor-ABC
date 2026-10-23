/**
 * Time and Schedule Utilities
 * Handles PKT (Pakistan Standard Time, UTC+5) calculations,
 * countdown timers, and timezone conversions.
 */

export interface NextClassCountdown {
  status: 'upcoming' | 'in-progress' | 'past';
  formattedCountdown: string;
  badgeLabel: string;
  diffMinutes: number;
  pktTimeDisplay: string;
  localTimeDisplay: string;
  localTimezoneName: string;
}

/**
 * Calculates countdown and timezone info for a scheduled class session.
 * Default timezone of platform schedules is Pakistan Standard Time (PKT, UTC+5).
 * 
 * @param sessionDate YYYY-MM-DD
 * @param startTime HH:MM
 * @param endTime HH:MM
 * @param now Optional reference time for testing
 */
export function calculateNextClassCountdown(
  sessionDate: string,
  startTime: string,
  endTime: string,
  now: Date = new Date()
): NextClassCountdown {
  // Parse session start and end into ISO strings with PKT offset (+05:00)
  const startIso = `${sessionDate}T${startTime.length === 5 ? startTime : startTime.slice(0, 5)}:00+05:00`;
  const endIso = `${sessionDate}T${endTime.length === 5 ? endTime : endTime.slice(0, 5)}:00+05:00`;

  const sessionStart = new Date(startIso);
  const sessionEnd = new Date(endIso);

  const startMs = sessionStart.getTime();
  const endMs = sessionEnd.getTime();
  const nowMs = now.getTime();

  const diffMs = startMs - nowMs;
  const diffMinutes = Math.floor(diffMs / 60000);

  // Formatting PKT display
  const pktTimeDisplay = `${startTime} - ${endTime} PKT (UTC+5)`;

  // Formatting local timezone display
  let localTimeDisplay = '';
  let localTimezoneName = 'Local';
  try {
    const localStartStr = sessionStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const localEndStr = sessionEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    localTimezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    localTimeDisplay = `${localStartStr} - ${localEndStr} (${localTimezoneName})`;
  } catch {
    localTimeDisplay = pktTimeDisplay;
  }

  // 1. Session is currently in progress
  if (nowMs >= startMs && nowMs <= endMs) {
    const remainingMs = endMs - nowMs;
    const remMins = Math.max(1, Math.round(remainingMs / 60000));
    return {
      status: 'in-progress',
      formattedCountdown: `Class In Progress (Ends in ~${remMins}m)`,
      badgeLabel: 'LIVE NOW',
      diffMinutes,
      pktTimeDisplay,
      localTimeDisplay,
      localTimezoneName
    };
  }

  // 2. Session has already concluded
  if (nowMs > endMs) {
    return {
      status: 'past',
      formattedCountdown: 'Session Concluded',
      badgeLabel: 'COMPLETED',
      diffMinutes,
      pktTimeDisplay,
      localTimeDisplay,
      localTimezoneName
    };
  }

  // 3. Upcoming session in the future
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  let formattedCountdown = '';
  let badgeLabel = 'UPCOMING';

  if (days > 1) {
    formattedCountdown = `Starts in ${days} days, ${hours} hours`;
    badgeLabel = `IN ${days} DAYS`;
  } else if (days === 1) {
    formattedCountdown = `Starts tomorrow (in 1 day, ${hours}h)`;
    badgeLabel = 'TOMORROW';
  } else if (hours >= 1) {
    formattedCountdown = `Starts in ${hours}h ${minutes}m`;
    badgeLabel = `IN ${hours}H ${minutes}M`;
  } else if (minutes > 0) {
    formattedCountdown = `Starts in ${minutes} minutes`;
    badgeLabel = `IN ${minutes} MINS`;
  } else {
    formattedCountdown = 'Starting in less than a minute';
    badgeLabel = 'STARTING SOON';
  }

  return {
    status: 'upcoming',
    formattedCountdown,
    badgeLabel,
    diffMinutes,
    pktTimeDisplay,
    localTimeDisplay,
    localTimezoneName
  };
}

/**
 * Formats dual timezone string displays for a given session time in PKT and user local time.
 */
export function formatDualTimezoneDisplay(sessionDate: string, startTime: string, endTime: string) {
  const cd = calculateNextClassCountdown(sessionDate, startTime, endTime);
  return {
    pktDisplay: cd.pktTimeDisplay,
    localDisplay: cd.localTimeDisplay,
    localTimezone: cd.localTimezoneName
  };
}
