export /**
 * Helper: format date string YYYY-MM-DD to MM/DD
 */
function formatDateShort(dateStr: string): string {
  const parts = dateStr.split('-');

  if (parts.length < 3) {
    return dateStr;
  }

  return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
}
