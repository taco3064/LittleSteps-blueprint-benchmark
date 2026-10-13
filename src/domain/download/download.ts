/**
 * The one place the app hands a generated file to the browser.
 *
 * Every exporter builds bytes — an ICS calendar, a JSON record — and then has
 * to do the same anchor/blob/revoke dance to get them onto a phone. Building
 * the bytes is a pure function with a test; this part is a browser side effect
 * with none, which is exactly why it should exist once rather than once per
 * feature.
 */

/**
 * Revoke the blob URL long after the click, never on the next line.
 *
 * Some browsers — iOS Safari above all — have not finished reading the blob
 * when the handler returns, so revoking immediately races the download that
 * was just started and the parent gets an empty file.
 */
const REVOKE_DELAY_MS = 40_000;

/**
 * Trigger a download of `content` as `filename`.
 *
 * The anchor click must stay synchronous with the user's gesture: iOS Safari
 * discards a download whose click it cannot attribute to a tap, so callers
 * finish every await before calling this and do nothing asynchronous after.
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}
