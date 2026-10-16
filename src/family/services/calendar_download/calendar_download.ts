import { downloadFile } from '~app/platform/services/download';
import { buildIcs } from '~app/family/domain/icsExport';
import type { ResolvedCareTask } from '~app/knowledge/domain/referenceModels';

/** 觸發 .ics 下載。錨點、blob 與撤銷的時機在 utils/download，全 app 共用同一套。 */
export function downloadCalendar(ics: string, filename: string): void {
  downloadFile(ics, filename, 'text/calendar;charset=utf-8');
}

/** 觸發照護時程的 .ics 下載。 */
export function downloadIcs(tasks: ResolvedCareTask[], childName: string): void {
  downloadCalendar(buildIcs(tasks, childName), `${childName}-照護時程.ics`);
}
