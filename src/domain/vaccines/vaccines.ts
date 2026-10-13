import { entryHepbBirth, entryHepb1m, entryHepb6m } from './hepbSchedules';
import { entryRsvMonthlyBirth, entryRsvBirth } from './rsvSchedules';
import {
  entryPentavalent2m,
  entryPentavalent4m,
  entryPentavalent6m,
  entryPentavalent18m,
} from './pentavalentSchedules';
import {
  entryPneumococcal2m,
  entryPneumococcal4m,
  entryPneumococcalHighrisk6m,
  entryPneumococcal15v6m,
  entryPneumococcal12m,
} from './pneumococcalSchedules';
import {
  entryRotavirus2m,
  entryRotavirus3dose2m,
  entryRotavirus4m,
  entryRotavirus3dose4m,
  entryRotavirus3dose6m,
} from './rotavirusSchedules';
import { entryMenb2m, entryMenb4m } from './menbSchedules';
import { entryBcg5m } from './bcgSchedules';
import { entryHexavalent6m, entryHexavalent18m } from './hexavalentSchedules';
import { entryMmr12m, entryMmr5y } from './mmrSchedules';
import { entryVaricella12m, entryVaricella5y } from './varicellaSchedules';
import { entryHepa12m, entryHepa18m } from './hepaSchedules';
import { entryFlu1y } from './fluSchedules';
import { entryJe15m, entryJe27m } from './jeSchedules';
import { entryTdap5y } from './tdapSchedules';
import { entryEnterovirus, entryEnterovirus2 } from './enterovirusSchedules';
import { VaccineSchedule } from '../records';
export * from './vaccineSafety';

/**
 * 疫苗接種時程表。
 *
 * 2026-09-04 查證：逐劑對照疾管署「現行兒童預防接種時程表(兒童常規疫苗)」
 * 與各支疫苗的「疫苗簡介」頁面，每一劑的 sourceUrl 就是它的出處。
 *
 * 第一個例外：六合一（五合一的自費升級版）疾管署沒有專頁——自費疫苗項目頁只
 * 舉了輪狀病毒與腸病毒 A71。那兩劑引用的是五合一（DTaP-Hib-IPV）頁，它涵蓋
 * 的是這一劑替代掉的公費時程，不是這個自費產品本身。寧可標得出處不完整，
 * 也不編一個看起來對的網址。
 *
 * 第二個例外：pneumococcal-highrisk-6m 的 sourceUrl 指的不是它那句條文的出
 * 處。條文與公費身分出自 PCV13 的「疫苗簡介」頁（公費疫苗 →
 * https://www.cdc.gov.tw/Category/Page/mIlV6UzT8mIK49ADAOjz2w ），sourceUrl
 * 指的是那一頁在條文後面連出去的 ICD code 參考表——誰算高危險群由那張表認
 * 定，這是 #33 刻意的選擇（見那一列上方的註解）。
 *
 * 這一列 2026-09-06 新增時連不上疾管署（www.cdc.gov.tw 一律 403），四個欄
 * 位都待覆核，追蹤在 issue #73。2026-09-07 在連得到的環境上逐頁核完（#73）：
 * 「疫苗簡介」頁（最後更新 2026/2/11）在標題「公費對象及接種時程」底下寫的
 * 是「自104年1月起全面推動嬰幼兒接種3劑PCV13，接種時程依序為出生滿2個月、
 * 4個月及12-15個月，如為高危險群對象，出生滿6個月時可增加接種1劑。」——
 * eligibility 引的就是這一句，逐字相符；公費而且仍然限高危險群（不是全面
 * 適用、也沒有變成自費），所以 funding: "national" 加 eligibility 是對的；
 * 常規時程還是 2、4、12-15 個月共 3 劑，所以這一列的 doses: 1 站得住；
 * sourceUrl 打開仍是「幼童肺炎鏈球菌高危險群之ICD code參考表」（最後更新
 * 2025/3/10）。
 *
 * funding 不是布林：見 VaccineFunding。nhi-conditional 與 local-varies 一定
 * 要附 eligibility，而且逐字引用來源的用語。
 *
 * 已公告、但還沒生效的付費方式改變寫在 fundingChangesOn。檔頭的查證日期擋不
 * 住這一種錯：改變日就落在保鮮期裡，檔案到那天都還算「新鮮」，funding 卻已
 * 經是錯的。標了日期，測試會在那天之後轉紅。
 */
export const vaccineSchedules: VaccineSchedule[] = [
  entryHepbBirth,
  entryRsvMonthlyBirth,
  entryRsvBirth,
  entryHepb1m,
  entryHepb6m,
  entryPentavalent2m,
  entryPneumococcal2m,
  entryRotavirus2m,
  entryRotavirus3dose2m,
  entryPentavalent4m,
  entryPneumococcal4m,
  entryRotavirus4m,
  entryRotavirus3dose4m,
  entryMenb2m,
  entryMenb4m,
  entryBcg5m,
  entryPentavalent6m,
  entryRotavirus3dose6m,
  entryHexavalent6m,
  entryPneumococcalHighrisk6m,
  entryPneumococcal15v6m,
  entryPneumococcal12m,
  entryMmr12m,
  entryVaricella12m,
  entryHepa12m,
  entryFlu1y,
  entryPentavalent18m,
  entryHexavalent18m,
  entryHepa18m,
  entryJe15m,
  entryJe27m,
  entryMmr5y,
  entryVaricella5y,
  entryTdap5y,
  entryEnterovirus,
  entryEnterovirus2,
];
