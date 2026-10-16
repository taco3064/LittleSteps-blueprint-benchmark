import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus } from 'lucide-react';
import { isCorrecting } from '~app/family/domain/correctedAge';
import { ChildProfile } from '~app/family/domain/familyRecords';
import { VaccineSchedule } from '~app/knowledge/domain/referenceModels';
import {
  vaccineContraindications,
  vaccineGuidelines,
  vaccineSchedules,
} from '~app/knowledge/domain/vaccines';
import { stagger, tap } from '~app/platform/components/Motion';
import { FUNDING_FILTERS } from './FUNDING_FILTERS';
import { FundingFilter } from './FundingFilter';
import { MonthFilter } from './MonthFilter';
import { Sheet } from './Sheet';
import { VaccineMonthGroup } from './VaccineMonthGroup';
import { VaccineTrackingView1 } from './VaccineTrackingView1';
import { VaccineTrackingView11 } from './VaccineTrackingView11';
import { VaccineTrackingView14 } from './VaccineTrackingView14';
import { VaccineTrackingView4 } from './VaccineTrackingView4';
import { VaccineTrackingView8 } from './VaccineTrackingView8';
import { VaccineTrackingView9 } from './VaccineTrackingView9';
import { getSeverityColor } from './severityColor';
interface VaccineTrackingViewProps {
  currentChild: ChildProfile | null | undefined;
  setShowReferences: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
  showReferences: boolean;
  setShowEmergencies: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
  setShowContraindications: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
  setShowVaccineTypes: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
  setShowGuidelines: import('react').Dispatch<
    import('react').SetStateAction<boolean>
  >;
  setFundingFilter: import('react').Dispatch<
    import('react').SetStateAction<FundingFilter>
  >;
  fundingFilter: FundingFilter;
  scrollerRef: import('react').RefObject<HTMLDivElement>;
  monthFilter: MonthFilter;
  selectedRef: import('react').RefObject<HTMLButtonElement>;
  pickMonth: (value: MonthFilter) => void;
  availableMonths: number[];
  filteredVaccines: VaccineSchedule[];
  outstanding: import('~app/family/domain/vaccineSchedule').ResolvedVaccineDose[];
  exportDoses: (schedules: VaccineSchedule[], label: string) => void;
  vaccinesByMonth: { [key: number]: VaccineSchedule[] };
  isDoseAdministered: (vaccineId: string, doseNumber: number) => boolean;
  getDoseDate: (vaccineId: string, doseNumber: number) => string | undefined;
  setEditingDose: import('react').Dispatch<
    import('react').SetStateAction<{
      vaccineId: string;
      doseNumber: number;
      administered: boolean;
      currentDate?: string;
    } | null>
  >;
  canExport: boolean;
  showEmergencies: boolean;
  showContraindications: boolean;
  showVaccineTypes: boolean;
  showGuidelines: boolean;
  editingDose: {
    vaccineId: string;
    doseNumber: number;
    administered: boolean;
    currentDate?: string;
  } | null;
  onSetVaccineDose: (dose: {
    vaccineId: string;
    doseNumber: number;
    administered: boolean;
    date?: string;
  }) => void;
}

export function VaccineTrackingView({
  currentChild, setShowReferences, showReferences, setShowEmergencies,
  setShowContraindications, setShowVaccineTypes, setShowGuidelines, setFundingFilter,
  fundingFilter, scrollerRef, monthFilter, selectedRef, pickMonth, availableMonths,
  filteredVaccines, outstanding, exportDoses, vaccinesByMonth, isDoseAdministered,
  getDoseDate, setEditingDose, canExport, showEmergencies, showContraindications,
  showVaccineTypes, showGuidelines, editingDose, onSetVaccineDose,
}: VaccineTrackingViewProps) {
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
        <VaccineTrackingView1
          setShowReferences={setShowReferences}
          showReferences={showReferences}
          setShowEmergencies={setShowEmergencies}
          setShowContraindications={setShowContraindications}
          setShowVaccineTypes={setShowVaccineTypes}
          setShowGuidelines={setShowGuidelines}
        />

        {/* 兩排篩選器的標題（「篩選疫苗類型」「月齡篩選」）拿掉了：chip 本身
            就說明了它在篩什麼，標題只是多佔兩行。代價是兩排的第一顆都叫「全部」，
            照著控制項瀏覽的人聽到的是兩顆一模一樣的切換鈕，而且沒有列名可以退
            回去分辨——所以那兩顆各自帶 aria-label。標籤刻意包含看得見的「全部」
            兩個字：語音控制是照畫面上的字比對的，「全部月齡」對得上，「月齡篩
            選：全部」對不上。 */}
        <VaccineTrackingViewSection1
          setFundingFilter={setFundingFilter}
          fundingFilter={fundingFilter}
        />

        <VaccineTrackingView4
          scrollerRef={scrollerRef}
          monthFilter={monthFilter}
          selectedRef={selectedRef}
          pickMonth={pickMonth}
          availableMonths={availableMonths}
        />

        {/* Vaccine Timeline - Grouped by Month */}
        <VaccineTrackingViewSection2 filteredVaccines={filteredVaccines} />

        {outstanding.length > 0 && (
          <VaccineTrackingViewSection3
            exportDoses={exportDoses}
            outstanding={outstanding}
          />
        )}

        <VaccineDoseList
          fundingFilter={fundingFilter}
          monthFilter={monthFilter}
          vaccinesByMonth={vaccinesByMonth}
          isDoseAdministered={isDoseAdministered}
          getDoseDate={getDoseDate}
          setEditingDose={setEditingDose}
          canExport={canExport}
          exportDoses={exportDoses}
        />

        {/* Side Effects Reference */}
        <h2 className="mt-8 mb-4">副作用處理指南</h2>

        <VaccineTrackingView8 getSeverityColor={getSeverityColor} />
      </div>

      {/* Emergency Sheet */}
      <VaccineTrackingView9
        showEmergencies={showEmergencies}
        setShowEmergencies={setShowEmergencies}
      />

      {/* Contraindications Sheet */}
      <VaccineTrackingViewSection4
        showContraindications={showContraindications}
        setShowContraindications={setShowContraindications}
      />

      {/* Vaccine Types Sheet */}
      <VaccineTrackingView11
        showVaccineTypes={showVaccineTypes}
        setShowVaccineTypes={setShowVaccineTypes}
      />

      {/* Guidelines Sheet */}
      <VaccineTrackingViewSection5
        showGuidelines={showGuidelines}
        setShowGuidelines={setShowGuidelines}
      />

      {/* Date Editing Sheet */}
      <VaccineTrackingView14
        editingDose={editingDose}
        setEditingDose={setEditingDose}
        onSetVaccineDose={onSetVaccineDose}
      />
    </div>
  );
}

