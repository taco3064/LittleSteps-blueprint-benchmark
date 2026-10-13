// ============================================================
// LittleOuting（親子好去處）— 親子館與親子餐廳
// ============================================================

/**
 * 場館類型。
 *
 * 官方名稱極不一致（新北叫「公共托育中心」、臺南叫「親子悠遊館」、屏東只用
 * 「托育資源中心」），所以名稱逐字保留，另外用這個欄位正規化，不從名稱字串
 * 反推——反推會把新北整批算錯。
 *
 * 這裡刻意不含「社區公共托育家園」與「公設民營托嬰中心」：那兩種是把孩子
 * 送去給人照顧的留置型服務，和家長全程陪同的親子館是不同的東西，混在一起
 * 會讓家長帶著孩子跑到一個不能進去玩的地方。
 */
export type VenueKind
  = | 'centre' // 親子館／托育資源中心（公立，免費，家長陪同）
    | 'restaurant';
// 親子餐廳（私人經營）

/**
 * 可查核的場館標籤。
 *
 * 全部是事實而不是評價——「有沒有尿布台」可以查證，「高 CP 值」不行。形容詞
 * 型標籤會隨業配文膨脹而失真，所以一個都不放。
 */
export type VenueTag
  // 費用與門檻
  = | 'free' // 免費入場
    | 'needsBooking' // 需預約
    | 'walkInQueue' // 可現場排隊／候補
    | 'guardianRequired' // 需家長全程陪同
  // 設施
    | 'diaperTable' // 尿布台
    | 'nursingRoom' // 哺乳室
    | 'highChair' // 兒童餐椅
    | 'kidsTableware' // 兒童餐具
    | 'playArea' // 遊戲區
    | 'toyLending' // 教玩具借閱
  // 到達
    | 'parking' // 停車場
    | 'nearMetro' // 鄰近捷運
    | 'strollerAccess' // 推車可進（無樓梯或有電梯）
  // 環境與服務
    | 'indoor' // 室內（雨天可去）
    | 'outdoor' // 有戶外空間
    | 'privateRoom' // 可包場／包廂（慶生、抓週）
    | 'socksRequired';
// 需穿襪入場

export interface Venue {
  id: string;
  kind: VenueKind;
  /** 官方或店家自己的名稱，逐字保留。 */
  name: string;
  city: string;
  district: string;
  address: string;
  /** 部分場館未提供，維持 undefined 而不是空字串。 */
  phone?: string;
  tags: VenueTag[];
  /**
   * 適合年齡（歲）。場館端只公告到「歲」這個顆粒度（0-2、3-6），所以這裡
   * 也只到歲——硬換算成月齡會製造假精確。
   */
  ageYears?: [number, number];
  /** 低消金額（新台幣）。親子館免費，故不設此欄。 */
  minSpend?: number;
  /** 這一筆的資料來源網址。 */
  sourceUrl: string;
  /** 最後查證日期，YYYY-MM-DD。餐廳會倒店、公休會改，家長要看得到這個。 */
  verifiedOn: string;
  /** 官方預約或訂位頁面。 */
  bookingUrl?: string;
  notes?: string;
}
