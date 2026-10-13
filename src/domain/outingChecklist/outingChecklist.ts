import type { VenueKind } from '../records';

export interface ChecklistItem {
  id: string;
  question: string;
  /** 這一項存在的理由：講清楚沒做會怎樣，不是為了填滿畫面。 */
  why: string;
  appliesTo: VenueKind[] | 'both';
}

/**
 * 出發前檢查清單。
 *
 * 這是整個 LittleOuting 裡最耐放的內容：場館會倒、電話會改、低消會漲，但「出門前
 * 要不要再確認一次訂位」十年後仍然成立。因此它刻意不綁任何一筆 venue，不需要
 * verifiedOn，也不會因為某間店結束營業而失效——而餐廳清單會。
 *
 * 順序是照「多常搞砸一趟行程」排的，不是照邏輯分類排。訂位在最前面，因為那是抱怨
 * 量最大的一類：一則 481 則回覆的 PTT 討論就是一家人跨區到場、25 天前就訂好位，
 * 仍被告知不能入座。襪子排在後面不是因為不重要，是因為忘了通常還能現場補救
 * （多數場館現場售襪），訂位失敗不能。
 *
 * why 一律一句話、一律具體。寫「以免影響用餐體驗」等於沒寫；要寫的是「遲到 15 分鐘
 * 名額就給下一組」——家長讀完會去做那件事。
 */
export const outingChecklist: ChecklistItem[] = [
  {
    id: 'booking-confirmed',
    question: '訂位或預約確認過了嗎？姓名、日期、時段、人數都對得上？',
    why: '這是抱怨量最大的一項：有家長 25 天前就訂位、跨區到場，仍被告知不能入座，出門前一通電話比白跑一趟便宜太多。',
    appliesTo: 'both',
  },
  {
    id: 'centre-family-binding',
    question: '親子館的親子關係綁定完成了嗎？',
    why: '沒完成綁定，系統無法用孩子的年齡替你預約分齡場次，等到現場才發現時名額已經沒了。',
    appliesTo: ['centre'],
  },
  {
    id: 'centre-arrival-window',
    question: '你有把握在報到時限內到場嗎？候補簡訊會不會漏看？',
    why: '親子館逾 15 分鐘未報到就釋出你的名額，候補簡訊也只等 30 分鐘未回覆就換下一組家庭。',
    appliesTo: ['centre'],
  },
  {
    id: 'fee-basis',
    question: '費用怎麼算：低消、清潔費、服務費，是按人、按年齡還是按身高？',
    why: '有餐廳宣稱免低消，實際卻對嬰兒收一杯 180 元飲料（鏡週刊案例）；低消與服務費沒有定型化契約規範，先問清楚才有立場拒付。',
    appliesTo: ['restaurant'],
  },
  {
    id: 'open-today',
    question: '今天有開嗎？是場次制，還是分成午晚兩段營業？',
    why:
      '親子館週一與國定假日休館、採場次制、場次結束前 30 分鐘就停止入場，下個月的行事曆（含保養日）要到 15 日才公告；餐廳則常見 '
      + '11:00-15:00、17:00-20:30 的分段營業。',
    appliesTo: 'both',
  },
  {
    id: 'age-zone-match',
    question: '孩子的年齡（或身高）符合你要去的那一區嗎？',
    why: '場館實際按 0-2 歲爬行區、3-6 歲球池溜滑梯分區並會勸離不符資格的孩子，跑錯區等於白帶孩子出門一趟。',
    appliesTo: 'both',
  },
  {
    id: 'diaper-nursing',
    question: '現場有尿布台與哺乳室嗎？沒有的話備案是哪裡？',
    why: '幾乎每份親子場館清單都會標這兩項，所以沒標通常就是真的沒有；抱著要換尿布的孩子臨時找廁所是整趟最狼狽的一刻。',
    appliesTo: 'both',
  },
  {
    id: 'parking-stroller',
    question: '停車位與推車動線查過了嗎？有電梯，還是要抬推車上樓？',
    why: '法定的孕婦及育有 6 歲以下兒童停車位只要求大型停車場保留 2%，還須先申請識別證，沒查就到通常變成抱著孩子繞路找車位。',
    appliesTo: 'both',
  },
  {
    id: 'socks-and-hygiene',
    question: '襪子帶了嗎（大人也要）？球池有定期消毒公告嗎？',
    why: '多數遊戲區規定大人小孩都要穿襪才能入場，現場補買一雙約 50 元；球池是最容易藏菌的設施，有公告清消時段的場館可信度較高。',
    appliesTo: 'both',
  },
  {
    id: 'time-limit',
    question: '用餐或遊戲區有時間限制嗎？',
    why: '熱門場館普遍設 100-120 分鐘用餐時限、遊戲區另有限時控管，先知道才不會在孩子玩得最起勁時被請離。',
    appliesTo: ['restaurant'],
  },
  {
    id: 'still-open',
    question: '出發前打過店家電話，確認還在營業嗎？',
    why: 'WooHoo 遊戲屋 2020 年就結束營業，一篇 2018 年說它好玩的文章至今仍排在搜尋結果前面——推薦文不會跟著店一起下架。',
    appliesTo: ['restaurant'],
  },
];
