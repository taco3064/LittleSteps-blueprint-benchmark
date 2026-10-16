import { calculateAge } from '~app/family/domain/dateHelpers';
import type { ChildProfile } from '~app/family/domain/familyRecords';
import { isPregnancyProfile } from '~app/family/domain/pregnancy';

/** 年齡層字串的形狀，例如 `0~2`。掛在模組層，免得每次 render 重建一個。 */
const AGE_BAND_RANGE = /^(\d+)~(\d+)$/;

/**
 * 從生日推出年齡層。
 *
 * 年齡層怎麼切是上游資料自己講的，所以照它給的字串算，不在這裡寫死名單——上游
 * 哪天多切一段，家長的孩子照樣對得上。孕期檔案還沒有出生的孩子，不參與推論。
 *
 * 推出來的值只活在記憶體裡，不會寫進裝置：那是孩子的資料（見
 * common/preferences 的邊界說明）。
 */
export function bandForChild(
  child: ChildProfile | undefined,
  bands: readonly string[],
): string | null {
  if (!child || isPregnancyProfile(child)) {
    return null;
  }

  const years = Math.floor(calculateAge(child.birthday) / 12);

  return (
    bands.find((band) => {
      const range = AGE_BAND_RANGE.exec(band);

      return (
        range !== null && years >= Number(range[1]) && years <= Number(range[2])
      );
    }) ?? null
  );
}
