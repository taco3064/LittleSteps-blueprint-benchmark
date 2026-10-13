import { motion } from 'framer-motion';
import {
  CalendarPlus,
} from 'lucide-react';

import { isCorrecting } from '~app/domain/correctedAge';
import {
  tap,
} from '~app/domain/motion';
import {
  vaccineSchedules,
} from '~app/domain/vaccines';

import { useVaccineModel, type VaccineTrackingPageProps } from './useVaccineModel';
import { VaccineContraindicationsSheet } from './VaccineContraindicationsSheet';
import { VaccineDateSheet } from './VaccineDateSheet';
import { VaccineEmergencySheet } from './VaccineEmergencySheet';
import { VaccineFundingFilter } from './VaccineFundingFilter';
import { VaccineGuidelinesSheet } from './VaccineGuidelinesSheet';
import { VaccineMonthFilter } from './VaccineMonthFilter';
import { VaccineReferenceMenu } from './VaccineReferenceMenu';
import { VaccineSideEffects } from './VaccineSideEffects';
import { VaccineTimeline } from './VaccineTimeline';
import { VaccineTypesSheet } from './VaccineTypesSheet';

export default function VaccineTrackingPage(props: VaccineTrackingPageProps) {
  const model = useVaccineModel(props);
  const { currentChild, outstanding, exportDoses, filteredVaccines } = model;

  return (
    <div className="screen">
      <div className="screen-body">
        {/* 早產寶寶的家長會發現生長曲線用矯正年齡、這一頁卻不是，於是懷疑
            哪一邊算錯了。差別是真的：公費疫苗的時程依出生日期排定，早產兒
            不例外。與其讓家長自己拼湊，不如在這裡講清楚。 */}
        {currentChild && isCorrecting(currentChild) && (
          <p className="card mb-4 text-sm text-ink-muted">
            公費疫苗與兒童健檢的時程依
            <strong className="text-ink">實際出生日期</strong>
            計算，不因早產而延後。生長曲線與發展檢核用的才是矯正年齡。
          </p>
        )}
        {/* 四張參考表原本是四顆固定按鈕，加上兩排篩選器，在 390px 上吃掉
            將近一半的畫面才看到第一劑疫苗。參考表是偶爾才查的東西，收進
            一個可展開的列；篩選器留在外面，因為它們每次都要用。 */}
        <VaccineReferenceMenu model={model} />

        {/* 兩排篩選器的標題（「篩選疫苗類型」「月齡篩選」）拿掉了：chip 本身
            就說明了它在篩什麼，標題只是多佔兩行。代價是兩排的第一顆都叫「全部」，
            照著控制項瀏覽的人聽到的是兩顆一模一樣的切換鈕，而且沒有列名可以退
            回去分辨——所以那兩顆各自帶 aria-label。標籤刻意包含看得見的「全部」
            兩個字：語音控制是照畫面上的字比對的，「全部月齡」對得上，「月齡篩
            選：全部」對不上。 */}
        <VaccineFundingFilter model={model} />

        <VaccineMonthFilter model={model} />

        {/* Vaccine Timeline - Grouped by Month */}
        <div className="flex items-baseline gap-2 mb-4">
          <h2>接種時程</h2>
          <span className="text-sm text-ink-muted">
            {'（共 '}
            {filteredVaccines.length}
            {' 項）'}
          </span>
        </div>

        {outstanding.length > 0 && (
          <motion.button
            type="button"
            whileTap={tap}
            onClick={() => exportDoses(vaccineSchedules, '疫苗接種時程')}
            className="btn-secondary w-full mb-4 text-sm"
          >
            <CalendarPlus className="w-4 h-4" />
            匯出未接種的
            {' '}
            {outstanding.length}
            {' '}
            劑到行事曆
          </motion.button>
        )}

        <VaccineTimeline model={model} />

        {/* Side Effects Reference */}
        <h2 className="mt-8 mb-4">副作用處理指南</h2>

        <VaccineSideEffects model={model} />
      </div>

      {/* Emergency Sheet */}
      <VaccineEmergencySheet model={model} />

      {/* Contraindications Sheet */}
      <VaccineContraindicationsSheet model={model} />

      {/* Vaccine Types Sheet */}
      <VaccineTypesSheet model={model} />

      {/* Guidelines Sheet */}
      <VaccineGuidelinesSheet model={model} />

      {/* Date Editing Sheet */}
      <VaccineDateSheet model={model} />
    </div>
  );
}
