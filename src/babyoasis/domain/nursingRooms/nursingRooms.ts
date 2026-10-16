// BabyOasis - Nursing Room Map Types
// 資料來源：衛福部國健署「依法應設置哺集乳室公共場所名單」。來源只提供名稱、
// 地址、電話、開放時間與注意事項，沒有座標，也沒有設施細目；設施僅在各縣市
// 另行公布細目的場所才有，所以是選填，UI 必須據實呈現「未提供」而非「沒有」。
export interface NursingRoomFacilities {
  privateCurtain?: boolean; // 獨立/有簾子空間
  nursingChair?: boolean; // 哺乳椅
  waterDispenser?: boolean; // 飲水機
  changingTable?: boolean; // 尿布台
  washBasin?: boolean; // 洗手台
  refrigerator?: boolean; // 冰箱
  microwave?: boolean; // 微波爐
  airConditioning?: boolean; // 冷氣
  babyBed?: boolean; // 嬰兒床
  socket?: boolean; // 插座
}

export interface NursingRoom {
  id: string;
  name: string; // 場所名稱
  address: string; // 地址
  city: string; // 縣市
  district?: string; // 鄉鎮市區
  statutory?: boolean; // 在「依法應設置哺集乳室公共場所名單」上；自願設置的場所沒有這個欄位
  floor?: string; // 樓層與室內位置
  latitude: number; // 緯度
  longitude: number; // 經度
  facilities?: NursingRoomFacilities; // 設施，來源未提供時為 undefined
  openingHours?: string; // 開放時間
  phone?: string; // 聯絡電話
  remarks?: string; // 注意事項
}

// For clustering and display
export interface NursingRoomMarker extends NursingRoom {
  isUserLocation?: boolean;
}
