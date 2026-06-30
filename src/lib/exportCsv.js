/**
 * src/lib/exportCsv.js
 * ─────────────────────────────────────────────────────────────────────────────
 * CSV export utility + duration formatter for WIE2026 – Crewmate Protocol
 */

// ─── CSV Export ──────────────────────────────────────────────────────────────

/**
 * Escape a single CSV cell value.
 * Wraps in double-quotes and escapes internal quotes if the value contains
 * commas, double-quotes, or newlines.
 * @param {unknown} value
 * @returns {string}
 */
function escapeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Must quote if contains comma, double-quote, CR, or LF
  if (str.includes(',') || str.includes('"') || str.includes('\r') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Convert an array of plain objects to a CSV string.
 * Column headers are derived from the keys of the first row.
 * @param {Record<string, unknown>[]} rows
 * @returns {string}
 */
function toCsvString(rows) {
  if (!rows || rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(escapeCsvCell).join(',');

  const dataLines = rows.map(row =>
    headers.map(h => escapeCsvCell(row[h])).join(',')
  );

  return [headerLine, ...dataLines].join('\r\n');
}

/**
 * Convert an array of objects to CSV and trigger a browser download.
 * @param {string} filename  e.g. 'wie2026_players.csv'
 * @param {Record<string, unknown>[]} rows
 */
export function exportToCsv(filename, rows) {
  const csv = toCsvString(rows);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Duration Formatter ──────────────────────────────────────────────────────

/**
 * Format a duration in seconds as HH:MM:SS.
 * Returns '—' for null, undefined, or 0.
 * @param {number|null|undefined} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (!seconds) return '—';

  const totalSecs = Math.floor(Math.abs(seconds));
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;

  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
  ].join(':');
}
