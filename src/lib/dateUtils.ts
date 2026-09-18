// Timezone-safe date utilities to prevent YYYY-MM-DD from shifting backward in US and western timezones

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface ParsedEventDate {
  year: number;
  monthIndex: number; // 0-11
  monthNum: number;   // 1-12
  monthStr: string;   // '09'
  day: number;
  dayStr: string;     // '18'
  monthShort: string; // 'Sep'
  monthLong: string;  // 'September'
  dayOfWeek: string;  // 'Friday'
  formattedShort: string; // 'Sep 18, 2026'
  formattedLong: string;  // 'September 18, 2026'
  formattedFull: string;  // 'Friday, September 18, 2026'
}

/**
 * Safely parses YYYY-MM-DD strings in local calendar representation
 * avoiding UTC midnight timezone shift bugs in US/Americas timezones.
 */
export function parseEventDate(dateString?: string): ParsedEventDate {
  if (!dateString) {
    return {
      year: 2026,
      monthIndex: 8,
      monthNum: 9,
      monthStr: '09',
      day: 18,
      dayStr: '18',
      monthShort: 'Sep',
      monthLong: 'September',
      dayOfWeek: 'Friday',
      formattedShort: 'Sep 18, 2026',
      formattedLong: 'September 18, 2026',
      formattedFull: 'Friday, September 18, 2026'
    };
  }

  // Handle YYYY-MM-DD format directly
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const monthNum = parseInt(match[2], 10);
    const monthIndex = monthNum - 1;
    const day = parseInt(match[3], 10);
    const dayStr = match[3];
    const monthStr = match[2];

    // Local calendar day of week calculation
    const localDate = new Date(year, monthIndex, day);
    const dayOfWeek = DAY_NAMES[localDate.getDay()] || 'Friday';
    const monthShort = MONTH_NAMES_SHORT[monthIndex] || 'Sep';
    const monthLong = MONTH_NAMES_LONG[monthIndex] || 'September';

    return {
      year,
      monthIndex,
      monthNum,
      monthStr,
      day,
      dayStr,
      monthShort,
      monthLong,
      dayOfWeek,
      formattedShort: `${monthShort} ${day}, ${year}`,
      formattedLong: `${monthLong} ${day}, ${year}`,
      formattedFull: `${dayOfWeek}, ${monthLong} ${day}, ${year}`
    };
  }

  // Fallback for full ISO dates
  try {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const monthNum = monthIndex + 1;
    const day = d.getDate();
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
    const monthShort = MONTH_NAMES_SHORT[monthIndex] || 'Sep';
    const monthLong = MONTH_NAMES_LONG[monthIndex] || 'September';
    const dayOfWeek = DAY_NAMES[d.getDay()] || 'Friday';

    return {
      year,
      monthIndex,
      monthNum,
      monthStr,
      day,
      dayStr,
      monthShort,
      monthLong,
      dayOfWeek,
      formattedShort: `${monthShort} ${day}, ${year}`,
      formattedLong: `${monthLong} ${day}, ${year}`,
      formattedFull: `${dayOfWeek}, ${monthLong} ${day}, ${year}`
    };
  } catch {
    return {
      year: 2026,
      monthIndex: 8,
      monthNum: 9,
      monthStr: '09',
      day: 18,
      dayStr: '18',
      monthShort: 'Sep',
      monthLong: 'September',
      dayOfWeek: 'Friday',
      formattedShort: dateString,
      formattedLong: dateString,
      formattedFull: dateString
    };
  }
}

/**
 * Format an event date for display (e.g. 'September 18, 2026' or 'Sep 18, 2026')
 */
export function formatEventDate(dateString?: string, format: 'short' | 'long' | 'full' = 'long'): string {
  const parsed = parseEventDate(dateString);
  if (format === 'short') return parsed.formattedShort;
  if (format === 'full') return parsed.formattedFull;
  return parsed.formattedLong;
}
