/**
 * dateUtils.js
 *
 * Shared date/time utility module for FoMo Cinema.
 *
 * Policy:
 *   - All dates are stored in UTC in MongoDB.
 *   - Display is in IST (Asia/Kolkata, UTC+5:30).
 *   - All functions accept a showDateTime value (ISO string, Date, or
 *     anything parseable by `new Date()`).
 *
 * Import example:
 *   import { formatDate, formatTime, weekday, groupShows } from "../utils/dateUtils";
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5h 30m in milliseconds

// ─── Internal helper ──────────────────────────────────────────────────────────
const toIST = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  return new Date(d.getTime() + IST_OFFSET_MS);
};

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Returns the IST date portion as "YYYY-MM-DD".
 * Example: "2026-06-26"
 */
export const formatDateISO = (value) => {
  if (!value) return "";
  const ist = toIST(value);
  const yyyy = ist.getUTCFullYear();
  const mm = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(ist.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Returns a short human-readable date like "26 June".
 */
export const formatDate = (value) => {
  if (!value) return "";
  const ist = toIST(value);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${ist.getUTCDate()} ${months[ist.getUTCMonth()]}`;
};

/**
 * Returns a long human-readable date like "Thursday, 26 June 2026".
 */
export const formatDateLong = (value) => {
  if (!value) return "";
  const ist = toIST(value);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${days[ist.getUTCDay()]}, ${ist.getUTCDate()} ${months[ist.getUTCMonth()]} ${ist.getUTCFullYear()}`;
};

/**
 * Returns the IST time as "HH:MM" (24-hour).
 * Example: "14:30"
 */
export const formatTime = (value) => {
  if (!value) return "";
  const ist = toIST(value);
  const hh = String(ist.getUTCHours()).padStart(2, "0");
  const min = String(ist.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${min}`;
};

/**
 * Returns the full weekday name in IST.
 * Example: "Thursday"
 */
export const weekday = (value) => {
  if (!value) return "";
  const ist = toIST(value);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[ist.getUTCDay()];
};

/**
 * Returns true if the show's IST date is today.
 */
export const isToday = (value) => {
  if (!value) return false;
  const now = toIST(new Date());
  const show = toIST(value);
  return (
    now.getUTCFullYear() === show.getUTCFullYear() &&
    now.getUTCMonth() === show.getUTCMonth() &&
    now.getUTCDate() === show.getUTCDate()
  );
};

/**
 * Returns true if the show's showDateTime is in the past.
 */
export const isPastShow = (value) => {
  if (!value) return false;
  return new Date(value) < new Date();
};

/**
 * Groups an array of Show documents by date (IST) for display.
 *
 * Input:  Show[] (each show must have .showDateTime)
 * Output: [{ weekday: "Thursday", date: "26 June", dateISO: "2026-06-26", shows: Show[] }]
 *
 * Groups are ordered by date ascending.
 * Shows within each group are ordered by time ascending.
 * Safely handles missing or undefined showDateTime.
 */
export const groupShows = (shows) => {
  if (!Array.isArray(shows) || shows.length === 0) return [];

  const groups = {};

  for (const show of shows) {
    // showDateTime may come from the virtual or the raw field
    const dt = show.showDateTime;
    if (!dt) continue;

    const dateISO = formatDateISO(dt);
    if (!dateISO) continue;

    if (!groups[dateISO]) {
      groups[dateISO] = {
        weekday: weekday(dt),
        date: formatDate(dt),
        dateISO,
        shows: [],
      };
    }
    groups[dateISO].shows.push(show);
  }

  // Sort groups by date ascending
  const sortedKeys = Object.keys(groups).sort();

  return sortedKeys.map((key) => {
    const group = groups[key];
    // Sort shows within group by time ascending (safe sort)
    group.shows.sort((a, b) => {
      const ta = a.showDateTime ? new Date(a.showDateTime).getTime() : 0;
      const tb = b.showDateTime ? new Date(b.showDateTime).getTime() : 0;
      return ta - tb;
    });
    return group;
  });
};
