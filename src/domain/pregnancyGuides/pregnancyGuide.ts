/**
 * 孕期週別指引（第 1～40 週）
 *
 * 醫療與公費補助內容均查證下列來源，未依記憶撰寫：
 *
 * 產檢時程與公費項目
 * - 衛福部國健署 孕產兒關懷網站「懷孕3階段產檢時間表」（14 次公費產檢逐次週數與項目表）
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=3547&type=01
 * - 衛福部國健署「孕婦產前檢查項目及補助金額」（110/7/1 起 10 次擴大為 14 次，新增妊娠糖尿病篩檢、貧血檢驗與 2 次一般超音波）
 *   https://www.hpa.gov.tw/Pages/List.aspx?nodeid=194
 * - 衛生福利部「14次公費產檢 給媽咪與寶寶最安心的守護」
 *   https://www.mohw.gov.tw/cp-7173-83667-1.html
 *
 * 篩檢週數
 * - 唐氏症篩檢：第一孕期 11–14 週（頸部透明帶＋鼻樑骨＋母血血清標誌，檢出率 82%–87%）、
 *   第二孕期 15–20 週（母血四指標，檢出率 60%–83%）；高風險者進一步羊膜穿刺
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=1936&type=01
 * - 羊膜穿刺：抽羊水最佳時間 16–18 週，建議第 17 週；術後早產或自發性流產機率約 1–3/1000
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=1495&type=01（懷孕第 17 週）
 * - 高層次超音波：建議 20–24 週進行，約需半小時至一小時
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=3574&type=01
 * - 妊娠糖尿病篩檢：妊娠 24–28 週，空腹 8 小時 75 公克口服葡萄糖耐受試驗；
 *   空腹 ≧ 92、1 小時 ≧ 180、2 小時 ≧ 153 mg/dL，任一項超標即診斷
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=1945&type=01
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=3614&type=01
 * - 孕婦乙型鏈球菌（GBS）篩檢：妊娠第 35–37 週，1 次，每案補助 500 元；約 18%–20% 孕婦產道帶菌
 *   https://www.hpa.gov.tw/Pages/List.aspx?nodeid=196
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=1527&type=01（懷孕第 36 週）
 *
 * 子癇前症警訊
 * - 頭痛（多為前額）、視力模糊或閃光、上腹／右上腹肋骨下疼痛、突發且快速進展的全身水腫、
 *   噁心嘔吐、意識改變、呼吸急促；出現異常高血壓、蛋白尿、頭痛、視力模糊、上腹痛應盡速就醫
 *   亞東紀念醫院「認識妊娠毒血症（子癇前症）」https://www.femh.org.tw/epaperadmin/viewarticle?ID=7376
 *   中山醫學大學附設醫院「子癲前症的治療與處置」https://web.csh.org.tw/web/cshmagazine/?p=5228
 * - 手、臉異常腫脹可能是子癇前症先兆，應馬上到醫院檢查
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=1518&type=01（懷孕第 32 週）
 *
 * 胎動起點與計算方式
 * - 初次懷孕約 18–20 週感覺到胎動；28 週後較明顯，約 34 週達高峰，36 週後因空間變小而減緩。
 *   計算法：早、中、晚三時段飯後各觀察 1 小時，一小時 ≧3 次代表狀況良好、達 10 次以上更佳，
 *   多處同時的胎動只算一次；12 小時內測不到胎動或當日胎動大幅減少應聯絡婦產科醫師
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=2012&type=01
 * - 28 週後每天測 3 回、每回 1–2 小時各至少 10 次胎動；少於平常一半可能缺氧或胎兒窘迫，應盡快就醫
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=1517&type=01（懷孕第 31 週）
 *
 * 早產定義與徵兆
 * - 早產指妊娠 20 週以上、未滿 37 週的分娩，發生率 5%–10%，卻占新生兒死亡的 80%
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=3567&type=01
 *   臺北榮總護理部「認識早產徵兆與安胎之照護」https://ihealth.vghtpe.gov.tw/media/635
 * - 徵兆：一小時 6 次以上（或每 10–15 分鐘一次）子宮收縮、休息 30 分鐘仍無改善；落紅；
 *   破水（清澈、無黏性、持續流出）；胎動較平常減少一半以上；無法改善的下背痛
 *   臺大醫院健康電子報「認識早產徵兆與安胎照護」https://epaper.ntuh.gov.tw/health/202105/health_2.html
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=1493&type=01（懷孕第 16 週）
 *
 * 產兆、足月與過期妊娠
 * - 三大產兆：落紅、規則陣痛、破水，無先後順序，任一出現即盡快就醫；37～42 週均為正常生產期
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=1529&type=01（懷孕第 38 週）
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=2034&type=01（認識生產過程－陰道生產）
 * - 40 週後胎盤急速退化，超過 42 週會催生引產
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=1531&type=01（懷孕第 40 週）
 *
 * 疫苗與營養
 * - Tdap：不論過去接種史，每次懷孕應接種 1 劑，任何孕程可接種，建議第 28–36 週以最大化抗體傳遞
 *   臺北市政府衛生局（依衛福部 ACIP 建議）
 *   https://health.gov.taipei/News_Content.aspx?n=416BCB37CFFAC913&s=E0EB1B8769AA9248
 * - 葉酸：育齡／備孕每日 400 微克，懷孕期間每日 600 微克；鈣每日 1000 毫克
 *   https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=1137&pid=7725
 *   https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=4306&pid=13853
 * - 孕期總增重以 10–14 公斤為宜，依孕前 BMI 分級
 *   https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=1136&pid=3165
 *   https://mammy.hpa.gov.tw/Home/NewsKBContent?id=1492&type=01（懷孕第 15 週）
 *
 * 逐週胎兒身長／體重與母體變化：國健署孕產兒關懷網站「懷孕第 N 週」系列（第 1～40 週），
 * 參考資料為《孕媽咪健康手冊》《孕婦衛教手冊》。第 1～20 週為頭臀長，第 21 週起為身長。
 * 例：https://mammy.hpa.gov.tw/Home/NewsKBContent?id=1472&type=01（懷孕第 1 週）
 *
 * 註：本檔的孕期分期採婦產科常用界線（第一期 1–13 週、第二期 14–27 週、第三期 28–40 週）；
 * 國健署手冊的分組略有不同（初期未滿 13 週、中期 13 至未滿 29 週、後期 29 週以上）。
 */

export interface PregnancyGuide {
  week: number;
  title: string;
  summary: string;
  tips: string[];
  warningSignals: string[];
}