function VaccineTrackingViewSection1({
  setFundingFilter, fundingFilter,
}: Pick<VaccineTrackingViewProps, 'setFundingFilter' | 'fundingFilter'>) {
  return (
    <div className="flex gap-2 mb-2">
      {FUNDING_FILTERS.map((option) => (
        <button
          key={option.value}
          onClick={() => setFundingFilter(option.value)}
          aria-label={option.ariaLabel}
          aria-pressed={fundingFilter === option.value}
          className={`chip flex-1 justify-center ${fundingFilter === option.value ? 'chip-on' : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function VaccineTrackingViewSection2({
  filteredVaccines,
}: Pick<VaccineTrackingViewProps, 'filteredVaccines'>) {
  return (
    <div className="flex items-baseline gap-2 mb-4">
      <h2>接種時程</h2>
      <span className="text-sm text-ink-muted">
        （共
        {filteredVaccines.length}
        {' '}
        項）
      </span>
    </div>
  );
}

function VaccineTrackingViewSection3({
  exportDoses, outstanding,
}: Pick<VaccineTrackingViewProps, 'exportDoses' | 'outstanding'>) {
  return (
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
  );
}

function VaccineTrackingViewSection4({
  showContraindications, setShowContraindications,
}: Pick<
  VaccineTrackingViewProps,
  'showContraindications' | 'setShowContraindications'
>) {
  return (
    <AnimatePresence>
      {showContraindications && (
        <Sheet
          title="接種禁忌與注意事項"
          onClose={() => setShowContraindications(false)}
        >
          {vaccineContraindications.map((section, idx) => (
            <div key={idx} className="card">
              <h3 className="mb-3">{section.title}</h3>
              <ul className="space-y-1.5 list-disc pl-5 marker:text-primary">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-sm text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Sheet>
      )}
    </AnimatePresence>
  );
}

function VaccineTrackingViewSection5({
  showGuidelines, setShowGuidelines,
}: Pick<VaccineTrackingViewProps, 'showGuidelines' | 'setShowGuidelines'>) {
  return (
    <AnimatePresence>
      {showGuidelines && (
        <Sheet title="疫苗接種指南" onClose={() => setShowGuidelines(false)}>
          {vaccineGuidelines.map((section, idx) => (
            <div key={idx} className="card">
              <h3 className="mb-3">{section.title}</h3>
              <ul className="space-y-1.5 list-disc pl-5 marker:text-mint">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-sm text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Sheet>
      )}
    </AnimatePresence>
  );
}

function VaccineDoseList({
  fundingFilter, monthFilter, vaccinesByMonth, isDoseAdministered, getDoseDate,
  setEditingDose, canExport, exportDoses,
}: Pick<
  VaccineTrackingViewProps,
  | 'fundingFilter'
  | 'monthFilter'
  | 'vaccinesByMonth'
  | 'isDoseAdministered'
  | 'getDoseDate'
  | 'setEditingDose'
  | 'canExport'
  | 'exportDoses'
>) {
  return (
    <AnimatePresence mode="popLayout">
      {/* Re-keying on the filters replays the stagger so a chip tap reads as
              a new list arriving. */}
      <motion.div
        key={`${fundingFilter}-${monthFilter}`}
        className="space-y-6"
        variants={stagger}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
      >
        {Object.keys(vaccinesByMonth)
          .sort((a, b) => Number(a) - Number(b))
          .map((monthKey) => {
            const month = Number(monthKey);
            const vaccines = vaccinesByMonth[month];

            return (
              <VaccineMonthGroup
                monthKey={monthKey}
                month={month}
                vaccines={vaccines}
                isDoseAdministered={isDoseAdministered}
                getDoseDate={getDoseDate}
                setEditingDose={setEditingDose}
                canExport={canExport}
                exportDoses={exportDoses}
              />
            );
          })}
      </motion.div>
    </AnimatePresence>
  );
}
