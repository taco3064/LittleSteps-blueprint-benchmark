import { motion } from 'framer-motion';
import { listItem, stagger } from '~app/platform/components/Motion';
import { ClinicSummaryView11 } from './ClinicSummaryView11';
import { ClinicSummaryView12 } from './ClinicSummaryView12';
import { ClinicSummaryView3 } from './ClinicSummaryView3';
import { ClinicSummaryView6 } from './ClinicSummaryView6';
import { formatDateTime } from './formatDateTime';
interface ClinicSummaryView2Props {
  data: import('~app/littlesteps/domain/clinicSummary').ClinicSummaryData;
  growthRows: {
    date: string;
    weight?: number;
    height?: number;
    headCircumference?: number;
  }[];
  notes: string;
  setNotes: import('react').Dispatch<import('react').SetStateAction<string>>;
  handleShare: () => Promise<void>;
  sharing: boolean;
}

export function ClinicSummaryView2({
  data, growthRows, notes, setNotes, handleShare, sharing,
}: ClinicSummaryView2Props) {
  return (
    <div className="screen">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="screen-body-wide"
      >
        {/* 產生時間是 AppBar 標題沒帶到的資訊，看診時要唸給醫師聽，所以留著。 */}
        <motion.p variants={listItem} className="text-sm text-ink-muted mb-5">
          產生時間：
          {formatDateTime(data.generatedAt)}
        </motion.p>

        {/* ===== Section 1: 寶寶基本資料 ===== */}
        <ClinicSummaryView3 data={data} />

        {/* ===== Section 2: 成長趨勢 ===== */}
        <ClinicSummaryView6 growthRows={growthRows} />

        {/* ===== Section 3: 疫苗紀錄 ===== */}
        <ClinicSummaryView11 data={data} />

        {/* ===== Section 4: 近 7 天日常摘要 ===== */}
        <ClinicSummaryView12 data={data} />

        {/* ===== 完整健康時間軸 =====
            上面幾段是分項摘要，這一段是一條線：產檢、疫苗、成長、兒童健檢
            按日期排在一起。這份摘要原本只涵蓋四種紀錄裡的兩種，講到出生就斷了，
            而醫師想看的正是連續。 */}
        {data.healthTimeline.length > 0 && (
          <motion.section variants={listItem} className="panel mb-4">
            <h2>完整健康紀錄</h2>
            <ul className="mt-4 space-y-2">
              {data.healthTimeline.map((event) => (
                <li key={event.id} className="flex items-baseline gap-3 text-sm">
                  <span className="text-ink-faint shrink-0 tabular-nums">
                    {event.date || '未記日期'}
                  </span>
                  <span className="text-ink">
                    {event.title}
                    {event.location && (
                      <span className="text-ink-muted">
                        （
                        {event.location}
                        ）
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* ===== Section 5: 特殊事項 ===== */}
        <motion.section variants={listItem} className="panel mb-4">
          <h2>特殊事項</h2>
          {/* 這一欄不存進資料庫，所以要講清楚它只活到分享出去為止——否則
              家長會以為打完就記下來了，下次回診打開卻是空的。 */}
          <p className="text-sm text-ink-muted mt-1">
            只用於這次看診，不會儲存；按下方按鈕分享時會一起帶出去。
          </p>

          <textarea
            className={
              'w-full mt-4 p-4 rounded-xl border border-ink/10 bg-warm-white '
              + 'text-base text-ink placeholder-ink-faint resize-none'
            }
            rows={4}
            placeholder="可在此記錄要告知醫師的事項..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </motion.section>

        {/* 這一頁號稱「一鍵產生看診資料」，在此之前卻沒有任何帶得走的出口。 */}
        <motion.div variants={listItem} className="pb-4">
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="btn-primary w-full"
          >
            分享看診摘要
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
