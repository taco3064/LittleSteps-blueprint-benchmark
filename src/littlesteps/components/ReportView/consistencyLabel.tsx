import {
  CONSISTENCIES,
  getConsistencyLabel,
} from '~app/littlesteps/domain/logHelpers';

export /**
 * Helper: translate poop consistency
 *
 * `consistencyDistribution` 的 key 是資料裡有什麼就是什麼，所以舊資料帶進一個
 * 不認識的值時原樣印出來，而不是印成空白或吞掉那一列。認得的那三個一律走共用
 * 的標籤：這裡若自己寫一份，同一筆紀錄在時間軸和報告裡就會有兩種說法。
 */
function consistencyLabel(key: string): string {
  const known = CONSISTENCIES.find((value) => value === key);

  return known ? getConsistencyLabel(known) : key;
}
