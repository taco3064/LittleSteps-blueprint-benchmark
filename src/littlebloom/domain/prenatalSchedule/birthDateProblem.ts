import { formatDate, parseLocalDate } from '~app/platform/domain/calendar';

/**
 * 出生日期不通過的理由，通過則 null。
 *
 * 這是四個服務裡唯一不可逆的寫入：確認之後孕期檔案就被改寫成寶寶檔案、孕期
 * 資料封存，沒有任何流程回得去。而空白的日期會讓月齡算出 NaN，照護時程從此
 * 永遠是空的——家長會拿到一份同時壞掉的孕期與寶寶檔案，自己救不回來。
 * 所以擋在送出之前，不是事後補救。
 */
export function birthDateProblem(
  birthDate: string,
  lmp: string,
  today: string,
): string | null {
  if (!birthDate || Number.isNaN(parseLocalDate(birthDate).getTime())) {
    return '請填入實際出生日期。';
  }

  if (birthDate > today) {
    return '出生日期不能填未來的日期，寶寶還沒出生就先別登記。';
  }

  // 早於末次月經的日期不可能是這一胎的出生日，多半是選錯年份。
  if (lmp && birthDate < lmp) {
    return `出生日期不能早於末次月經（${formatDate(lmp)}）。`;
  }

  return null;
}
