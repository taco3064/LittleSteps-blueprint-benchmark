import { motion } from 'framer-motion';
import { listItem } from '~app/platform/components/Motion';
import { formatDate } from '~app/platform/domain/calendar';
interface ClinicSummaryView11Props {
  data: import('~app/littlesteps/domain/clinicSummary').ClinicSummaryData;
}

export function ClinicSummaryView11({ data }: ClinicSummaryView11Props) {
  return (
    <motion.section variants={listItem} className="panel mb-4">
      <h2>疫苗紀錄</h2>

      {data.administeredVaccines.length === 0
        ? (
            <p className="text-ink-muted text-sm mt-4">尚無接種紀錄</p>
          )
        : (
            <ul className="mt-4 space-y-2">
              {data.administeredVaccines.map((v, idx) => (
                <li
                  key={`${v.name}-${v.dose}-${idx}`}
                  className={
                    'flex items-center justify-between text-sm border-b border-ink/5 '
                    + 'pb-2 last:border-0'
                  }
                >
                  <span className="text-ink">{v.name}</span>
                  <span className="text-ink-muted">
                    {v.date ? formatDate(v.date) : '日期未記錄'}
                  </span>
                </li>
              ))}
            </ul>
          )}

      {data.nextVaccine && (
        <div className={
          'mt-4 p-3 rounded-xl bg-secondary-light '
          + 'border border-secondary/30'
        }
        >
          <p className="text-sm font-medium text-secondary-dark">
            下一劑：
            {data.nextVaccine.name}
            （第
            {' '}
            {data.nextVaccine.doseNumber}
            {' '}
            劑）
          </p>
          <p className="text-sm text-secondary-dark mt-0.5">
            建議時間：
            {data.nextVaccine.timing}
          </p>
        </div>
      )}

      {data.unrecordedNationalDoses !== undefined && (
        // 沒有下一劑時這一段不能空著：醫師看到疫苗段落沒有下一步，讀出來
        // 的是「沒事要談」，而事實是還有這麼多劑公費疫苗沒有紀錄。
        <div className={
          'mt-4 p-3 rounded-xl bg-secondary-light '
          + 'border border-secondary/30'
        }
        >
          <p className="text-sm font-medium text-secondary-dark leading-relaxed">
            尚有
            {' '}
            {data.unrecordedNationalDoses}
            {' '}
            劑公費疫苗沒有記錄，沒有記錄不代表沒打，可對照兒童健康手冊補登
          </p>
        </div>
      )}
    </motion.section>
  );
}
