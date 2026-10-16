import { formatDate, formatTime } from '~app/platform/domain/calendar';

export /** 這份摘要要帶去診間，所以產生時間必須連時刻一起顯示；日期部分沿用全站格式。 */
function formatDateTime(iso: string): string {
  return `${formatDate(iso)} ${formatTime(iso)}`;
}
