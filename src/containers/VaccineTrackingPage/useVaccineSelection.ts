import { useState } from 'react';

import { vaccineMonthForChild } from '~app/domain/ageDefaults';
import {
  ChildProfile,
} from '~app/domain/records';
import {
  vaccineSchedules,
} from '~app/domain/vaccines';

type FundingFilter = 'all' | 'national' | 'conditional' | 'self-paid';
type MonthFilter = 'all' | number;

const AVAILABLE_MONTHS = Array.from(
  new Set(vaccineSchedules.map((v) => v.ageInMonths || 0)),
).sort((a, b) => a - b);

export function useVaccineSelection(currentChild?: ChildProfile | null) {
  const [fundingFilter, setFundingFilter] = useState<FundingFilter>('all');
  /*
    月齡篩選的優先順序：這次點的 > 孩子已經到期的最後一個月齡。跟里程碑
    （MilestonesPage.tsx）與 LittleGuard 的年齡層（RadarPage.tsx）同一種寫法，
    `null` 就是「家長還沒挑過」。

    預設不停在「全部」：那樣 8 個月大寶寶的家長每次都得先滑過出生 24 小時內
    那一劑才看得到現在該打的。但也不能用 useState 的初始值算，因為換寶寶時這
    一頁不會卸載（App.tsx 的錯誤邊界綁的是路由，不是孩子），篩選器會一直停在
    上一個寶寶的月齡——從新生兒切到兩歲，畫面照樣拿出生那幾劑對新寶寶打勾。
    每次 render 重推就不會過期，連改生日也跟著更新；家長挑過的則永遠贏過推
    導出來的值。

    點到「已經選中的那一顆」不算挑過：pickMonth 會把 picked 收回 null。少了這
    一道，一次畫面上什麼都沒變的點擊——或在這排十二顆的橫向捲動列上滑歪手——就
    會把篩選器釘住，之後換寶寶、改生日都不再重推，而家長沒有任何線索可以發現。
    代價要講明：家長刻意點下「正好等於孩子現在月齡」那一顆，得到的是「沒釘住」，
    所以之後訂正生日篩選器會跟著動。那正好就是他進來時的狀態。
  */
  const [pickedMonth, setPickedMonth] = useState<MonthFilter | null>(null);
  const derivedMonth = vaccineMonthForChild(currentChild, AVAILABLE_MONTHS);
  const monthFilter = pickedMonth ?? derivedMonth;

  const pickMonth = (value: MonthFilter) =>
    setPickedMonth(value === derivedMonth ? null : value);

  return {
    fundingFilter,
    setFundingFilter,
    pickedMonth,
    setPickedMonth,
    derivedMonth,
    monthFilter,
    pickMonth,
  };
}
