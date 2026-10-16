export function forEachReportDay(days: number, visit: (index: number) => void) {
  for (let i = days - 1; i >= 0; i--) {
    visit(i);
  }
}
